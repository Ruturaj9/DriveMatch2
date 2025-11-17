// server/src/routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/**
 * Helper - sign token
 */
const signToken = (user) => {
  const payload = { id: user._id, email: user.email, username: user.username };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Middleware - protect routes
 * Expects header: Authorization: Bearer <token>
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to request (minimal)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err?.message || err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* -------------------------
   POST /api/auth/signup
   Body: { username, email, password }
   ------------------------- */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password required" });
    }

    // Check duplicates
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    });

    // Sign token
    const token = signToken(user);

    // Return safe user (without password)
    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };

    return res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------
   POST /api/auth/login
   Body: { email, password }
   ------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };

    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------
   GET /api/auth/me (protected)
   Headers: Authorization: Bearer <token>
   ------------------------- */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // req.user created by authMiddleware
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("GET /me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
