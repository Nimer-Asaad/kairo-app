// src/signup.js
import "./signup.css";
import { useState } from "react";
import { apiPost } from "./api";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!form.name || !form.email || !form.password || !form.role) {
        setError("Please fill all fields and select role");
        setLoading(false);
        return;
      }

      // sign up بس لـ company / person
      const data = await apiPost("/auth/signup", {
        full_name: form.name,
        email: form.email,
        password: form.password,
        role: form.role, // لازم يكون "company" أو "person"
      });

      console.log("Signup response:", data);
      setSuccess("Account created successfully ✅");

      // ممكن تخزّن التوكن لو حاب، بس مش ضروري هون
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // نفرّغ الفورم
      setForm({ name: "", email: "", password: "", role: "" });

      // 👈 المهم: بعد التسجيل نوديه ع صفحة اللوج إن
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <form className="signupForm" onSubmit={handleSubmit}>
        <h3>SignUp Form</h3>
        <hr style={{ color: "black" }} />

        {/* Name */}
        <label>Enter Name </label>
        <input
          type="text"
          value={form.name}
          onChange={handleChange("name")}
        />
        <hr />

        {/* Email */}
        <label>Enter Email</label>
        <input
          type="email"
          value={form.email}
          onChange={handleChange("email")}
        />
        <hr />

        {/* Password */}
        <label>Enter Password</label>
        <input
          type="password"
          value={form.password}
          onChange={handleChange("password")}
        />
        <hr />

        {/* Role Selection - فقط Company / Person */}
        <label>
          <b>Select Role:</b>
        </label>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          {["company", "person"].map((role) => (
            <label key={role}>
              <input
                type="radio"
                value={role}
                checked={form.role === role}
                onChange={handleChange("role")}
              />{" "}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </label>
          ))}
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "SignUp"}
        </button>
      </form>
    </div>
  );
}
