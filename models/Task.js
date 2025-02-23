const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  task: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  dueDate: { type: Date, required: true },
  completedAt: { type: Date },
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;


