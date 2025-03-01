const express = require("express");
const {
  createTask,
  getInternTasks,  
  getAllTasks,
  getTaskById,
  completeTask,
  failTask,
  deleteTask,
} = require("../controllers/taskControllers");


const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// ✅ Only Staff & Admins Can Create Tasks
router.post("/", authMiddleware, roleMiddleware(["staff", "admin"]), createTask);

// ✅ Get tasks assigned to the logged-in intern
router.get("/intern", authMiddleware, getInternTasks);


// ✅ Only Admins Can View All Tasks
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllTasks);

// ✅ Staff/Admins Can View Individual Tasks
router.get("/:id", authMiddleware, roleMiddleware(["staff", "admin"]), getTaskById);

// ✅ Only Staff/Admins Can Complete/Fail/Delete Tasks
router.put("/:id/complete", authMiddleware, roleMiddleware(["staff", "admin"]), completeTask);
router.put("/:id/fail", authMiddleware, roleMiddleware(["staff", "admin"]), failTask);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteTask);

console.log("✅ Task Routes Secured for Staff/Admins");

module.exports = router;



