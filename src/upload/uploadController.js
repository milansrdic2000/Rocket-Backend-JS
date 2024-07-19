const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");

// const uploadPath =
//   "/Users/milansrdic/Desktop/ROCKET2/rocket-web/src/assets/uploads";
// const uploadPath = path.join(__dirname, "../../uploads");
const uploadPath = "/home/rockettt/public_html/assets/uploads";

const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // const uploadPath = path.join(__dirname, "../public_html/uploads");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

const uploadController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.status(200).send({
    status: true,
    message: "File is uploaded",
    data: {
      name: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});

const getUploadedImages = asyncHandler(async (req, res) => {
  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error reading directory",
        error: err,
      });
    }
    // const localPath = (file) => `assets/uploads/${file}`;
    const serverPath = (file) =>
      `/home/rockettt/public_html/assets/uploads/${file}`;
    const imageFiles = files.map(serverPath);
    console.log(imageFiles);
    res.status(200).json({ success: true, data: imageFiles });
  });
});
module.exports = { upload, uploadController, getUploadedImages };
