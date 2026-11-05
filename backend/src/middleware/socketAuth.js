
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuth = async (socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token;
    const headerToken = socket.handshake.headers.authorization;

    const token = authToken || headerToken?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return next(new Error("Invalid token"));
    }

    const user = await User.findById(userId).select("name email role isActive");

    if (!user || !user.isActive) {
      return next(new Error("User not authorized"));
    }

    socket.user = {
      userId: user._id.toString(),
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};

module.exports = socketAuth;
