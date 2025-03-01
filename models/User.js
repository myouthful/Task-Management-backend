const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "user", "intern"],  // ✅ Add "intern" here
    default: null
  }
  
});

userSchema.pre("save", function (next) {
  console.log("🔍 Saving user with role:", this.role);
  next();
});


module.exports = mongoose.model("User", userSchema);
