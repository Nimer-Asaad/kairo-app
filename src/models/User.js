// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // معلومات الحساب الأساسية
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },

    phone: { type: String },

    // علاقتها مع الشركات (لو مستقبلًا في Company Collection)
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

    // أدوار النظام
    role: {
      type: String,
      enum: ["person", "company", "hr", "employee", "manager"],
      required: true
    },

    is_active: { type: Boolean, default: true },

    // 🔥 حقول خاصة بربط Gmail API
    gmailAccessToken: { type: String },
    gmailRefreshToken: { type: String },
    gmailTokenExpiry: { type: Number } // يتم تخزين Date.now()
  },

  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

// ❗ ملاحظة مهمة: اسم الـ collection في MongoDB هو "users"
export default mongoose.model("User", userSchema, "users");
