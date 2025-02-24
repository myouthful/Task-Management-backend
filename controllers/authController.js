const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ Restored MongoDB model import
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is undefined. Check your .env file.");
  process.exit(1);
}

// ✅ Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prevent non-admins from assigning roles
    const newUserRole = req.user && req.user.role === "admin" ? role || "user" : "user";

    user = new User({ name, email, password: hashedPassword, department, role: newUserRole });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user: { id: user._id, name, email, department, role: user.role } });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
