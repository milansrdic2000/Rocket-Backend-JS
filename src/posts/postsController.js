const asyncHandler = require("express-async-handler");
const db = require("../db/db");

const updatePostContent = asyncHandler(async (req, res) => {
  const { html, elementType, serial_number: serialNumber } = req.body;
  db.query(
    "UPDATE post_content SET html = ?, elementType = ?, serial_number=? WHERE id = ? and post_id = ?",
    [
      req.body.html,
      req.body.elementType,
      req.body.serial_number,
      req.body.id,
      req.params.id,
    ],
    (err, results, fields) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).send({ success: false, data: err });
      }
      res.status(200).json({ success: true, data: results });
    }
  );
});
const updatePost = asyncHandler(async (req, res) => {
  db.query(
    "UPDATE posts SET title = ?, date=? WHERE id = ?",
    [req.body.title, req.body.date, req.params.id],
    (err, results, fields) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).send({ success: false, data: err });
      }
      res.status(200).json({ success: true, data: results });
    }
  );
});
const getPosts = asyncHandler(async (req, res) => {
  db.query(
    "select p.*, c.* from posts p inner join post_content c on p.id = c.post_id",
    (err, results, fields) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send(results);
      }
      const posts = mapPosts(results);
      res.status(200).json({ success: true, data: posts });
    }
  );
});
const getPost = asyncHandler(async (req, res) => {
  db.query(
    "select p.*, c.* from posts p inner join post_content c on p.id = c.post_id where p.id = ?",
    [req.params.id],
    (err, results, fields) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send(results);
      }
      const post = mapPosts(results)[0];
      if (!post) {
        return res.status(404).json({ success: false, data: "Post not found" });
      }
      res.status(200).json({ success: true, data: post });
    }
  );
});
const addPost = asyncHandler(async (req, res) => {
  const { title, contents } = req.body;
  db.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .json({ status: false, data: "Error beginning transaction" });
    }

    // Insert the post
    db.query(
      "INSERT INTO posts (title, date) VALUES (?, CURDATE())",
      [title],
      (err, postResult) => {
        if (err) {
          db.rollback(() => {
            console.error("Error inserting post:", err);
          });
          return res
            .status(500)
            .json({ status: false, data: "Error inserting" });
        }

        const postId = postResult.insertId;

        // Insert the post content
        const insertContentTasks = contents.map((content) => {
          return (callback) => {
            const { html, elementType, serial_number: serialNumber } = content;
            db.query(
              "INSERT INTO post_content (post_id, html, elementType,serial_number) VALUES (?, ?, ?, ?)",
              [postId, html, elementType, serialNumber],
              callback
            );
          };
        });

        // Execute all content insertions in series
        executeInSeries(insertContentTasks, (err) => {
          if (err) {
            db.rollback(() => {
              console.error("Error inserting post content:", err);
            });
            return res
              .status(500)
              .json({ status: false, data: "Error inserting" });
          }

          // Commit the transaction
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error("Error committing transaction:", err);
              });
              return res
                .status(500)
                .json({ status: false, data: "Error committing" });
            }
            res.json({ status: true, data: "Post added successfully" });
          });
        });
      }
    );
  });
});
function mapPosts(results) {
  const postsMap = new Map();
  results.forEach((row) => {
    const postId = row.post_id;

    if (!postsMap.has(postId)) {
      postsMap.set(postId, {
        id: postId,
        title: row.title,
        date: row.date,
        contents: [],
      });
    }

    const post = postsMap.get(postId);
    post.contents.push({
      id: row.id,
      post_id: row.post_id,
      serial_number: row.serial_number,
      html: row.html,
      elementType: row.elementType,
    });
  });
  const posts = Array.from(postsMap.values());
  return posts;
}
function executeInSeries(tasks, callback) {
  let index = 0;

  function next(err) {
    if (err || index === tasks.length) {
      return callback(err);
    }
    const task = tasks[index++];
    task(next);
  }

  next();
}
module.exports = {
  getPosts,
  addPost,
  getPost,
  updatePost,
  updatePostContent,
};
