require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const listEndpoints = require("express-list-endpoints");
const routes = require("./routes/index"); 
const connectDB = require("./config/db"); // ⚠️ Commented out MongoDB connection

console.log("MONGO_URI from .env:", process.env.MONGO_URI); // Debugging line

if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is undefined. Check your .env file.");
  process.exit(1); // ⚠️ Commented out to prevent server shutdown
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

connectDB(); 

app.use(cors( { origin: "http://localhost:5174", credentials: true }));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// ✅ Define Routes
app.use("/api", routes);

// ✅ Log all registered endpoints
console.log("Registered Routes:");
console.log(listEndpoints(app));

require("./cron/cronJobs");
require("./sockets/socketHandler")(io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




