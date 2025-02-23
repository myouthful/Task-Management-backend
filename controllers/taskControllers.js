const Task = require("../models/Task");

// Mark task as completed
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "completed", completedAt: new Date() },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Mark task as failed
exports.failTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "failed", completedAt: new Date() },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
