const Task = require("../models/Task");

// ✅ Create a new task
exports.createTask = async (req, res) => {
  try {
    const { name, department, task, dueDate } = req.body;
    const newTask = new Task({ name, department, task, dueDate });
    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark a task as completed
exports.completeTask = async (req, res) => {
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

// ✅ Mark a task as failed
exports.failTask = async (req, res) => {
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

//  Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
