import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboardIcon,
  UsersIcon,
  LineChartIcon,
  LogOutIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  UserIcon,
  ClipboardListIcon,
  MenuIcon,
  XIcon,
  UploadCloudIcon,
  KeyIcon,
  BellIcon,
  Trash2Icon,
  CheckIcon,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signOut, updatePassword } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

import "./Dashboard.css";

/* ---------------------- Firebase (self-contained) ---------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyAyjaElKlH8kOOkrlRD6DxROgHFU3z-w_M",
  authDomain: "qikao-dashboard.firebaseapp.com",
  projectId: "qikao-dashboard",
  storageBucket: "qikao-dashboard.firebasestorage.app",
  messagingSenderId: "408735837503",
  appId: "1:408735837503:web:4536ec593c64b66483778a",
};

function initFirebaseSafe() {
  try {
    if (!getApps().length) initializeApp(firebaseConfig);
    else getApp();
  } catch (err) {
    console.warn("Firebase init skipped:", err);
  }
}
initFirebaseSafe();

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

/* ---------------------- Defaults & Mock Data ---------------------- */
const ZERO_SALES = [
  { name: "Mon", sales: 0 },
  { name: "Tue", sales: 0 },
  { name: "Wed", sales: 0 },
  { name: "Thu", sales: 0 },
  { name: "Fri", sales: 0 },
  { name: "Sat", sales: 0 },
  { name: "Sun", sales: 0 },
];

const SAMPLE_ORDERS = [
  { id: "QK123456", customer: "John Doe", total: 0, status: "Delivered", date: "2023-08-15" },
  { id: "QK123457", customer: "Jane Smith", total: 0, status: "Processing", date: "2023-08-15" },
  { id: "QK123458", customer: "Michael Johnson", total: 0, status: "Preparing", date: "2023-08-15" },
  { id: "QK123459", customer: "Sarah Williams", total: 0, status: "Delivered", date: "2023-08-14" },
  { id: "QK123460", customer: "Robert Brown", total: 0, status: "Cancelled", date: "2023-08-14" },
];

