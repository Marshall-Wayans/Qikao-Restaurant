import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingBagIcon, MenuIcon, XIcon, UserIcon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = ['Home', 'About', 'Menu', 'Contact'];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSignIn = () => navigate('/signin');
  const handleRegister = () => navigate('/register');

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">Q</div>
          <span className="logo-text">
            Qikao <span className="logo-highlight">Grill</span>
          </span>
        </Link>

        
        <div className="nav-links-desktop">
          {navItems.map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className={`nav-link ${
                location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? 'active' : ''
              }`}
            >
              {item}
              <span className="nav-underline" />
            </Link>
          ))}
          {user?.isAdmin && (
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
              Admin
              <span className="nav-underline" />
            </Link>
          )}
        </div>

        
        <div className="nav-actions-desktop">
          <div className="cart-wrapper" onClick={() => navigate('/checkout')}>
            <ShoppingBagIcon size={22} className="cart-icon" />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </div>

          {user ? (
            <div className="user-menu-wrapper">
              <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <UserIcon size={20} />
                <span className="user-name">{user.name}</span>
              </button>
              <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`}>
                <Link to="/profile" className="dropdown-item">Profile</Link>
                {user.isAdmin && <Link to="/admin" className="dropdown-item">Admin Dashboard</Link>}
                <button onClick={handleLogout} className="dropdown-item">Sign Out</button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="modern-btn outline" onClick={handleSignIn}>Sign In</button>
              <button className="modern-btn filled" onClick={handleRegister}>Register</button>
            </div>
          )}
        </div>

       
        <div className="mobile-actions">
          <div className="cart-wrapper" onClick={() => navigate('/checkout')}>
            <ShoppingBagIcon size={22} className="cart-icon" />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </div>
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

     
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item}
            to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
            className={`mobile-link ${
              location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? 'active' : ''
            }`}
          >
            {item}
          </Link>
        ))}
        {user?.isAdmin && <Link to="/admin" className="mobile-link">Admin</Link>}

        {user ? (
          <div className="mobile-auth">
            <Link to="/profile" className="mobile-link">Profile</Link>
            <button onClick={handleLogout} className="mobile-link">Sign Out</button>
          </div>
        ) : (
          <div className="mobile-auth">
            <button className="modern-btn outline" onClick={handleSignIn}>Sign In</button>
            <button className="modern-btn filled" onClick={handleRegister}>Register</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;