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

const {
  upload,
  uploadController,
  getUploadedImages,
} = require("./src/upload/uploadController");
const db = require("./src/db/db");
const errorMiddleware = require("./src/middleware/errorMiddleware");
const postRouter = require("./src/posts/postsRouter");

app.use("/api/admin/posts", postRouter);

app.post("/api/contact", addMessage);
app.post("/api/admin/upload", upload.single("image"), uploadController);
app.get("/api/admin/uploads", getUploadedImages);
app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});
app.get("/api/", (req, res) => {
  res.status(200).send("Hello World");
});

app.use(errorMiddleware);

const PORT = 3000;
app.listen(PORT, async () => {
  try {
    await db.connect();
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error(err);
  }
});
