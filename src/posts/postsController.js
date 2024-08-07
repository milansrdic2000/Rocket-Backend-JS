const asyncHandler = require("express-async-handler");
const db = require("../db/db");

const addPostContent = asyncHandler(async (req, res) => {
  const {
    htmlSrb,
    htmlEng,
    elementType,
    serial_number: serialNumber,
  } = req.body;
  if (elementType === "text")
    db.query(
      "INSERT INTO post_content (post_id, htmlSrb,htmlEng, elementType,serial_number) VALUES (?, ?,?, ?, ?)",
      [req.params.id, htmlSrb, htmlEng, elementType, serialNumber],
      (err, results, fields) => {
        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).send({ success: false, data: err });
        }
        res.status(200).json({ success: true, data: results });
      }
    );
  else if (elementType === "image") {
    db.query(
      "INSERT INTO post_content (post_id, elementType,serial_number,imgUrl,imgProperties,imgWrapperProperties) VALUES ( ?, ?, ?, ?, ?, ?)",
      [
        req.params.id,
        elementType,
        serialNumber,
        req.body.imgUrl,
        JSON.stringify(req.body.imgProperties),
        JSON.stringify(req.body.imgWrapperProperties),
      ],
      (err, results, fields) => {
        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).send({ success: false, data: err });
        }
        res.status(200).json({ success: true, data: results });
      }
    );
  }
});
const updatePostContent = asyncHandler(async (req, res) => {
  const {
    htmlSrb,
    htmlEng,
    elementType,
    serial_number: serialNumber,
  } = req.body;
  if (elementType === "text")
    db.query(
      "UPDATE post_content SET htmlSrb = ?,htmlEng=?, elementType = ?, serial_number=? WHERE id = ? and post_id = ?",
      [
        htmlSrb,
        htmlEng,
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
  else if (elementType === "image") {
    db.query(
      "UPDATE post_content SET elementType = ?, serial_number=?, imgUrl=?, imgProperties=?, imgWrapperProperties=? WHERE id = ? and post_id = ?",
      [
        req.body.elementType,
        req.body.serial_number,
        req.body.imgUrl,
        JSON.stringify(req.body.imgProperties),
        JSON.stringify(req.body.imgWrapperProperties),
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
  }
});
const updatePost = asyncHandler(async (req, res) => {
  db.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .json({ status: false, data: "Error beginning transaction" });
    }
    // update post
    db.query(
      "UPDATE posts SET titleSrb = ?,titleEng=?, date=?, category = ? WHERE id = ?",
      [
        req.body.titleSrb,
        req.body.titleEng,
        req.body.date,
        req.body.category,
        req.params.id,
      ],
      (err, results, fields) => {
        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).send({ success: false, data: err });
        }

        // update post content
        let errorCount = 0;
        const updateContentTasks = req.body.contents.map((content) => {
          return (callback) => {
            const {
              htmlSrb,
              htmlEng,
              elementType,
              serial_number: serialNumber,
              imgUrl,
              imgProperties,
              imgWrapperProperties,
              id,
              crudMode,
            } = content;
            if (elementType === "text") {
              if (crudMode === "update")
                db.query(
                  "UPDATE post_content SET htmlSrb = ?,htmlEng=?, elementType = ?, serial_number=? WHERE id = ? and post_id = ?",
                  [
                    htmlSrb,
                    htmlEng,
                    elementType,
                    serialNumber,
                    id,
                    req.params.id,
                  ],
                  callback
                );
              else if (crudMode === "create") {
                db.query(
                  "INSERT INTO post_content (post_id, htmlSrb,htmlEng, elementType,serial_number) VALUES (?, ?, ?, ?, ?)",
                  [req.params.id, htmlSrb, htmlEng, elementType, serialNumber],
                  callback
                );
              }
            } else if (elementType === "image") {
              if (crudMode === "create") {
                db.query(
                  "INSERT INTO post_content (post_id, elementType,serial_number,imgUrl,imgProperties,imgWrapperProperties) VALUES ( ?, ?, ?, ?, ?, ?)",
                  [
                    req.params.id,
                    elementType,
                    serialNumber,
                    imgUrl,
                    JSON.stringify(imgProperties),
                    JSON.stringify(imgWrapperProperties),
                  ],
                  callback
                );
              } else if (crudMode === "update") {
                db.query(
                  "UPDATE post_content SET elementType = ?, serial_number=?, imgUrl=?, imgProperties=?, imgWrapperProperties=? WHERE id = ? and post_id = ?",
                  [
                    elementType,
                    serialNumber,
                    imgUrl,
                    JSON.stringify(imgProperties),
                    JSON.stringify(imgWrapperProperties),
                    id,
                    req.params.id,
                  ],
                  callback
                );
              }
            }
          };
        });

        // Execute all content insertions in series
        executeInSeries(updateContentTasks, (err) => {
          if (err) {
            db.rollback(() => {
              console.error("Error updating post content:", err);
            });
            errorCount++;
            if (errorCount <= 1)
              return res
                .status(500)
                .json({ status: false, data: "Error updating" });
          }

          // Commit the transaction
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error("Error committing transaction:", err);
              });
              if (errorCount <= 1)
                return res
                  .status(500)
                  .json({ status: false, data: "Error committing" });
            }
            if (errorCount <= 1)
              res.json({ status: true, data: "Post updated successfully" });
          });
        });
      }
    );
  });
});
const getPosts = asyncHandler(async (req, res) => {
  const { pageNumber = 1, pageSize = 1, category, random } = req.query;

  const offset = (+pageNumber - 1) * pageSize;

  let query = `select p.*, c.*,p.id as post_id1 from posts p left join post_content c on p.id = c.post_id `;
  query += category ? `where p.category = ${category} ` : "";
  query += `order by p.date desc`;

  db.query(query, (err, results, fields) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send(results);
    }
    const posts = mapPosts(results);
    const numOfPages = Math.ceil(posts.length / pageSize);

    let paginatedPosts;

    paginatedPosts = random
      ? posts.sort(() => Math.random() - 0.5).slice(0, pageSize)
      : posts.slice(offset, offset + pageSize);

    res
      .status(200)
      .json({ success: true, data: { posts: paginatedPosts, numOfPages } });
  });
});
const getPost = asyncHandler(async (req, res) => {
  db.query(
    "select p.*, c.* , p.id as post_id1 from posts p left join post_content c on p.id = c.post_id where p.id = ?",
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
const searchPostByTitle = asyncHandler(async (req, res) => {
  const { language, searchTerm } = req.body;
  const query = `select p.id, p.titleSrb, p.titleEng from posts p where p.${
    language === "srb" ? "titleSrb" : "titleEng"
  } like ?`;
  db.query(query, [`%${searchTerm}%`], (err, results, fields) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send(results);
    }

    res.status(200).json({ success: true, data: results });
  });
});
const addPost = asyncHandler(async (req, res) => {
  const { titleSrb, titleEng, date, contents, category } = req.body;
  db.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .json({ status: false, data: "Error beginning transaction" });
    }

    // Insert the post
    db.query(
      "INSERT INTO posts (titleSrb,titleEng, date,category) VALUES (?,?, ?, ?)",
      [titleSrb, titleEng, date, category],
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
            const {
              htmlSrb,
              htmlEng,
              elementType,
              serial_number: serialNumber,
              imgUrl,
              imgProperties,
              imgWrapperProperties,
            } = content;
            if (elementType === "text")
              db.query(
                "INSERT INTO post_content (post_id, htmlSrb, htmlEng, elementType,serial_number) VALUES (?, ?, ?, ?, ?)",
                [postId, htmlSrb, htmlEng, elementType, serialNumber],
                callback
              );
            else if (elementType === "image") {
              db.query(
                "INSERT INTO post_content (post_id, elementType,serial_number,imgUrl,imgProperties,imgWrapperProperties) VALUES ( ?, ?, ?, ?, ?, ?)",
                [
                  postId,
                  elementType,
                  serialNumber,
                  imgUrl,
                  JSON.stringify(imgProperties),
                  JSON.stringify(imgWrapperProperties),
                ],
                callback
              );
            }
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
const deletePost = asyncHandler(async (req, res) => {
  db.query(
    "DELETE FROM posts WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).send({ success: false, data: err });
      }
      res.status(200).json({ success: true, data: results });
    }
  );
});
const deletePostContent = asyncHandler(async (req, res) => {
  db.query(
    "DELETE FROM post_content WHERE id = ? and post_id = ?",
    [req.params.id, req.params.post_id],
    (err, results, fields) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).send({ success: false, data: err });
      }
      res.status(200).json({ success: true, data: results });
    }
  );
});
function mapPosts(results) {
  const postsMap = new Map();
  results.forEach((row) => {
    const postId = row.post_id1;

    if (!postsMap.has(postId)) {
      postsMap.set(postId, {
        id: postId,
        titleSrb: row.titleSrb,
        titleEng: row.titleEng,
        date: row.date,
        category: row.CATEGORY,
        contents: [],
      });
    }

    const post = postsMap.get(postId);
    //post_id is from post table, if its null then its empty post
    if (!row.post_id) return;

    post.contents.push({
      id: row.id,
      post_id: row.post_id,
      serial_number: row.serial_number,
      ...(row.elementType === "text" && {
        htmlSrb: row.htmlSrb,
        htmlEng: row.htmlEng,
      }),
      ...(row.elementType === "image" && {
        imgUrl: row.imgUrl,
      }),
      ...(row.elementType === "image" && {
        imgProperties: JSON.parse(row.imgProperties),
      }),
      ...(row.elementType === "image" && {
        imgWrapperProperties: JSON.parse(row.imgWrapperProperties),
      }),
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
  deletePostContent,
  updatePost,
  updatePostContent,
  addPostContent,
  deletePost,
  searchPostByTitle,
};
