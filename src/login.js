// src/login.js
import { useState } from "react";
import "./login.css";
import { apiPost } from "./api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await apiPost("/auth/login", {
        email: form.email,
        password: form.password,
        // ما في داعي نبعث role، الباك إند بجيبها من الداتا بيس
      });

      console.log("Login response:", data);
      setMessage("Logged in successfully ✅");

      // نخزن التوكن واليوزر في localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const role = data.user?.role;

      // 👇 التوجيه حسب الـ role المخزّن في MongoDB
      if (role === "company") {
        navigate("/admin");            // صفحة الأدمن
      } else if (role === "person") {
        navigate("/person");           // صفحة الشخص (PersonPage)
      } else if (role === "hr") {
        navigate("/hr");               // HR Dashboard
      } else if (role === "employee") {
        navigate("/employeeTasks");    // Employee dashboard
      } else if (role === "manager") {
        navigate("/manager");          // Manager tasks
      } else {
        navigate("/");                 // احتياط
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <form className="loginForm" onSubmit={handleSubmit}>
        <h1
          style={{
            textAlign: "center",
            border: "solid black 3px",
            fontSize: "40px",
          }}
        >
          Login Form
        </h1>

        {/* Email */}
        <label>
          <b>User Email:</b>
        </label>
        <input
          type="email"
          value={form.email}
          placeholder="Enter your email"
          onChange={handleChange("email")}
        />

        {/* Password */}
        <label>
          <b>User Pass:</b>
        </label>
        <input
          type="password"
          value={form.password}
          placeholder="Enter your password"
          onChange={handleChange("password")}
        />

        {/* ما في Role في الفورم – كل الأدوار تستخدم نفس اللوج إن */}

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
