import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  ShoppingBagIcon, MenuIcon, XIcon, UserIcon,
  BellIcon, SendIcon, CheckCheckIcon, MessageSquareIcon,
} from "lucide-react";
import { Notifications, Messages, useStore } from "../../store/localStore";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled]   = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [msgOpen, setMsgOpen]         = useState(false);
  const [msgText, setMsgText]         = useState("");
  const [msgSent, setMsgSent]         = useState(false);
  const [activeTab, setActiveTab]     = useState("all"); // "all" | "unread"

  const notifRef = useRef(null);
  const msgRef   = useRef(null);

  const navItems = ["Home", "About", "Menu", "Contact"];

  // Live notifications from store
  const allNotifs = useStore(
    () => user
      ? (user.isAdmin
          ? Notifications.forAdmin()
          : Notifications.forUser(user.id).filter(
              (n) => n.targetRole !== "admin"
            ))
      : [],
    ["qk_notifications"]
  );

  const unread = allNotifs.filter((n) => !n.readBy.includes(user?.id || "")).length;

  const displayed = activeTab === "unread"
    ? allNotifs.filter((n) => !n.readBy.includes(user?.id || ""))
    : allNotifs;

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false); setUserMenuOpen(false);
    setNotifOpen(false);  setMsgOpen(false);
  }, [location]);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (msgRef.current   && !msgRef.current.contains(e.target))   setMsgOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  function markRead(id) {
    if (user) Notifications.markRead(id, user.id);
  }

  function markAllRead() {
    if (user) Notifications.markAllRead(user.id);
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!msgText.trim() || !user) return;
    Messages.add({
      fromUid:   user.id,
      fromName:  user.name,
      fromEmail: user.email,
      message:   msgText.trim(),
    });
    // Also add as a notification for admin
    Notifications.add({
      type:       "message",
      title:      `Message from ${user.name}`,
      message:    msgText.trim(),
      targetRole: "admin",
      senderUid:  user.id,
      senderName: user.name,
      senderRole: "user",
    });
    setMsgText("");
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 2500);
  }

  const typeIcon = (type) => {
    const m = { login: "🔐", register: "🎉", order: "🛒", admin: "📢", message: "💬", system: "⚙️" };
    return m[type] || "🔔";
  };
  const typeColor = (type) => {
    const m = {
      login:    "#22c55e", register: "#3b82f6", order: "#f59e0b",
      admin:    "#ef4444", message:  "#8b5cf6", system: "#9ca3af",
    };
    return m[type] || "#9ca3af";
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">Q</div>
            <span className="logo-text">Qikao <span className="logo-highlight">Grill</span></span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links-desktop">
            {navItems.map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className={`nav-link ${location.pathname === (item === "Home" ? "/" : `/${item.toLowerCase()}`) ? "active" : ""}`}
              >
                {item}<span className="nav-underline" />
              </Link>
            ))}
            {user?.isAdmin && (
              <Link to="/admin" className={`nav-link ${location.pathname.startsWith("/admin") ? "active" : ""}`}>
                Admin<span className="nav-underline" />
              </Link>
            )}
          </div>

          {/* Desktop actions */}
          <div className="nav-actions-desktop">

            {/* Cart */}
            <div className="cart-wrapper" onClick={() => navigate("/checkout")}>
              <ShoppingBagIcon size={22} className="cart-icon" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="nb-wrap" ref={notifRef}>
                <button
                  className={`nb-bell ${notifOpen ? "active" : ""}`}
                  onClick={() => { setNotifOpen((s) => !s); setMsgOpen(false); }}
                  aria-label="Notifications"
                >
                  <BellIcon size={21} />
                  {unread > 0 && (
                    <span className="nb-count">{unread > 99 ? "99+" : unread}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="nb-panel">
                    {/* Panel header */}
                    <div className="nb-panel-head">
                      <div className="nb-panel-title">
                        <BellIcon size={16} />
                        <span>Notifications</span>
                        {unread > 0 && <span className="nb-unread-pill">{unread} new</span>}
                      </div>
                      {unread > 0 && (
                        <button className="nb-mark-all" onClick={markAllRead}>
                          <CheckCheckIcon size={13} /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Tabs */}
                    <div className="nb-tabs">
                      <button className={activeTab === "all"    ? "active" : ""} onClick={() => setActiveTab("all")}>All</button>
                      <button className={activeTab === "unread" ? "active" : ""} onClick={() => setActiveTab("unread")}>
                        Unread {unread > 0 && `(${unread})`}
                      </button>
                    </div>

                    {/* List */}
                    <div className="nb-list">
                      {displayed.length === 0 && (
                        <div className="nb-empty">
                          <BellIcon size={32} strokeWidth={1.2} />
                          <p>{activeTab === "unread" ? "You're all caught up!" : "No notifications yet."}</p>
                        </div>
                      )}
                      {displayed.map((n) => {
                        const isRead = n.readBy.includes(user.id);
                        return (
                          <div
                            key={n.id}
                            className={`nb-item ${isRead ? "read" : "unread"}`}
                            onClick={() => markRead(n.id)}
                          >
                            <div className="nb-item-icon" style={{ background: typeColor(n.type) + "18", color: typeColor(n.type) }}>
                              <span>{typeIcon(n.type)}</span>
                            </div>
                            <div className="nb-item-body">
                              <div className="nb-item-top">
                                <span className="nb-item-title">{n.title}</span>
                                {!isRead && <span className="nb-dot" />}
                              </div>
                              <p className="nb-item-msg">{n.message}</p>
                              <span className="nb-item-time">
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="nb-panel-foot">
                      <span className="nb-foot-meta">{allNotifs.length} total notifications</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message Admin (non-admin users only) */}
            {user && !user.isAdmin && (
              <div className="nb-wrap" ref={msgRef}>
                <button
                  className={`nb-bell ${msgOpen ? "active" : ""}`}
                  onClick={() => { setMsgOpen((s) => !s); setNotifOpen(false); }}
                  aria-label="Message Admin"
                  title="Send a message to admin"
                >
                  <MessageSquareIcon size={20} />
                </button>

                {msgOpen && (
                  <div className="nb-msg-panel">
                    <div className="nb-panel-head">
                      <div className="nb-panel-title">
                        <MessageSquareIcon size={15} />
                        <span>Message Admin</span>
                      </div>
                      <button className="nb-close-btn" onClick={() => setMsgOpen(false)}><XIcon size={15} /></button>
                    </div>
                    <div className="nb-msg-body">
                      <p className="nb-msg-hint">
                        Send a message to the admin. They'll see your name and email.
                      </p>
                      {msgSent ? (
                        <div className="nb-msg-sent">
                          <span>✅</span>
                          <p>Message sent! Admin will see it shortly.</p>
                        </div>
                      ) : (
                        <form onSubmit={sendMessage} className="nb-msg-form">
                          <textarea
                            placeholder="Type your message here…"
                            value={msgText}
                            onChange={(e) => setMsgText(e.target.value)}
                            rows={4}
                            required
                          />
                          <button type="submit" disabled={!msgText.trim()}>
                            <SendIcon size={14} /> Send Message
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User menu / auth buttons */}
            {user ? (
              <div className="user-menu-wrapper">
                <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" className="user-avatar-sm" />
                    : <div className="user-initials">{user.name.charAt(0).toUpperCase()}</div>
                  }
                  <span className="user-name">{user.name}</span>
                </button>
                <div className={`user-dropdown ${userMenuOpen ? "open" : ""}`}>
                  <div className="dropdown-user-info">
                    <div className="dui-name">{user.name}</div>
                    <div className="dui-email">{user.email}</div>
                  </div>
                  {user.isAdmin && <Link to="/admin" className="dropdown-item">Admin Dashboard</Link>}
                  <button onClick={handleLogout} className="dropdown-item signout">Sign Out</button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="modern-btn outline" onClick={() => navigate("/signin")}>Sign In</button>
                <button className="modern-btn filled" onClick={() => navigate("/register")}>Register</button>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="mobile-actions">
            {user && (
              <div className="nb-wrap" style={{ position: "relative" }}>
                <button className="nb-bell" onClick={() => setNotifOpen((s) => !s)}>
                  <BellIcon size={20} />
                  {unread > 0 && <span className="nb-count">{unread}</span>}
                </button>
              </div>
            )}
            <div className="cart-wrapper" onClick={() => navigate("/checkout")}>
              <ShoppingBagIcon size={22} className="cart-icon" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </div>
            <button className="hamburger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <Link key={item} to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={`mobile-link ${location.pathname === (item === "Home" ? "/" : `/${item.toLowerCase()}`) ? "active" : ""}`}>
              {item}
            </Link>
          ))}
          {user?.isAdmin && <Link to="/admin" className="mobile-link">Admin</Link>}
          {user ? (
            <div className="mobile-auth">
              <button onClick={handleLogout} className="mobile-link">Sign Out</button>
            </div>
          ) : (
            <div className="mobile-auth">
              <button className="modern-btn outline" onClick={() => navigate("/signin")}>Sign In</button>
              <button className="modern-btn filled" onClick={() => navigate("/register")}>Register</button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile notification panel (full screen overlay) */}
      {notifOpen && user && (
        <div className="nb-mobile-overlay" ref={notifRef}>
          <div className="nb-mobile-panel">
            <div className="nb-panel-head">
              <div className="nb-panel-title"><BellIcon size={16} /><span>Notifications</span></div>
              <button className="nb-close-btn" onClick={() => setNotifOpen(false)}><XIcon size={18} /></button>
            </div>
            <div className="nb-tabs">
              <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All</button>
              <button className={activeTab === "unread" ? "active" : ""} onClick={() => setActiveTab("unread")}>Unread</button>
            </div>
            <div className="nb-list">
              {displayed.length === 0 && (
                <div className="nb-empty"><BellIcon size={32} strokeWidth={1.2} /><p>No notifications yet.</p></div>
              )}
              {displayed.map((n) => {
                const isRead = n.readBy.includes(user.id);
                return (
                  <div key={n.id} className={`nb-item ${isRead ? "read" : "unread"}`} onClick={() => markRead(n.id)}>
                    <div className="nb-item-icon" style={{ background: typeColor(n.type) + "18", color: typeColor(n.type) }}>
                      <span>{typeIcon(n.type)}</span>
                    </div>
                    <div className="nb-item-body">
                      <div className="nb-item-top">
                        <span className="nb-item-title">{n.title}</span>
                        {!isRead && <span className="nb-dot" />}
                      </div>
                      <p className="nb-item-msg">{n.message}</p>
                      <span className="nb-item-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;