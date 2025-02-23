require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const http = require("http");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes")
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const listEndpoints = require("express-list-endpoints"); // Import listEndpoints

console.log("MONGO_URI from .env:", process.env.MONGO_URI); // Debugging line

if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is undefined. Check your .env file.");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// ✅ Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ Log all registered endpoints
console.log("Registered Routes:");
console.log(listEndpoints(app));

require("./cron/cronJobs");
require("./sockets/socketHandler")(io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




