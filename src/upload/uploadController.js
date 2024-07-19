const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");

const uploadPath = path.join(__dirname, "../../public_html/uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public_html/uploads");
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
      path: uploadPath,
      name: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});

module.exports = { upload, uploadController };
