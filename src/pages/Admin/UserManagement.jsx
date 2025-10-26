import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboardIcon,
  UsersIcon,
  LineChartIcon,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  UserIcon,
  UploadCloudIcon,
  KeyIcon,
  MenuIcon,
  XIcon,
  BellIcon,
  SendIcon,
} from "lucide-react";
import "./UserManagement.css";

/* --------------------- Firebase setup --------------------- */
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
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

/* === Your Firebase config (same as your UserManagement / Register) === */
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

/* ---------------------------------------------------------------------
  NOTE: To automatically create a "New user registered" notification
  from your Register.jsx, add this snippet after you successfully write
  the new user to Firestore (copy/paste):

  await addDoc(collection(db, "notifications"), {
    type: "system",
    title: "New user registered",
    message: `${formData.name} (${formData.email}) registered`,
    createdAt: serverTimestamp(),
    read: false,
    meta: { uid: user.uid },
  });

--------------------------------------------------------------------- */

const initialUsers = []; // UI will populate from Firestore listener

export default function UserManagement() {
  const navigate = useNavigate();

  // users
  const [users, setUsers] = useState(initialUsers);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // UI controls
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  // profile / admin UI
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const profileInputRef = useRef(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifComposer, setShowNotifComposer] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifTitle, setNotifTitle] = useState("");

  // responsive sidebar initial open
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ----------------------- realtime users ------------------------ */
  useEffect(() => {
    setLoadingUsers(true);
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            name: d.name ?? "Unknown",
            email: d.email ?? "",
            role: d.role ?? "user",
            status: d.status ?? "Active",
            lastLogin: d.lastLogin ?? null,
            createdAt: d.createdAt ? d.createdAt.toDate?.() : null,
            photoURL: d.photoURL ?? "",
          });
        });
        setUsers(list);
        setLoadingUsers(false);
      },
      (err) => {
        console.error("users onSnapshot:", err);
        setLoadingUsers(false);
      }
    );

    return () => unsub();
  }, []);

  /* -------------------- realtime notifications -------------------- */
  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            title: d.title ?? d.type ?? "Notification",
            message: d.message ?? "",
            type: d.type ?? "system",
            createdAt: d.createdAt ? d.createdAt.toDate?.() : new Date(),
            read: !!d.read,
            meta: d.meta ?? {},
          });
        });
        setNotifications(list);
      },
      (err) => {
        console.error("notifications onSnapshot:", err);
      }
    );

    return () => unsub();
  }, []);

  /* ------------------------- filtered list ------------------------ */
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ------------------------ add user (admin) ---------------------- */
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill all fields");
      return;
    }
    try {
      // create auth user (optional)
      let createdUid = null;
      try {
        const cred = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
        createdUid = cred.user.uid;
      } catch (authErr) {
        // If auth creation fails (e.g., email already exists), we still create Firestore doc.
        console.warn("Auth creation (optional) failed:", authErr);
      }

      await addDoc(collection(db, "users"), {
        uid: createdUid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || "user",
        status: "Active",
        lastLogin: null,
        createdAt: serverTimestamp(),
        photoURL: "",
      });

      // Optionally create a system notification for admin-created user
      await addDoc(collection(db, "notifications"), {
        type: "system",
        title: "User added",
        message: `${newUser.name} (${newUser.email}) was added by admin`,
        createdAt: serverTimestamp(),
        read: false,
      });

      setShowAddUserModal(false);
      setNewUser({ name: "", email: "", password: "" });
    } catch (err) {
      console.error("Add user error:", err);
      alert("Failed to add user (see console).");
    }
  };

  /* ------------------------- edit user --------------------------- */
  const openEdit = (user) => {
    setEditUser({ ...user });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser || !editUser.id) return;
    try {
      await updateDoc(doc(db, "users", editUser.id), {
        name: editUser.name,
        email: editUser.email,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        type: "system",
        title: "User updated",
        message: `${editUser.name} (${editUser.email}) was updated by admin`,
        createdAt: serverTimestamp(),
        read: false,
      });

      setShowEditModal(false);
      setEditUser(null);
    } catch (err) {
      console.error("Update user error:", err);
      alert("Failed to update user (see console).");
    }
  };

  /* ------------------------ delete user -------------------------- */
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "users", id));
      await addDoc(collection(db, "notifications"), {
        type: "system",
        title: "User deleted",
        message: `${name} was deleted by admin`,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Failed to delete user.");
    }
  };

  /* --------------------- send admin notification ------------------ */
  const handleSendAdminNotif = async (e) => {
    e.preventDefault();
    if (!notifMessage.trim()) {
      alert("Please enter a message.");
      return;
    }
    try {
      await addDoc(collection(db, "notifications"), {
        type: "admin",
        title: notifTitle || "Admin message",
        message: notifMessage,
        createdAt: serverTimestamp(),
        read: false,
      });
      setNotifMessage("");
      setNotifTitle("");
      setShowNotifComposer(false);
    } catch (err) {
      console.error("Send notification error:", err);
      alert("Failed to send notification.");
    }
  };

  /* -------------------- profile image upload --------------------- */
  const triggerProfileSelect = () => profileInputRef.current && profileInputRef.current.click();

  const handleProfileFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // preview
    const preview = URL.createObjectURL(file);
    setProfilePhoto(preview);
    setProfileDropdownOpen(false);

    // Upload and (optionally) update the admin's user doc in Firestore
    try {
      const currentUser = auth.currentUser;
      const uid = currentUser ? currentUser.uid : "admin";
      const sRef = storageRef(storage, `profiles/${uid}/${Date.now()}-${file.name}`);
      await uploadBytes(sRef, file);
      const downloadURL = await getDownloadURL(sRef);

      // If you maintain admin doc in users collection with id == uid, update it:
      if (currentUser) {
        await updateDoc(doc(db, "users", uid), { photoURL: downloadURL, updatedAt: serverTimestamp() });
      }
    } catch (err) {
      console.error("Profile upload error:", err);
    }
  };

  /* ------------------------ update password ---------------------- */
  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("No authenticated user found.");
        return;
      }
      await updatePassword(user, newPassword);
      alert("Password updated.");
      setNewPassword("");
      setPasswordModalOpen(false);
    } catch (err) {
      console.error("Password update error:", err);
      alert("Failed to update password. Re-login might be required.");
    }
  };

  /* --------------------------- logout ---------------------------- */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (err) {
      console.error("SignOut error:", err);
      alert("Logout failed.");
    }
  };

  /* --------------------- close dropdowns on click ----------------- */
  useEffect(() => {
    const onDocClick = (e) => {
      const target = e.target;
      if (!target.closest || (!target.closest(".um-profile-area") && !target.closest(".um-profile-dropdown"))) {
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="um-root">
      {/* SIDEBAR */}
      <aside className={`um-sidebar ${sidebarOpen ? "um-open" : ""}`}>
        <div className="um-sidebar-top">
          <div className="um-brand">
            <h1>Qikao</h1>
            <span>Admin</span>
          </div>
          <button className="um-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <XIcon />
          </button>
        </div>

        <nav className="um-nav">
          <Link to="/admin" className="um-nav-link">
            <LayoutDashboardIcon className="um-icon" /> <span>Dashboard</span>
          </Link>
          <Link to="/admin/users" className="um-nav-link um-active">
            <UsersIcon className="um-icon" /> <span>User Management</span>
          </Link>
          <Link to="/admin/analytics" className="um-nav-link">
            <LineChartIcon className="um-icon" /> <span>Analytics</span>
          </Link>

          <Link to="/admin/notifications" className="um-nav-link">
            <LineChartIcon className="um-icon" /> <span>Notifications</span>
          </Link>
        </nav>

        <div className="um-sidebar-bottom">
          <button className="um-logout" onClick={handleLogout}>
            <LogOutIcon className="um-icon" /> Logout
          </button>
          <div className="um-copyright">© {new Date().getFullYear()} Qikao</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="um-page">
        <header className="um-topbar">
          <div className="um-left">
            <button className="um-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <MenuIcon />
            </button>
            <h2 className="um-title">User Management</h2>
          </div>

          <div className="um-top-actions">
            <div className="um-search">
              <SearchIcon className="um-search-icon" />
              <input
                type="text"
                placeholder="Search users (name, email, role)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="um-search-input"
              />
            </div>

            <button className="um-add-btn um-btn-primary" onClick={() => setShowAddUserModal(true)}>
              <PlusIcon className="um-btn-icon" /> Add User
            </button>

            <div className="um-profile-area">
              <button className="um-profile-btn" onClick={() => setProfileDropdownOpen((s) => !s)}>
                {profilePhoto ? (
                  <img src={profilePhoto} alt="profile" className="um-avatar" />
                ) : (
                  <div className="um-avatar-placeholder">
                    <UserIcon />
                  </div>
                )}
                <span className="um-admin-name">Admin</span>
              </button>

              {profileDropdownOpen && (
                <div className="um-profile-dropdown">
                  <button className="um-dd-item" onClick={triggerProfileSelect}>
                    <UploadCloudIcon className="um-dd-icon" /> Upload Photo
                  </button>
                  <button
                    className="um-dd-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setPasswordModalOpen(true);
                    }}
                  >
                    <KeyIcon className="um-dd-icon" /> Change Password
                  </button>
                </div>
              )}

              <input ref={profileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileFile} />
            </div>
          </div>
        </header>

        <main className="um-content">
          <div className="um-card">
            <div className="um-card-header">
              <h3>Users {loadingUsers ? "(loading...)" : `(${users.length})`}</h3>

              <div className="um-controls">
                <div className="um-search-small" />
              </div>
            </div>

            <div className="um-table-wrap">
              <table className="um-table" role="table" aria-label="User list">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th className="um-actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="um-row-user">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="um-avatar-sm-img" />
                          ) : (
                            <div className="um-avatar-sm">{(user.name || " ").charAt(0)}</div>
                          )}
                          <div className="um-user-meta">
                            <div className="um-user-name">{user.name}</div>
                            <div className="um-muted-small">{user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}</div>
                          </div>
                        </div>
                      </td>

                      <td className="um-muted">{user.email}</td>
                      <td className="um-muted">{user.role}</td>
                      <td>
                        <span className={`um-badge ${user.status === "Active" ? "um-badge-green" : "um-badge-red"}`}>{user.status}</span>
                      </td>
                      <td className="um-muted">{user.lastLogin ?? "—"}</td>

                      <td className="um-actions">
                        <button className="um-icon-btn" title="Edit" onClick={() => openEdit(user)}>
                          <EditIcon />
                        </button>
                        <button className="um-icon-btn um-delete" title="Delete" onClick={() => handleDeleteUser(user.id, user.name)}>
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "28px" }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="um-card-footer">
              <div>Showing <strong>{filteredUsers.length}</strong> users</div>
            </div>
          </div>
        </main>
      </div>

      {/* NOTIFICATIONS PANEL (always visible on the right when wide) */}
      <aside className="um-notifs">
        <div className="um-notifs-header">
          <div className="um-notifs-title">
            <BellIcon /> <strong>Notifications</strong>
          </div>
          <button className="um-send-btn" onClick={() => setShowNotifComposer((s) => !s)}>
            <SendIcon /> <span className="hide-sm">Send</span>
          </button>
        </div>

        {showNotifComposer && (
          <form className="um-notif-compose" onSubmit={handleSendAdminNotif}>
            <input
              placeholder="Title (optional)"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
            />
            <textarea
              placeholder="Message to users..."
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              rows={3}
            />
            <div className="um-notif-actions">
              <button type="button" className="um-btn-ghost" onClick={() => setShowNotifComposer(false)}>Cancel</button>
              <button type="submit" className="um-btn-primary">Broadcast</button>
            </div>
          </form>
        )}

        <div className="um-notif-list">
          {notifications.length === 0 && (
            <div className="um-notif-empty">No notifications yet.</div>
          )}

          {notifications.map((n) => (
            <div key={n.id} className={`um-notif-item ${n.type === "admin" ? "admin" : "system"}`}>
              <div className="um-notif-meta">
                <div className="um-notif-title">{n.title}</div>
                <div className="um-notif-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
              </div>
              <div className="um-notif-body">{n.message}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Add user modal */}
      {showAddUserModal && (
        <div className="um-modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h4>Add New User</h4>
              <button className="um-close-x" onClick={() => setShowAddUserModal(false)}><XIcon /></button>
            </div>

            <form onSubmit={handleAddUser} className="um-form">
              <label>Full Name</label>
              <input name="name" value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} required />

              <label>Email Address</label>
              <input name="email" type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} required />

              <label>Password</label>
              <input name="password" type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} required />

              <div className="um-modal-actions">
                <button type="button" className="um-btn-ghost" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                <button type="submit" className="um-btn-primary">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {showEditModal && editUser && (
        <div className="um-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h4>Edit User</h4>
              <button className="um-close-x" onClick={() => setShowEditModal(false)}><XIcon /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="um-form">
              <label>Full Name</label>
              <input value={editUser.name} onChange={(e) => setEditUser((p) => ({ ...p, name: e.target.value }))} required />

              <label>Email Address</label>
              <input type="email" value={editUser.email} onChange={(e) => setEditUser((p) => ({ ...p, email: e.target.value }))} required />

              <div className="um-modal-actions">
                <button type="button" className="um-btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="um-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {passwordModalOpen && (
        <div className="um-modal-backdrop" onClick={() => setPasswordModalOpen(false)}>
          <div className="um-modal small" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h4>Change Password</h4>
              <button className="um-close-x" onClick={() => setPasswordModalOpen(false)}><XIcon /></button>
            </div>

            <div className="um-form">
              <label>New password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

              <div className="um-modal-actions">
                <button type="button" className="um-btn-ghost" onClick={() => setPasswordModalOpen(false)}>Cancel</button>
                <button className="um-btn-primary" onClick={handlePasswordUpdate}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* small helper */
function statusClass(status) {
  return status === "Active" ? "um-badge-green" : "um-badge-red";
}