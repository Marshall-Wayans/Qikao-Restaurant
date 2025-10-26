// src/components/Notifications/Notifications.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  BellIcon,
  XIcon,
  SendIcon,
  Trash2Icon,
  CheckIcon,
} from "lucide-react";
import "./Notifications.css";

// Firebase imports - adjust path to your firebase export
// I assume you export a Firestore instance named `db` from ../../firebase
import { db } from "../../firebase"; // <-- adjust if your file is at a different path
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

// Auth context - adjust import path if different in your project
import { useAuth } from "../../context/AuthContext"; // <-- adjust if needed

export default function Notifications({ className = "" }) {
  const { user } = useAuth(); // expected shape: { uid, displayName, email, role || isAdmin }
  const uid = user?.uid ?? null;
  const isAdmin = (user && (user.role === "admin" || user.isAdmin)) ?? false;

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // composer
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // quick inline toast
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = [];
        snap.forEach((d) => {
          const data = d.data();
          arr.push({
            id: d.id,
            title: data.title ?? "",
            message: data.message ?? "",
            senderUid: data.senderUid ?? null,
            senderName: data.senderName ?? data.sender ?? "System",
            senderRole: data.senderRole ?? data.senderRole ?? "system",
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            readBy: Array.isArray(data.readBy) ? data.readBy : [],
            raw: data,
          });
        });
        setNotifications(arr);
        setLoading(false);
      },
      (err) => {
        console.error("notifications onSnapshot", err);
        setLoading(false);
        showToast("Failed to load notifications");
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(text, ms = 3000) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }

  const unreadCount = notifications.filter((n) => !(n.readBy || []).includes(uid)).length;

  // send/broadcast notification (admin only)
  async function handleSend(e) {
    e && e.preventDefault();
    if (!isAdmin) {
      showToast("Only admins can send messages.");
      return;
    }
    if (!message.trim()) {
      showToast("Message is required.");
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title: title?.trim() || "",
        message: message.trim(),
        senderUid: uid || "system",
        senderName: user?.displayName || user?.email || "Admin",
        senderRole: user?.role || (isAdmin ? "admin" : "system"),
        createdAt: serverTimestamp(),
        readBy: [], // nobody has read at creation
      });
      setTitle("");
      setMessage("");
      setShow(false);
      showToast("Broadcast sent");
    } catch (err) {
      console.error("send notification error", err);
      showToast("Failed to send");
    } finally {
      setSending(false);
    }
  }

  // delete notification (admin only)
  async function handleDelete(id) {
    if (!isAdmin) {
      showToast("Only admins can delete notifications.");
      return;
    }
    if (!window.confirm("Delete this notification?")) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      showToast("Deleted");
    } catch (err) {
      console.error("delete notification", err);
      showToast("Failed to delete");
    }
  }

  // mark as read for current user
  async function markAsRead(nId, alreadyRead) {
    if (!uid) {
      showToast("Sign in to mark read");
      return;
    }
    if (alreadyRead) return;
    try {
      await updateDoc(doc(db, "notifications", nId), {
        readBy: arrayUnion(uid),
      });
      // local state will update via onSnapshot
    } catch (err) {
      console.error("mark read", err);
      showToast("Failed to mark read");
    }
  }

  // convenience: toggling panel
  function toggle() {
    setOpen((s) => !s);
  }

  // auto-close composer helper
  function setShow(val) {
    setOpen(val);
  }

  return (
    <>
      {/* Bell button - you can also render this in your Navbar instead */}
      <div className={`qk-notif-bell ${className}`}>
        <button
          className="qk-bell-btn"
          aria-label="Notifications"
          onClick={toggle}
          title="Notifications"
        >
          <BellIcon />
          {unreadCount > 0 && <span className="qk-badge">{unreadCount}</span>}
        </button>
      </div>

      {/* Sliding panel */}
      <aside className={`qk-notif-panel ${open ? "open" : ""}`} role="region" aria-hidden={!open}>
        <div className="qk-notif-header">
          <div className="qk-notif-title">
            <strong>Notifications</strong>
            <span className="qk-sub">{notifications.length} total</span>
          </div>
          <div className="qk-header-actions">
            <button className="qk-close" onClick={() => setOpen(false)} aria-label="Close">
              <XIcon />
            </button>
          </div>
        </div>

        {/* Composer (admin only) */}
        {isAdmin && (
          <form className="qk-composer" onSubmit={handleSend}>
            <input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Notification title"
            />
            <textarea
              placeholder="Message (required)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              aria-label="Notification message"
            />
            <div className="qk-composer-actions">
              <button type="submit" className="qk-send-btn" disabled={sending}>
                {sending ? "Sending…" : <><SendIcon /> Send</>}
              </button>
            </div>
          </form>
        )}

        <div className="qk-notif-list">
          {loading && <div className="qk-muted">Loading…</div>}
          {!loading && notifications.length === 0 && <div className="qk-empty">No notifications yet.</div>}

          {notifications.map((n) => {
            const alreadyRead = n.readBy?.includes(uid);
            return (
              <div key={n.id} className={`qk-notif-item ${alreadyRead ? "read" : "unread"}`}>
                <div className="qk-notif-left">
                  <div className="qk-notif-meta">
                    <div className="qk-notif-title-row">
                      <div className="qk-notif-item-title">{n.title || "Message"}</div>
                      <div className="qk-notif-time">{n.createdAt ? n.createdAt.toLocaleString() : ""}</div>
                    </div>
                    <div className="qk-notif-sender">{n.senderName} {n.senderRole ? `• ${n.senderRole}` : ""}</div>
                  </div>

                  <div className="qk-notif-body">{n.message}</div>
                </div>

                <div className="qk-notif-actions">
                  {!alreadyRead && (
                    <button
                      title="Mark as read"
                      className="qk-icon-btn"
                      onClick={() => markAsRead(n.id, alreadyRead)}
                    >
                      <CheckIcon />
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      title="Delete"
                      className="qk-icon-btn delete"
                      onClick={() => handleDelete(n.id)}
                    >
                      <Trash2Icon />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="qk-panel-footer">
          <small className="qk-muted">Real-time notifications — {isAdmin ? "admin" : "user"} view</small>
        </div>

        {/* simple inline toast */}
        {toast && <div className="qk-toast">{toast}</div>}
      </aside>
    </>
  );
}