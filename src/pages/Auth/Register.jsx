import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError("Failed to create an account. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-content">
          <h1>Create an Account</h1>
          <p>Join Qikao Grill for exclusive offers and easy ordering</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <UserIcon className="icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <MailIcon className="icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <LockIcon className="icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <LockIcon className="icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="toggle-password"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="terms">
              <input id="terms" name="terms" type="checkbox" required />
              <label htmlFor="terms">
                I agree to the{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="divider">Or continue with</div>

          <div className="social-buttons">
            <button className="social-btn google">
              <svg viewBox="0 0 48 48" className="social-icon">
                <path fill="#EA4335" d="M24 9.5c3.2 0 6 .9 8.4 2.7l6.2-6.2C34.7 2.4 29.7.5 24 .5 14.7.5 6.6 6.2 2.7 14.3l7.6 5.9C12 14.5 17.5 9.5 24 9.5z" />
                <path fill="#34A853" d="M46.1 24.5c0-1.5-.1-2.9-.4-4.2H24v8h12.5c-.5 2.6-2 4.9-4.2 6.4l6.6 5.1c3.9-3.6 6.2-9 6.2-15.3z" />
                <path fill="#4A90E2" d="M10.3 28.2A14.4 14.4 0 0 1 9 24c0-1.5.2-2.9.6-4.2l-7.6-5.9A23.8 23.8 0 0 0 0 24c0 3.9 1 7.5 2.7 10.7l7.6-6.5z" />
                <path fill="#FBBC05" d="M24 47.5c6.5 0 12-2.1 16-5.8l-6.6-5.1c-1.9 1.3-4.4 2.1-7 2.1-6.5 0-12-5-13.8-11.6l-7.6 6.5C6.6 41.8 14.7 47.5 24 47.5z" />
              </svg>
            </button>
            <button className="social-btn facebook">
              <svg viewBox="0 0 24 24" className="social-icon">
                <path fill="#fff" d="M22.675 0h-21.35A1.33 1.33 0 0 0 0 1.325v21.351A1.33 1.33 0 0 0 1.325 24h11.495V14.708h-3.13v-3.62h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.918c-1.505 0-1.797.715-1.797 1.765v2.315h3.587l-.467 3.62h-3.12V24h6.116A1.33 1.33 0 0 0 24 22.675V1.325A1.33 1.33 0 0 0 22.675 0z" />
              </svg>
            </button>
          </div>

          <p className="signin-text">
            Already have an account?{" "}
            <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
