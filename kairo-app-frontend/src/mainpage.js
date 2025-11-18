import React, { useState } from "react";
import "./mainpage.css";
import Login from "./login.js";
import SignUp from "./signup.js";

export default function MainPage() {
  const [showLogin, setShowLogin] = useState({ login: false, signup: false });

  function handleLogin() {
    setShowLogin({ ...showLogin, login: true });
  }

  function handleCloseLogin() {
    setShowLogin({ ...showLogin, login: false });
  }

  function handleSignUp() {
    setShowLogin({ ...showLogin, signup: true });
  }

  function handleCloseSignUp() {
    setShowLogin({ ...showLogin, signup: false });
  }

  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <div className="logo-bar"></div>
          <h1>OurProject</h1>
        </div>

        <div className="auth-buttons">
          <button className="signin" onClick={handleLogin}>
            Sign In
          </button>
          <button className="signup" onClick={handleSignUp}>
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Daily Task Management</h2>
        <p>
          Quickly and easily set up new projects, assign and share tasks, add
          comments and notes, share file library, send and receive
          notifications. All data is synchronized across all your team members
          and devices.
        </p>
        <div className="hero-buttons">
          <button className="get-started">Get Started</button>
          <button className="discover">Discover Features</button>
        </div>
      </section>

      {/* Login Popup */}
      {showLogin.login && (
        <div className="login-popup">
          <div className="login-container">
            <button className="close-btn" onClick={handleCloseLogin}>
              ✖
            </button>
            <Login />
          </div>
        </div>
      )}

      {/* SignUp Popup */}
      {showLogin.signup && (
        <div className="signup-popup">
          <div className="signup-container">
            <button className="close-btn" onClick={handleCloseSignUp}>
              ✖
            </button>
            <SignUp />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} OurProject — All rights reserved.
      </footer>
    </div>
  );
}