/* ---------------------- Component ---------------------- */
export default function AdminDashboard() {
  const navigate = useNavigate();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);

  useEffect(() => {
    const onResize = () => setSidebarOpen(window.innerWidth >= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Dashboard data
  const [salesData, setSalesData] = useState(ZERO_SALES);
  const [recentOrders, setRecentOrders] = useState(SAMPLE_ORDERS);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, expenses: 0 });

  // Users real-time
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Notifications real-time
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(true);

  // Profile & password
  const [profile, setProfile] = useState({ name: "Admin User", email: "", photoURL: "" });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileInputRef = useRef(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // notification send
  const [newNotifText, setNewNotifText] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);

  // listening toggle
  const [listening, setListening] = useState(true);

  // Refresh placeholder
  const [refreshing, setRefreshing] = useState(false);

  // Search users
  const [userSearch, setUserSearch] = useState("");

  /* ---------------------- Firestore listeners ---------------------- */
  useEffect(() => {
    if (!db) return;

    // Users: real time
    setUsersLoading(true);
    const usersQ = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubUsers = onSnapshot(
      usersQ,
      (snap) => {
        const arr = [];
        snap.forEach((d) => {
          const data = d.data();
          arr.push({
            id: d.id,
            name: data.name ?? "Unknown",
            email: data.email ?? "",
            role: data.role ?? "Customer",
            status: data.status ?? "Active",
            lastLogin: data.lastLogin ?? null,
            createdAt: data.createdAt ? data.createdAt.toDate?.() : null,
            photoURL: data.photoURL ?? "",
          });
        });
        setUsers(arr);
        setUsersLoading(false);
      },
      (err) => {
        console.error("users onSnapshot error", err);
        setUsersLoading(false);
      }
    );

    // Notifications: real time
    setNotifLoading(true);
    const notifQ = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubNotifs = onSnapshot(
      notifQ,
      (snap) => {
        const arr = [];
        snap.forEach((d) => {
          const data = d.data();
          arr.push({
            id: d.id,
            text: data.text ?? "",
            type: data.type ?? "system",
            createdAt: data.createdAt ? data.createdAt.toDate?.() : new Date(),
            meta: data.meta ?? null,
            read: data.read ?? false,
          });
        });
        setNotifications(arr);
        setNotifLoading(false);
      },
      (err) => {
        console.error("notifications onSnapshot error", err);
        setNotifLoading(false);
      }
    );

    // Placeholder: listen to a stats doc (optional)
    // const statsDoc = doc(db, "dashboards", "global");
    // const unsubStats = onSnapshot(statsDoc, (snap) => {
    //   if (!snap.exists()) {
    //     setStats({ revenue: 0, orders: 0, users: 0, expenses: 0 });
    //     setSalesData(ZERO_SALES);
    //     setRecentOrders(SAMPLE_ORDERS);
    //     return;
    //   }
    //   const d = snap.data();
    //   setStats({
    //     revenue: d.revenue ?? 0,
    //     orders: d.orders ?? 0,
    //     users: d.users ?? 0,
    //     expenses: d.expenses ?? 0,
    //   });
    //   setSalesData(Array.isArray(d.sales) ? d.sales : ZERO_SALES);
    //   setRecentOrders(Array.isArray(d.recentOrders) ? d.recentOrders : SAMPLE_ORDERS);
    // });

    return () => {
      unsubUsers();
      unsubNotifs();
      // unsubStats && unsubStats();
    };
  }, [listening]);

  /* ---------------------- Actions: Notifications ---------------------- */
  async function sendNotification(e) {
    e && e.preventDefault();
    if (!newNotifText.trim()) return;
    setSendingNotif(true);
    try {
      await addDoc(collection(db, "notifications"), {
        text: newNotifText.trim(),
        type: "manual",
        createdAt: serverTimestamp(),
        meta: { by: auth.currentUser ? auth.currentUser.uid : "admin" },
        read: false,
      });
      setNewNotifText("");
      // panel will update through onSnapshot
    } catch (err) {
      console.error("send notification failed", err);
      alert("Failed to send notification.");
    } finally {
      setSendingNotif(false);
    }
  }

  async function markNotifRead(id) {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error("mark read failed", err);
    }
  }

  async function removeNotif(id) {
    if (!window.confirm("Remove this notification?")) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (err) {
      console.error("delete notif failed", err);
    }
  }

  /* ---------------------- Profile upload ---------------------- */
  function triggerProfileSelect() {
    if (profileInputRef.current) profileInputRef.current.click();
  }

  async function handleProfileFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProfilePreview(preview);
    setProfileDropdownOpen(false);

    // Upload to firebase storage & update user's doc (if signed-in)
    try {
      const user = auth.currentUser;
      const uid = user ? user.uid : "admin";
      const sRef = storageRef(storage, `profiles/${uid}/${Date.now()}-${file.name}`);
      await uploadBytes(sRef, file);
      const downloadURL = await getDownloadURL(sRef);

      // Update users doc if present
      try {
        await updateDoc(doc(db, "users", uid), {
          photoURL: downloadURL,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        // If doc doesn't exist, optionally create/ignore
        console.warn("updating users doc with photo failed", err);
      }
    } catch (err) {
      console.error("profile upload error", err);
    }
  }

  /* ---------------------- Password change (current admin) ---------------------- */
  async function handlePasswordChange() {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setUpdatingPassword(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("No authenticated user found.");
        setUpdatingPassword(false);
        return;
      }
      // Note: in many setups you need to reauthenticate user first
      await updatePassword(user, newPassword);
      alert("Password updated.");
      setPasswordModalOpen(false);
      setNewPassword("");
    } catch (err) {
      console.error("updatePassword error", err);
      alert("Failed to update password (you may need to re-login / reauthenticate).");
    } finally {
      setUpdatingPassword(false);
    }
  }
 
  /* ---------------------- Logout ---------------------- */
