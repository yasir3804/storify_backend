const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const adminProtect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Get user from token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    // Check if the user is an admin
    if (user.role !== "admin") {
      res.status(403); // Forbidden
      throw new Error("Access denied, admin only");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error(error.message || "Not authorized, please login");
  }
});

module.exports = adminProtect;
