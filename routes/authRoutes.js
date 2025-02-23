const express = require("express");
const { signup, login } = require("../controllers/authController");
const router = express.Router();

// Define Routes
router.post("/signup", signup);
router.post("/login", login);

console.log("✅ authRoutes: /signup & /login defined");

module.exports = router;
