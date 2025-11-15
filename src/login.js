import { useState } from "react";
import "./login.css";

const Data = {
  name: ["anwar"],
  email: ["anwarbaker.1.2@gmail.com"],
  pass: [123],
  role: ["admin"],
};

export default function Login() {
  const [login, setLogin] = useState({ email: "", pass: "", role: "" });

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Submitted data:", login);
    setLogin({ email: "", pass: "", role: "" });
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
          value={login.email}
          placeholder="Enter your email"
          onChange={(event) =>
            setLogin({ ...login, email: event.target.value })
          }
        />

        {/* Password */}
        <label>
          <b>User Pass:</b>
        </label>
        <input
          type="password"
          value={login.pass}
          placeholder="Enter your password"
          onChange={(event) => setLogin({ ...login, pass: event.target.value })}
        />

        {/* Role Selection */}
        <label>
          <b>User Role:</b>
        </label>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          {["admin", "person", "company"].map((role) => (
            <label key={role}>
              <input
                type="radio"
                value={role}
                checked={login.role === role}
                onChange={(event) =>
                  setLogin({ ...login, role: event.target.value })
                }
              />{" "}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </label>
          ))}
        </div>

        {/* Submit Button */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
