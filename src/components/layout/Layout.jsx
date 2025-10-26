import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Footer from "./Footer";
import "./Layout.css";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isHome = location.pathname === "/";

  return (
    <div className="layout-wrapper">
      {/* HEADER / NAVBAR */}
      <header
        className={`layout-header ${isScrolled ? "scrolled" : ""} ${
          isHome ? "home-nav" : "default-nav"
        }`}
      >
        <div className="layout-container">
          <Link to="/" className="layout-logo">
            <h1>ICCM</h1>
          </Link>

          <button
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`layout-nav ${isMenuOpen ? "open" : ""}`}>
            <ul className="nav-list">
              <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/">Home</Link>
              </li>
              <li className={location.pathname === "/about" ? "active" : ""}>
                <Link to="/about">About</Link>
              </li>
              <li className={location.pathname === "/menu" ? "active" : ""}>
                <Link to="/menu">Menu</Link>
              </li>
              <li className={location.pathname === "/contact" ? "active" : ""}>
                <Link to="/contact">Contact</Link>
              </li>
              <li className={location.pathname === "/checkout" ? "active" : ""}>
                <Link to="/checkout">Checkout</Link>
              </li>
            </ul>
          </nav>

          <Link to="/signin" className="cta-button">
            Sign In
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
