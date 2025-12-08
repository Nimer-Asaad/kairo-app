import React, { useState } from "react";
import "./mainpage.css";
import Login from "./login.js";
import SignUp from "./signup.js";
import manageImage from "./manege.webp";
import { Link } from "react-router-dom";

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
          <h1>Task Management System</h1>
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

      {/* Hero Section - Updated layout */}
      <section className="heroo">
        <div className="heroo-container">
          <div className="heroo-image">
            <img src={manageImage} alt="Daily Task Management" />
          </div>
          <div className="heroo-content">
            <h2 style={{ color: "black" }}>Task Management</h2>
            <h3 style={{ color: "black" }}>Daily Task Management</h3>
            <p>
              Quickly and easily set up new projects, assign and share tasks,
              add comments and notes, share file library, send and receive
              notifications. All data is synchronized across all your team
              members and devices.
            </p>
            <div className="heroo-buttons">
              <button className="get-started">Get Started</button>
              <Link to="/FeaturesPage">
                <button className="discover">Discover Features</button>
              </Link>
            </div>
          </div>
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
