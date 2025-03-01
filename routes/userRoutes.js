const express = require("express");
const router = express.Router();
const User = require("../models/User"); // ✅ Ensure correct path

// ✅ Get all users (No need for "/users" here)
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get all interns
router.get("/interns", async (req, res) => {
    try {
        const interns = await User.find({ role: "intern" });
        res.json(interns);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

