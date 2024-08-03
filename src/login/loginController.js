const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
const validUsername = process.env.adminUser; //
const validPassword = process.env.adminPass; // Replace with your password

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (username === validUsername && password === validPassword) {
    const user = { username };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, success: true });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

const loginCheck = asyncHandler(async (req, res) => {
  return res.json({ success: true });
});

module.exports = { login, loginCheck };
