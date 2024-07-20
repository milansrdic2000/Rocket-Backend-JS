const postRouter = require("express").Router();
const {
  getPosts,
  getPost,
  addPost,
  updatePost,
  updatePostContent,
  deletePostContent,
  addPostContent,
  deletePost,
} = require("./postsController");

postRouter.get("/", getPosts);
postRouter.get("/:id", getPost);
postRouter.post("/", addPost);
postRouter.post("/:id/content", addPostContent);
postRouter.put("/:id", updatePost);
postRouter.put("/:id/content/:post_id", updatePostContent);
postRouter.delete("/:post_id/content/:id", deletePostContent);
postRouter.delete("/:id", deletePost);
module.exports = postRouter;
