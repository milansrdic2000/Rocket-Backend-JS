const postRouter = require("express").Router();
const {
  getPosts,
  getPost,
  addPost,
  updatePost,
  updatePostContent,
} = require("./postsController");

postRouter.get("/", getPosts);
postRouter.get("/:id", getPost);
postRouter.post("/", addPost);
postRouter.put("/:id", updatePost);
postRouter.put("/:id/content/:post_id", updatePostContent);
module.exports = postRouter;
