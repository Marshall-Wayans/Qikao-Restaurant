// src/pages/Admin/Dashboard.jsx
// Reads everything from localStorage via localStore.js — no Firebase needed.

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboardIcon, UsersIcon, ShoppingCartIcon, BellIcon,
  LogOutIcon, DollarSignIcon, MenuIcon, XIcon, UserIcon,
  SendIcon, CheckIcon, Trash2Icon, LineChartIcon, PackageIcon,
  AlertCircleIcon, MessageSquareIcon, CheckCheckIcon, RefreshCwIcon,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  Users, Orders, Notifications, Messages,
  useStore, Session,
} from "../../store/localStore";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const ZERO_SALES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((n) => ({ name: n, sales: 0, orders: 0 }));

function fmtKsh(n) { return `Ksh ${(n ?? 0).toLocaleString()}`; }

const STATUS_OPTIONS = ["Processing","Preparing","Delivered","Cancelled"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [activeSection, setActiveSection] = useState("overview");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg]     = useState("");
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [profileDropOpen, setProfileDropOpen] = useState(false);
  const profileInputRef = useRef(null);

  // Clear PIN on logout so next admin must re-enter it
  function handleLogout() {
    sessionStorage.removeItem("qk_admin_verified");
    logout();
    navigate("/signin");
  }

  // Responsive sidebar
  useEffect(() => {
    const fn = () => setSidebarOpen(window.innerWidth >= 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest?.(".ad-profile-area")) setProfileDropOpen(false);
    };
    window.addEventListener("click", fn);
    return () => window.removeEventListener("click", fn);
  }, []);

  /* ---- Live data from localStore ---- */
  const allUsers  = useStore(() => Users.getAll(),         ["qk_users"]);
  const allOrders = useStore(() => Orders.getAll(),        ["qk_orders"]);
  const allNotifs = useStore(() => Notifications.forAdmin(),["qk_notifications"]);
  const allMsgs   = useStore(() => Messages.getAll(),      ["qk_messages"]);

  const adminUid      = user?.id || "admin_001";
  const unreadNotifs  = allNotifs.filter((n) => !n.readBy.includes(adminUid)).length;
  const unreadMsgs    = allMsgs.filter((m) => !m.readByAdmin).length;
  const totalRevenue  = allOrders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = allOrders.filter((o) => o.status === "Processing" || o.status === "Preparing").length;

  // Build weekly sales chart from real orders
  const salesData = (() => {
    const map = {};
    ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].forEach((d) => { map[d] = { name: d, sales: 0, orders: 0 }; });
    allOrders.forEach((o) => {
      if (o.createdAt) {
        const dayName = DAYS[new Date(o.createdAt).getDay()];
        if (map[dayName]) { map[dayName].sales += o.total || 0; map[dayName].orders += 1; }
      }
    });
    return Object.values(map);
  })();

  const filteredUsers = allUsers.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (u.name||"").toLowerCase().includes(q) ||
           (u.email||"").toLowerCase().includes(q) ||
           (u.role||"").toLowerCase().includes(q);
  });

  /* ---- Actions ---- */
  async function sendNotification(e) {
    e.preventDefault();
    if (!notifMsg.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 400));
    Notifications.add({
      type:       "admin",
      title:      notifTitle.trim() || "Admin Message 📢",
      message:    notifMsg.trim(),
      targetRole: "all",
      senderUid:  adminUid,
      senderName: user?.name || "Admin",
      senderRole: "admin",
    });
    setNotifTitle("");
    setNotifMsg("");
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  function markNotifRead(id) { Notifications.markRead(id, adminUid); }
  function markAllNotifsRead() { Notifications.markAllRead(adminUid); }
  function deleteNotif(id) { if (window.confirm("Delete this notification?")) Notifications.delete(id); }
  function markMsgRead(id) { Messages.markRead(id); }
  function updateOrderStatus(orderId, status) { Orders.updateStatus(orderId, status); }
  function deleteUser(id) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    Users.delete(id);
    Notifications.add({
      type: "system", title: "User Deleted",
      message: `A user account was deleted by admin`,
      targetRole: "admin", senderUid: adminUid, senderName: "Admin", senderRole: "admin",
    });
  }

  const typeColor = (t) => ({ login:"#22c55e", register:"#3b82f6", order:"#f59e0b", admin:"#ef4444", message:"#8b5cf6", system:"#9ca3af" }[t] || "#9ca3af");
  const typeIcon  = (t) => ({ login:"🔐", register:"🎉", order:"🛒", admin:"📢", message:"💬", system:"⚙️" }[t] || "🔔");

  const navSections = [
    { id: "overview",      label: "Overview",       icon: <LayoutDashboardIcon size={17} /> },
    { id: "orders",        label: "Orders",         icon: <ShoppingCartIcon size={17} />, badge: pendingOrders },
    { id: "users",         label: "Users",          icon: <UsersIcon size={17} />,         badge: allUsers.length },
    { id: "notifications", label: "Notifications",  icon: <BellIcon size={17} />,          badge: unreadNotifs },
    { id: "messages",      label: "Messages",       icon: <MessageSquareIcon size={17} />, badge: unreadMsgs },
    { id: "analytics",     label: "Analytics",      icon: <LineChartIcon size={17} /> },
  ];

  return (
    <div className="ad-root">
      {/* SIDEBAR */}
      <aside className={`ad-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="ad-sidebar-brand">
          <div className="ad-brand-logo">Q</div>
          <div>
            <div className="ad-brand-name">Qikao Grill</div>
            <div className="ad-brand-sub">Admin Panel</div>
          </div>
          <button className="ad-sidebar-close" onClick={() => setSidebarOpen(false)}><XIcon size={17} /></button>
        </div>

        <nav className="ad-nav">
          {navSections.map((s) => (
            <button
              key={s.id}
              className={`ad-nav-btn ${activeSection === s.id ? "active" : ""}`}
              onClick={() => { setActiveSection(s.id); if (window.innerWidth < 900) setSidebarOpen(false); }}
            >
              <span className="ad-nav-icon">{s.icon}</span>
              <span className="ad-nav-label">{s.label}</span>
              {s.badge > 0 && <span className="ad-nav-badge">{s.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <button className="ad-logout-btn" onClick={handleLogout}>
            <LogOutIcon size={15} /> Logout
          </button>
          <div className="ad-copyright">© 2025 Qikao Grill</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ad-main">
        {/* Topbar */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)}><MenuIcon size={22} /></button>
            <div>
              <h1 className="ad-page-title">{navSections.find((s) => s.id === activeSection)?.label}</h1>
              <p className="ad-page-sub">Real-time · localStorage</p>
            </div>
          </div>

          <div className="ad-topbar-right">
            <button className="ad-topbar-bell" onClick={() => setActiveSection("notifications")}>
              <BellIcon size={19} />
              {unreadNotifs > 0 && <span className="ad-bell-badge">{unreadNotifs}</span>}
            </button>
            <button className="ad-topbar-bell" onClick={() => setActiveSection("messages")}>
              <MessageSquareIcon size={19} />
              {unreadMsgs > 0 && <span className="ad-bell-badge">{unreadMsgs}</span>}
            </button>

            <div className="ad-profile-area">
              <button className="ad-profile-btn" onClick={() => setProfileDropOpen((s) => !s)}>
                {user?.photoURL
                  ? <img src={user.photoURL} alt="" className="ad-avatar" />
                  : <div className="ad-avatar-placeholder"><UserIcon size={16} /></div>
                }
                <span className="ad-profile-name">{user?.name || "Admin"}</span>
              </button>
              {profileDropOpen && (
                <div className="ad-profile-dropdown">
                  <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{user?.email}</div>
                  </div>
                  <button className="ad-dd-item" onClick={handleLogout}>
                    <LogOutIcon size={13} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ad-content">

          {/* ===== OVERVIEW ===== */}
          {activeSection === "overview" && (
            <div className="ad-section">
              <div className="ad-stats-grid">
                {[
                  { label: "Total Revenue",   value: fmtKsh(totalRevenue),       icon: <DollarSignIcon size={20} />,   cls: "revenue" },
                  { label: "Total Orders",    value: allOrders.length,            icon: <ShoppingCartIcon size={20} />, cls: "orders" },
                  { label: "Registered Users",value: allUsers.length,             icon: <UsersIcon size={20} />,        cls: "users" },
                  { label: "Pending Orders",  value: pendingOrders,               icon: <PackageIcon size={20} />,      cls: "notifs" },
                ].map((s) => (
                  <div key={s.label} className={`ad-stat-card ${s.cls}`}>
                    <div className="ad-stat-icon">{s.icon}</div>
                    <div className="ad-stat-body">
                      <div className="ad-stat-label">{s.label}</div>
                      <div className="ad-stat-value">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ad-two-col">
                <div className="ad-card">
                  <h3 className="ad-card-title">Weekly Revenue</h3>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => [fmtKsh(v), "Revenue"]} />
                        <Bar dataKey="sales" fill="#ef4444" radius={[5,5,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="ad-card">
                  <h3 className="ad-card-title">Order Trend</h3>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: "#ef4444" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="ad-card">
                <div className="ad-card-header-row">
                  <h3 className="ad-card-title">Recent Orders</h3>
                  <button className="ad-link-btn" onClick={() => setActiveSection("orders")}>View all →</button>
                </div>
                <OrderTable orders={allOrders.slice(0, 5)} onStatusChange={updateOrderStatus} />
              </div>

              <div className="ad-card">
                <div className="ad-card-header-row">
                  <h3 className="ad-card-title">Recent Activity</h3>
                  <button className="ad-link-btn" onClick={() => setActiveSection("notifications")}>View all →</button>
                </div>
                <div className="ad-activity-list">
                  {allNotifs.slice(0, 7).map((n) => (
                    <div key={n.id} className={`ad-activity-item ${n.type}`}>
                      <div className="ad-activity-dot" style={{ background: typeColor(n.type) }} />
                      <div className="ad-activity-body">
                        <div className="ad-activity-title">{n.title}</div>
                        <div className="ad-activity-msg">{n.message}</div>
                        <div className="ad-activity-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
                      </div>
                      {!n.readBy.includes(adminUid) && <span className="ad-activity-unread-dot" />}
                    </div>
                  ))}
                  {allNotifs.length === 0 && <p className="ad-muted">No activity yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ===== ORDERS ===== */}
          {activeSection === "orders" && (
            <div className="ad-section">
              <div className="ad-section-top-bar">
                <div className="ad-mini-stats">
                  <span className="ad-mini-stat"><strong>{allOrders.length}</strong> Total</span>
                  <span className="ad-mini-stat pending"><strong>{pendingOrders}</strong> Pending</span>
                  <span className="ad-mini-stat delivered"><strong>{allOrders.filter((o) => o.status === "Delivered").length}</strong> Delivered</span>
                  <span className="ad-mini-stat revenue-mini"><strong>{fmtKsh(totalRevenue)}</strong> Revenue</span>
                </div>
              </div>
              <div className="ad-card">
                <h3 className="ad-card-title">All Orders</h3>
                {allOrders.length === 0
                  ? <p className="ad-muted">No orders yet. They'll appear here as customers place them.</p>
                  : <OrderTable orders={allOrders} onStatusChange={updateOrderStatus} />
                }
              </div>
            </div>
          )}

          {/* ===== USERS ===== */}
          {activeSection === "users" && (
            <div className="ad-section">
              <div className="ad-section-top-bar">
                <div className="ad-mini-stats">
                  <span className="ad-mini-stat"><strong>{allUsers.length}</strong> Total Users</span>
                  <span className="ad-mini-stat active-stat"><strong>{allUsers.filter((u) => u.status === "Active").length}</strong> Active</span>
                  <span className="ad-mini-stat admin-stat"><strong>{allUsers.filter((u) => u.role === "admin").length}</strong> Admin</span>
                </div>
                <input
                  className="ad-search-input"
                  placeholder="Search by name, email, role…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="ad-card">
                <h3 className="ad-card-title">Registered Users</h3>
                {filteredUsers.length === 0
                  ? <p className="ad-muted">{userSearch ? "No users match your search." : "No users yet."}</p>
                  : (
                    <div className="ad-users-grid">
                      {filteredUsers.map((u) => (
                        <div key={u.id} className="ad-user-card">
                          <div className="ad-user-avatar-wrap">
                            {u.photoURL
                              ? <img src={u.photoURL} alt="" className="ad-user-avatar" />
                              : <div className="ad-user-initials">{(u.name || "?").charAt(0).toUpperCase()}</div>
                            }
                            <span className={`ad-user-status-dot ${u.status === "Active" ? "active" : "inactive"}`} />
                          </div>
                          <div className="ad-user-info">
                            <div className="ad-user-name">{u.name}</div>
                            <div className="ad-user-email">{u.email}</div>
                            <div className="ad-user-meta">
                              <span className={`ad-role-badge ${u.role}`}>{u.role}</span>
                              <span className="ad-muted-small">Last: {u.lastLogin || "—"}</span>
                            </div>
                            <div className="ad-muted-small">
                              Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                            </div>
                          </div>
                          {u.role !== "admin" && (
                            <button
                              className="ad-user-delete-btn"
                              title="Delete user"
                              onClick={() => deleteUser(u.id)}
                            >
                              <Trash2Icon size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {activeSection === "notifications" && (
            <div className="ad-section">
              <div className="ad-card ad-notif-composer-card">
                <h3 className="ad-card-title">📢 Broadcast to All Users</h3>
                {sent && (
                  <div className="ad-sent-banner">✅ Broadcast sent! All users will see this notification.</div>
                )}
                <form className="ad-notif-form" onSubmit={sendNotification}>
                  <input
                    className="ad-input"
                    placeholder="Title (e.g. 'Weekend Special Offer!')"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                  />
                  <textarea
                    className="ad-textarea"
                    placeholder="Write your message to all users…"
                    rows={3}
                    value={notifMsg}
                    onChange={(e) => setNotifMsg(e.target.value)}
                  />
                  <button className="ad-send-btn" type="submit" disabled={sending || !notifMsg.trim()}>
                    <SendIcon size={15} /> {sending ? "Sending…" : "Send Broadcast"}
                  </button>
                </form>
              </div>

              <div className="ad-card">
                <div className="ad-card-header-row">
                  <h3 className="ad-card-title">All Notifications</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {unreadNotifs > 0 && (
                      <button className="nb-mark-all" onClick={markAllNotifsRead} style={{ fontSize: 12 }}>
                        <CheckCheckIcon size={13} /> Mark all read
                      </button>
                    )}
                    <span className="ad-badge-count">{unreadNotifs} unread</span>
                  </div>
                </div>
                {allNotifs.length === 0
                  ? <p className="ad-muted">No notifications yet.</p>
                  : (
                    <div className="ad-notif-feed">
                      {allNotifs.map((n) => {
                        const isRead = n.readBy.includes(adminUid);
                        return (
                          <div key={n.id} className={`ad-notif-row ${isRead ? "read" : "unread"} type-${n.type}`}>
                            <div className="ad-notif-type-icon" style={{ background: typeColor(n.type) + "18", color: typeColor(n.type) }}>
                              {typeIcon(n.type)}
                            </div>
                            <div className="ad-notif-content">
                              <div className="ad-notif-head">
                                <span className="ad-notif-title">{n.title}</span>
                                <span className="ad-notif-sender">{n.senderName} · {n.senderRole}</span>
                              </div>
                              <div className="ad-notif-msg">{n.message}</div>
                              <div className="ad-notif-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
                            </div>
                            <div className="ad-notif-actions">
                              {!isRead && (
                                <button className="ad-icon-btn" title="Mark read" onClick={() => markNotifRead(n.id)}>
                                  <CheckIcon size={14} />
                                </button>
                              )}
                              <button className="ad-icon-btn del" title="Delete" onClick={() => deleteNotif(n.id)}>
                                <Trash2Icon size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {/* ===== MESSAGES ===== */}
          {activeSection === "messages" && (
            <div className="ad-section">
              <div className="ad-card">
                <div className="ad-card-header-row">
                  <h3 className="ad-card-title">💬 Messages from Users</h3>
                  <span className="ad-badge-count">{unreadMsgs} unread</span>
                </div>
                {allMsgs.length === 0
                  ? <p className="ad-muted">No messages yet. Users can send messages from the navbar.</p>
                  : (
                    <div className="ad-msg-feed">
                      {allMsgs.map((m) => (
                        <div key={m.id} className={`ad-msg-card ${m.readByAdmin ? "read" : "unread"}`}>
                          <div className="ad-msg-avatar">
                            {(m.fromName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="ad-msg-body">
                            <div className="ad-msg-head">
                              <div>
                                <span className="ad-msg-name">{m.fromName}</span>
                                <span className="ad-msg-email">{m.fromEmail}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="ad-msg-time">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</span>
                                {!m.readByAdmin && <span className="ad-msg-new-dot" />}
                              </div>
                            </div>
                            <p className="ad-msg-text">{m.message}</p>
                            {!m.readByAdmin && (
                              <button className="ad-msg-read-btn" onClick={() => markMsgRead(m.id)}>
                                <CheckIcon size={12} /> Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {/* ===== ANALYTICS ===== */}
          {activeSection === "analytics" && (
            <div className="ad-section">
              <div className="ad-stats-grid">
                {[
                  { label: "Total Revenue",   value: fmtKsh(totalRevenue),  cls: "revenue" },
                  { label: "Total Orders",    value: allOrders.length,      cls: "orders" },
                  { label: "Registered Users",value: allUsers.length,       cls: "users" },
                  { label: "Avg Order Value", value: fmtKsh(allOrders.length ? Math.round(totalRevenue / allOrders.length) : 0), cls: "notifs" },
                ].map((s) => (
                  <div key={s.label} className={`ad-stat-card ${s.cls}`}>
                    <div className="ad-stat-body">
                      <div className="ad-stat-label">{s.label}</div>
                      <div className="ad-stat-value" style={{ fontSize: 24 }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ad-two-col">
                <div className="ad-card">
                  <h3 className="ad-card-title">Revenue by Day</h3>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(v) => [fmtKsh(v), "Revenue"]} />
                        <Bar dataKey="sales" fill="#ef4444" radius={[5,5,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="ad-card">
                  <h3 className="ad-card-title">Orders per Day</h3>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 5, fill: "#ef4444" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* ---- Order Table sub-component ---- */
function OrderTable({ orders, onStatusChange }) {
  if (!orders.length) return <p className="ad-muted">No orders yet.</p>;
  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead>
          <tr>
            <th>Order ID</th><th>Customer</th><th>Items</th>
            <th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId || o.id}>
              <td className="mono">#{o.orderId}</td>
              <td>
                <div className="ad-order-customer">{o.customer}</div>
                <div className="ad-muted-small">{o.email}</div>
              </td>
              <td className="ad-muted-small">{(o.items || []).length} item{(o.items||[]).length !== 1 ? "s" : ""}</td>
              <td><strong>{fmtKsh(o.total)}</strong></td>
              <td className="ad-muted-small">{o.paymentMethod || "—"}</td>
              <td>
                <span className={`ad-badge ${
                  o.status === "Delivered"  ? "badge-delivered"  :
                  o.status === "Processing" ? "badge-processing" :
                  o.status === "Preparing"  ? "badge-preparing"  : "badge-cancelled"
                }`}>{o.status}</span>
              </td>
              <td className="ad-muted-small">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
              <td>
                <select
                  className="ad-status-select"
                  value={o.status}
                  onChange={(e) => onStatusChange(o.orderId, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}