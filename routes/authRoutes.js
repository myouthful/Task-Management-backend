const express = require("express");
const { signup, login } = require("../controllers/authController");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

// Define Routes
router.post("/signup", signup);

// ✅ Admin-Only Signup (For Creating Staff/Admin Accounts)
router.post("/admin-signup", authMiddleware, roleMiddleware(["admin"]), signup);


router.post("/login", login);

console.log("✅ authRoutes: /signup & /login defined");

module.exports = router;
