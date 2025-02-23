const express = require("express");
const { completeTask, failTask } = require("../controllers/taskControllers");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Mark task as complete
router.put("/:id/complete", authMiddleware, completeTask);

// ✅ Mark task as failed
router.put("/:id/fail", authMiddleware, failTask);

module.exports = router;

