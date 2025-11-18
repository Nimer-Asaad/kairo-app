import "./signup.css";
import { useState } from "react";

export default function SignUp() {
  const [signUp, setSignUP] = useState({
    name: "",
    email: "",
    pass: "",
    role: "", // Added role to state
  });

  function handleSubmit(event) {
    event.preventDefault();
    console.log("signup data", signUp); // Log the signup data

    setSignUP({ name: "", email: "", pass: "", role: "" });
  }

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <form className="signupForm" onSubmit={handleSubmit}>
        <h3>SignUp Form</h3>
        <hr style={{ color: "black" }}></hr>
        {/* Name */}
        <label>Enter Name </label>
        <input
          type="text"
          value={signUp.name}
          onChange={(event) =>
            setSignUP({ ...signUp, name: event.target.value })
          }
        />
        <hr></hr>
        {/* Email */}
        <label>Enter Email</label>
        <input
          type="email"
          value={signUp.email}
          onChange={(event) =>
            setSignUP({ ...signUp, email: event.target.value })
          }
        />
        <hr></hr>
        {/* Password */}
        <label>Enter Password</label>
        <input
          type="password"
          value={signUp.pass}
          onChange={(event) =>
            setSignUP({ ...signUp, pass: event.target.value })
          }
        />
        <hr></hr>
        {/* Role Selection - Without Admin */}
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
          {["person", "company"].map((role) => (
            <label key={role}>
              <input
                type="radio"
                value={role}
                checked={signUp.role === role}
                onChange={(event) =>
                  setSignUP({ ...signUp, role: event.target.value })
                }
              />{" "}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </label>
          ))}
        </div>
        <hr></hr>
        <button type="submit">SignUp</button>
      </form>
    </div>
  );
}
