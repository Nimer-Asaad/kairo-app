// src/routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// helper: إنشاء توكن
function createToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/// POST /auth/signup  (للـ person و company بس)
router.post("/signup", async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // نتأكد إنو role صح
    if (!["person", "company"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already used" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password_hash: hash,
      role, // تخزين نوع المستخدم
      is_active: true,
    });

    const token = createToken(user);

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; // شلنا role من هنا

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);

    res.json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /auth/users  --> ترجع كل المستخدمين (لصفحة الأدمن)
router.get("/users", auth, async (req, res) => {
  try {
    // بس company مسموح
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const users = await User.find(
      {},
      "full_name email role is_active phone address company_id"
    );

    res.json({ users });
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// POST /auth/create-user  --> الأدمن ينشئ HR / Employee / Manager
router.post("/create-user", auth, async (req, res) => {
  try {
    // بس company يقدر ينشئ موظفين
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const {
      full_name,
      email,
      role,
      password,
      phone,
      address,
      is_active,
    } = req.body;

    if (!full_name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const allowedRoles = ["hr", "employee", "manager"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already used" });
    }

    const finalPassword = password || "123456";
    const hash = await bcrypt.hash(finalPassword, 10);

    const user = await User.create({
      full_name,
      email,
      password_hash: hash,
      role,
      phone,
      address,
      is_active: typeof is_active === "boolean" ? is_active : true,
      company_id: req.user.id, // 🔗 ربطه بالشركة اللي عاملاه
    });

    res.status(201).json({
      message: "User created by admin",
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        company_id: user.company_id,
      },
      temp_password: finalPassword, // تعطيه للموظف
    });
  } catch (err) {
    console.error("Create-user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
