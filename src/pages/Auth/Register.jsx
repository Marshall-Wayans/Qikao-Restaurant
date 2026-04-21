// src/pages/Auth/Register.jsx
// This file uses the updated AuthContext.register() which:
//  1. Creates Firebase Auth user
//  2. Writes to Firestore "users" collection
//  3. Sends "New User Registered" notification to admin
// No changes needed to local logic — just ensure AuthContext is updated.

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) { setError("Please enter your name."); return; }
    if (!formData.email.trim()) { setError("Please enter your email."); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      // AuthContext.register() handles:
      // - Firebase Auth createUserWithEmailAndPassword
      // - Firestore users doc creation
      // - Admin notification (type: "register")
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <Link to="/" className="register-logo">
            <div className="logo-icon">Q</div>
            <span>Qikao <span className="logo-red">Grill</span></span>
          </Link>
          <h1>Create Account</h1>
          <p>Join us and start ordering your favourite meals</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && <div className="register-error">{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <p className="register-signin-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;