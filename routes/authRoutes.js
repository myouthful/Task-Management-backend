const express = require("express");
const { signup, login } = require("../controllers/authController");

const router = express.Router();

// ✅ Unified Signup Route (No Restrictions)
router.post("/signup", signup);

// ✅ Unified Login Route (No Role Restrictions)
router.post("/login", login);

console.log("✅ authRoutes: /signup, /login defined");

module.exports = router;


















// const express = require("express");
// const { signup, login } = require("../controllers/authController");
// const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

// const router = express.Router();

// // ✅ Separate Signup Routes
// router.post("/admin-signup", authMiddleware, roleMiddleware(["admin"]), (req, res) => signup(req, res, "admin"));
// router.post("/intern-signup", (req, res) => signup(req, res, "intern"));

// // ✅ Separate Login Routes
// router.post("/admin-login", (req, res) => login(req, res, "admin"));
// router.post("/intern-login", (req, res) => login(req, res, "intern"));

// console.log("✅ authRoutes: /admin-signup, /intern-signup, /admin-login, /intern-login defined");

// module.exports = router;

