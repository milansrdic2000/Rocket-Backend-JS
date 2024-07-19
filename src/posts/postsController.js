const asyncHandler = require("express-async-handler");
const db = require("../db/db");
const getPosts = asyncHandler(async (req, res) => {
  db.query("SELECT * FROM posts", (err, results, fields) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send(results);
    }
    res.status(200).send(results);
  });
});

const addPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  db.query(
    "INSERT INTO posts (title, date) VALUES (?, ?)",
    [title, new Date()],
    (err, results, fields) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send(results);
      }
      res.status(200).send(results);
    }
  );
});

module.exports = {
  getPosts,
  addPost,
};
