// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    phone: { type: String },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    role: { type: String, enum: ["person", "company"], required: true }, // ✅ جديد
    is_active: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

// ملاحظة: اسم الـ collection أصلاً users في Atlas
export default mongoose.model("User", userSchema, "users");
