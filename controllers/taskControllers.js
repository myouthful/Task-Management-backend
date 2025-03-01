const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");

// Create Task
exports.createTask = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Only admins can create tasks." });
    }
    const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(403).json({ error: "Admin not found" });
        }


    let { internId, internName, task, dueDate } = req.body;
    let intern;

    // ✅ Find intern by ID or Name
    if (mongoose.Types.ObjectId.isValid(internId)) {
      intern = await User.findById(internId);
    } else if (internName) {
      intern = await User.findOne({ name: internName });
    }

    if (!intern) {
      return res.status(404).json({ error: "Intern not found" });
    }

    // ✅ Ensure intern and admin are in the same department
    if (admin.department !== intern.department) {
      return res.status(403).json({ error: "Intern must be in the same department as the admin." });
    }

    // ✅ Create Task with assignedTo as ObjectId
    const newTask = new Task({
      task,
      department: intern.department,
      assignedTo: intern._id, // ✅ ObjectId reference
      assignedBy: admin._id,
      assignedAt: new Date(),
      dueDate,
      status: "pending",
    });

    await newTask.save();

    // ✅ Populate assignedBy field (Admin details)
    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name"); // ✅ Populate assignedTo to show intern's name

    res.status(201).json({ message: "Task assigned successfully", task: populatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Fetch tasks assigned to a specific intern (Intern Dashboard)
exports.getInternTasks = async (req, res) => {
  if (req.user.role !== "intern") {
    return res.status(403).json({ error: "Access denied. Only interns can view their tasks." });
  }

  try {
    const tasks = await Task.find({ assignedTo: req.user._id }).populate("assignedBy", "name");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all tasks (Only Admins)
exports.getAllTasks = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Only admins can view all tasks." });
  }

  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get a single task by ID (Admins & Staff)
exports.getTaskById = async (req, res) => {
  if (!["staff", "admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied. Only staff and admins can view tasks." });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark a task as completed (Only Staff & Admins)
exports.completeTask = async (req, res) => {
  if (!["staff", "admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied. Only staff and admins can update task status." });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "completed", completedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ message: "Task marked as completed", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark a task as failed (Only Staff & Admins)
exports.failTask = async (req, res) => {
  if (!["staff", "admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied. Only staff and admins can update task status." });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "failed" },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ message: "Task marked as failed", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a task (Only Admins)
exports.deleteTask = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Only admins can delete tasks." });
  }

  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
