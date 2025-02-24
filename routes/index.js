const express = require("express");
const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");

const router = express.Router();

// ✅ Use both authentication and task routes
router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);

module.exports = router;
