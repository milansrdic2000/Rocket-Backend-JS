const http = require("http");
const express = require("express");

const hostname = "127.0.0.1";
const port = 3000;

const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
app.use(bodyParser.json());
app.use(cors());

const addMessage = require("./src/contact/contact");
const { getPosts } = require("./src/posts/postsController");
const db = require("./src/db/db");

app.post("/api/contact", addMessage);
app.get("/api/admin/posts", getPosts);

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
