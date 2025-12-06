// src/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  try {
    let token = null;

    // 1) من الهيدر العادي Authorization: Bearer xxx
    const header = req.headers.authorization || "";
    if (header.startsWith("Bearer ")) {
      token = header.slice(7);
    }

    // 2) أو من الـ query لما نروح على /gmail/auth?token=...
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // نخزّن معلومات بسيطة عن اليوزر في req
    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
