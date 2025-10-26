import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* ===== About Section ===== */}
          <div className="footer-section about">
            <h3>Qikao Grill</h3>
            <p>
              Experience the authentic taste of premium grilled cuisine in a
              warm and welcoming atmosphere.
            </p>
            <div className="social-links">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="social-icon" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="social-icon" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="social-icon" />
              </a>
            </div>
          </div>

          {/* ===== Quick Links ===== */}
          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/menu">Menu</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/checkout">Checkout</Link>
              </li>
            </ul>
          </div>

          {/* ===== Contact Info ===== */}
          <div className="footer-section contact">
            <h3>Contact Info</h3>
            <ul>
              <li>
                <MapPin className="contact-icon" />
                123 Main Street, Nairobi, Kenya
              </li>
              <li>
                <Phone className="contact-icon" /> +254 123 456 789
              </li>
              <li>
                <Mail className="contact-icon" /> info@qikaogrill.com
              </li>
              <li>
                <Clock className="contact-icon" /> Mon–Fri: 10am–10pm
                <br />
                Sat–Sun: 11am–11pm
              </li>
            </ul>
          </div>

          {/* ===== Newsletter ===== */}
          <div className="footer-section newsletter">
            <h3>Newsletter</h3>
            <p>Stay updated with our latest offers and events.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your Email" required />
              <button type="submit" className="subscribe-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* ===== Footer Bottom ===== */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Qikao Grill. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}