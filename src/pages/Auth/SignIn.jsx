// src/pages/Auth/SignIn.jsx
// Uses updated AuthContext.login() which:
//  1. Authenticates with Firebase Auth
//  2. Updates lastLogin in Firestore
//  3. Sends "User Logged In" notification to admin

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./SignIn.css";

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) { setError("Please fill in all fields."); return; }

    setLoading(true);
    try {
      // AuthContext.login() handles:
      // - Firebase signInWithEmailAndPassword
      // - lastLogin update in Firestore
      // - Admin notification (type: "login")
      const cred = await login(formData.email.trim(), formData.password);

      // Check if user is admin and redirect accordingly
      // (AuthContext sets user.isAdmin from Firestore role field)
      navigate("/");
    } catch (err) {
      console.error("SignIn error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <div className="signin-header">
          <Link to="/" className="signin-logo">
            <div className="logo-icon">Q</div>
            <span>Qikao <span className="logo-red">Grill</span></span>
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form className="signin-form" onSubmit={handleSubmit}>
          {error && <div className="signin-error">{error}</div>}

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
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>

        <p className="signin-register-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;