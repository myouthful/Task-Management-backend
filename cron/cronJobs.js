const cron = require("node-cron");
const Task = require("../models/Task"); // FIXED import path
const mongoose = require("mongoose");
require("dotenv").config();

 // Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Schedule job to delete expired tasks daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await Task.deleteMany({
      status: { $in: ["completed", "failed"] },
      completedAt: { $lte: yesterday },
    });

    console.log("✅ Expired tasks removed successfully.");
  } catch (error) {
    console.error("❌ Error removing expired tasks:", error);
  }
});

module.exports = cron;
