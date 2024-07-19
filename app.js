const http = require("http");
const express = require("express");

const hostname = "127.0.0.1";
const port = 3000;

const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../../public_html/uploads");

const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
app.use(bodyParser.json());
app.use(cors());

const addMessage = require("./src/contact/contact");
const { getPosts, addPost } = require("./src/posts/postsController");
const { upload, uploadController } = require("./src/upload/uploadController");
const db = require("./src/db/db");

app.post("/api/contact", addMessage);
app.get("/api/admin/posts", getPosts);
app.post("/api/admin/posts", addPost);
app.post("/api/admin/upload", uploadController);

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});
app.get("/api/", (req, res) => {
  res.status(200).send("Hello World");
});

const PORT = 3000;
app.listen(PORT, async () => {
  await db.connect();

  console.log(`Server is running on port ${PORT}`);
});
