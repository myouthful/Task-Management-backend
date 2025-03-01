const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ MongoDB model import
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is undefined. Check your .env file.");
  process.exit(1);
}

exports.signup = async (req, res) => {
  try {
    console.log("📥 Received signup request:", req.body); // ✅ Debugging

    const { name, email, password, department, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 🔹 Normalize the role
    const normalizedRole = role?.toLowerCase() || "user";
    console.log("🛠️ Normalized Role before saving:", normalizedRole); // ✅ Debugging

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      department, 
      role: normalizedRole 
    });

    await user.save();

    console.log(`✅ New user created: ${email}, Role: ${user.role}`); // ✅ Confirm saved role

    res.status(201).json({ 
      user: { id: user._id, name, email, department, role: user.role } 
    });

  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};




// ✅ Login Controller (No Role Restrictions)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    console.log(`✅ ${user.role} logged in: ${email}`);

    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};




// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User"); // ✅ MongoDB model import
// require("dotenv").config();

// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//   console.error("❌ ERROR: JWT_SECRET is undefined. Check your .env file.");
//   process.exit(1);
// }

// // ✅ Signup Controller (Role-Based)
// exports.signup = async (req, res, role) => {
//   try {
//     const { name, email, password, department } = req.body;

//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Ensure role is correctly assigned
//     let assignedRole = role;
//     if (role === "admin" && (!req.user || req.user.role !== "admin")) {
//       return res.status(403).json({ error: "Only admins can create admin accounts." });
//     }
    
//     user = new User({ name, email, password: hashedPassword, department, role: assignedRole });
//     await user.save();

//     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

//     res.status(201).json({ token, user: { id: user._id, name, email, department, role: user.role } });
//   } catch (err) {
//     console.error("Signup Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Login Controller (Role-Based)
// exports.login = async (req, res, role) => {
//   try {
//     const { email, password } = req.body;
    
//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//       return res.status(400).json({ error: "Invalid email or password" });
//     }

//     // ✅ Ensure user role matches the expected role
//     if (user.role !== role) {
//       return res.status(403).json({ error: `Access denied. Not an ${role}.` });
//     }

//     // ✅ Verify password
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(400).json({ error: "Invalid email or password" });
//     }

//     // ✅ Generate JWT Token
//     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

//     res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


