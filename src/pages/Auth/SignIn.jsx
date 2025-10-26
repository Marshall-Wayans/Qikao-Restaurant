import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import "./SignIn.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      if (email === "admin@qikao.com" && password === "admin123") {
        navigate("/admin");
      } else {
        navigate(from);
      }
    } catch {
      setError("Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-card">
        <div className="signin-content">
          <div className="signin-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your Qikao Grill account</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="signin-form">
          
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <UserIcon className="input-icon" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

          
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <LockIcon className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="eye-icon" />
                  ) : (
                    <EyeIcon className="eye-icon" />
                  )}
                </button>
              </div>
            </div>

            
            <div className="signin-options">
              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="forgot-link">
                Forgot your password?
              </a>
            </div>

            
            <button type="submit" className="signin-btn" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          
          <div className="divider">
            <span>Or continue with</span>
          </div>

          
          <div className="social-buttons">
            <button className="social-btn google-btn">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="social-icon"
              />
              {/* <span>Google</span> */}
            </button>
            <button className="social-btn facebook-btn">
              <img
                src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                alt="Facebook"
                className="social-icon"
              />
              {/* <span>Facebook</span> */}
            </button>
          </div>
        </div>

        
        <div className="signin-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="register-link">
              Register now
            </Link>
          </p>
        </div>
      </div>

      <div className="admin-demo">
        <h3>Demo Admin Access:</h3>
        <p>
          Email: admin@qikao.com <br />
          Password: admin123
        </p>
      </div>
    </div>
  );
}
