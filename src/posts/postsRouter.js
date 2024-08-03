const postRouter = require("express").Router();
const authenticateJWT = require("../middleware/authMiddleware");
const {
  getPosts,
  getPost,
  addPost,
  updatePost,
  updatePostContent,
  deletePostContent,
  addPostContent,
  deletePost,
  searchPostByTitle,
} = require("./postsController");

postRouter.get("/", getPosts);
postRouter.get("/:id", getPost);
postRouter.post("/", authenticateJWT, addPost);
postRouter.post("/:id/content", authenticateJWT, addPostContent);
postRouter.put("/:id", authenticateJWT, updatePost);
postRouter.put("/:id/content/:post_id", authenticateJWT, updatePostContent);
postRouter.delete("/:post_id/content/:id", authenticateJWT, deletePostContent);
postRouter.delete("/:id", authenticateJWT, deletePost);
postRouter.post("/searchByTitle", searchPostByTitle);
module.exports = postRouter;
