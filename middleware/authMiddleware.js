const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
const roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Access denied, insufficient permissions" });
  }
  next();
};

module.exports = { authMiddleware, roleMiddleware };
