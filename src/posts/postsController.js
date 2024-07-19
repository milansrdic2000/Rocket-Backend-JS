const asyncHandler = require("express-async-handler");
const db = require("../db/db");
const getPosts = asyncHandler(async (req, res) => {
  db.query("SELECT * FROM posts", (err, results, fields) => {
    if (err) {
      console.error("Error executing query:", err);
      return;
    }
    res.status(200).send(results);
  });
});

module.exports = {
  getPosts,
};