async function handleLogout() {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
    navigate("/signin"); // <-- use the actual route
  } catch (err) {
    console.error("logout failed", err);
    alert("Logout failed.");
  }
}

  /* ---------------------- Utility / UI helpers ---------------------- */
  function statusClass(status) {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "delivered";
      case "processing":
        return "processing";
      case "preparing":
        return "preparing";
      default:
        return "cancelled";
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q) || (u.role || "").toLowerCase().includes(q);
  });

  /* ---------------------- Refresh placeholder ---------------------- */
  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
    // add real fetch from Firestore if desired
  }

  /* ---------------------- Close dropdown when clicking outside ---------------------- */
  useEffect(() => {
    const onDocClick = (e) => {
      const target = e.target;
      if (!target.closest || (!target.closest(".profile-area") && !target.closest(".profile-dropdown"))) {
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="admindash-root">
      {/* Sidebar */}
      <aside className={`admindash-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="admindash-sidebar-top">
          <div className="brand">
            <h1>Qikao</h1>
            <span className="brand-sub">Admin</span>
          </div>
          <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <XIcon />
          </button>
        </div>

        <nav className="admindash-nav">
          <Link to="/admin" className="nav-link active">
            <LayoutDashboardIcon className="nav-icon" />
            <span>Dashboard</span>
          </Link>

          <Link to="/admin/users" className="nav-link">
            <UsersIcon className="nav-icon" />
            <span>User Management</span>
          </Link>

          <Link to="/admin/analytics" className="nav-link">
            <LineChartIcon className="nav-icon" />
            <span>Analytics</span>
          </Link>

          <Link to="/admin/analytics" className="nav-link">
            <LineChartIcon className="nav-icon" />
            <span>Notifications</span>
          </Link>


        </nav>

        <div className="admindash-sidebar-bottom">
          <button className="admindash-logout" onClick={handleLogout}>
            <LogOutIcon className="nav-icon" />
            <span>Logout</span>
          </button>
          <div className="admindash-copyright">© 2025 Qikao</div>
        </div>
      </aside>

      {/* Main */}
      <div className="admindash-main">
        <header className="admindash-topbar">
          <div className="left">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <MenuIcon />
            </button>
            <div>
              <h2>Dashboard</h2>
              <p className="sub">All stats default to 0 — updates come from Firestore in real time.</p>
            </div>
          </div>

          <div className="right">
            <div className="controls">
              <button className="small-btn" onClick={handleRefresh}><RefreshCw /> {refreshing ? "Refreshing..." : "Refresh"}</button>
              <button className="small-btn" onClick={() => setListening((s) => !s)}>{listening ? "Live: On" : "Live: Off"}</button>
            </div>

            <div className="icons">
              <button className="notif-btn" onClick={() => setNotifOpen((s) => !s)} aria-label="Notifications">
                <BellIcon />
                {notifications.some(n => !n.read) && <span className="notif-dot" />}
              </button>

              <div className="profile-area">
                <button className="profile-button" onClick={() => setProfileDropdownOpen((s) => !s)}>
                  {profilePreview ? <img src={profilePreview} alt="profile" className="profile-avatar" /> : profile.photoURL ? <img src={profile.photoURL} alt="profile" className="profile-avatar" /> : <div className="avatar-placeholder"><UserIcon /></div>}
                  <span className="profile-name">{profile.name}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="profile-dropdown">
                    <button className="dropdown-item" onClick={triggerProfileSelect}><UploadCloudIcon className="dd-icon" /> Upload New Photo</button>
                    <button className="dropdown-item" onClick={() => { setProfileDropdownOpen(false); setPasswordModalOpen(true); }}><KeyIcon className="dd-icon" /> Change Password</button>
                  </div>
                )}

                <input ref={profileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileFile} />
              </div>
            </div>
          </div>
        </header>

        <main className="admindash-content">
          {/* Stats */}
          <section className="stats-grid">
            <div className="card stat">
              <div className="icon-wrap icon-revenue"><DollarSignIcon /></div>
              <div className="stat-body">
                <div className="label">Total Revenue</div>
                <div className="value">${(stats.revenue ?? 0).toLocaleString()}</div>
                <div className="meta positive"><TrendingUpIcon /> <small>+0% from last month</small></div>
              </div>
            </div>

            <div className="card stat">
              <div className="icon-wrap icon-orders"><ShoppingCartIcon /></div>
              <div className="stat-body">
                <div className="label">Total Orders</div>
                <div className="value">{stats.orders ?? 0}</div>
                <div className="meta positive"><TrendingUpIcon /> <small>+0% from last month</small></div>
              </div>
            </div>

            <div className="card stat">
              <div className="icon-wrap icon-users"><UsersIcon /></div>
              <div className="stat-body">
                <div className="label">Total Users</div>
                <div className="value">{stats.users ?? users.length ?? 0}</div>
                <div className="meta positive"><TrendingUpIcon /> <small>+0% from last month</small></div>
              </div>
            </div>

            <div className="card stat">
              <div className="icon-wrap icon-expenses"><ClipboardListIcon /></div>
              <div className="stat-body">
                <div className="label">Expenses</div>
                <div className="value">${(stats.expenses ?? 0).toLocaleString()}</div>
                <div className="meta negative"><TrendingDownIcon /> <small>-0% from last month</small></div>
              </div>
            </div>
          </section>

          {/* Charts + popular */}
          <section className="two-col">
            <div className="card chart-card">
              <h4>Weekly Sales</h4>
              <div className="chart-area" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card popular-card">
              <h4>Popular Menu Items</h4>
              <div className="progress-list">
                {[
                  { name: "Premium Ribeye Steak", pct: 65 },
                  { name: "BBQ Chicken", pct: 52 },
                  { name: "Family Feast", pct: 49 },
                  { name: "Grilled Salmon", pct: 38 },
                  { name: "Signature Cocktails", pct: 25 },
                ].map((it) => (
                  <div key={it.name} className="progress-item">
                    <div className="progress-header">
                      <span>{it.name}</span>
                      <span>{it.pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${it.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent orders */}
          <section className="card orders">
            <div className="orders-top">
              <h4>Recent Orders</h4>
              <a href="#" className="link-cta">View all orders</a>
            </div>

            <div className="table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="mono">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>${(order.total || 0).toFixed(2)}</td>
                      <td><span className={`badge ${statusClass(order.status)}`}>{order.status}</span></td>
                      <td>{order.date}</td>
                      <td className="right"><a href="#" className="link-view">View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Users panel (real-time) */}
          <section className="card users-card">
            <div className="users-header">
              <h4>Users (Real-time)</h4>
              <div className="users-controls">
                <input placeholder="Search users (name, email, role)..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              </div>
            </div>

            <div className="users-list">
              {usersLoading ? <div className="muted">Loading users...</div> : null}
              {filteredUsers.length === 0 && !usersLoading ? <div className="muted">No users found.</div> : null}

              {filteredUsers.map((u) => (
                <div className="user-row" key={u.id}>
                  <div className="user-left">
                    {u.photoURL ? <img src={u.photoURL} alt="" className="user-avatar" /> : <div className="avatar-letter">{(u.name || " ").charAt(0)}</div>}
                    <div>
                      <div className="user-name">{u.name}</div>
                      <div className="muted small">{u.email}</div>
                      <div className="muted small">Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</div>
                    </div>
                  </div>

                  <div className="user-right">
                    <div className={`status-pill ${u.status === "Active" ? "active" : "inactive"}`}>{u.status}</div>
                    <div className="muted small">Last: {u.lastLogin ?? "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Notifications panel (sliding) */}
      <aside className={`admindash-notifs ${notifOpen ? "open" : ""}`} aria-hidden={!notifOpen}>
        <div className="notifs-head">
          <h3>Notifications</h3>
          <button className="close-right" onClick={() => setNotifOpen(false)} aria-label="Close"><XIcon /></button>
        </div>

        <form className="notif-send" onSubmit={sendNotification}>
          <input placeholder="Message to all users..." value={newNotifText} onChange={(e) => setNewNotifText(e.target.value)} />
          <button type="submit" className="btn-send" disabled={sendingNotif}>{sendingNotif ? "Sending..." : "Send"}</button>
        </form>

        <div className="notifs-list">
          {notifLoading ? <div className="muted">Loading notifications...</div> : null}
          {!notifLoading && notifications.length === 0 ? <div className="muted">No notifications yet.</div> : null}

          {notifications.map((n) => (
            <div key={n.id} className={`notif-item ${n.read ? "read" : "unread"}`}>
              <div className="notif-main">
                <div className="notif-text">{n.text}</div>
                <div className="muted small">{n.type} • {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
              </div>
              <div className="notif-actions">
                {!n.read && <button className="icon-btn" onClick={() => markNotifRead(n.id)} title="Mark read"><CheckIcon /></button>}
                <button className="icon-btn del" onClick={() => removeNotif(n.id)} title="Delete"><Trash2Icon /></button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Password modal */}
      {passwordModalOpen && (
        <div className="modal-backdrop" onClick={() => setPasswordModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <p className="muted">Enter a new password for the admin account.</p>
            <div className="modal-row">
              <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setPasswordModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePasswordChange} disabled={updatingPassword}>{updatingPassword ? "Updating..." : "Update Password"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}