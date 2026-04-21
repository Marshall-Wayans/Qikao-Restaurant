// src/store/localStore.js
// Central localStorage store — replaces Firebase.
// All reads/writes go through here. Components subscribe via window events.

const KEYS = {
  USERS:         "qk_users",
  CURRENT_USER:  "qk_current_user",
  NOTIFICATIONS: "qk_notifications",
  ORDERS:        "qk_orders",
  MESSAGES:      "qk_messages",      // user → admin direct messages
};

/* ---------- helpers ---------- */
function read(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function readOne(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch { return null; }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new CustomEvent("qk_store_change", { detail: { key } }));
}

/* ---------- USERS ---------- */
export const Users = {
  getAll: () => read(KEYS.USERS),

  getByEmail: (email) =>
    read(KEYS.USERS).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,

  getById: (id) => read(KEYS.USERS).find((u) => u.id === id) || null,

  add: (user) => {
    const all = read(KEYS.USERS);
    const newUser = { ...user, createdAt: new Date().toISOString() };
    write(KEYS.USERS, [...all, newUser]);
    return newUser;
  },

  update: (id, patch) => {
    const all = read(KEYS.USERS).map((u) => (u.id === id ? { ...u, ...patch } : u));
    write(KEYS.USERS, all);
  },

  delete: (id) => {
    write(KEYS.USERS, read(KEYS.USERS).filter((u) => u.id !== id));
  },

  count: () => read(KEYS.USERS).length,

  // Seed a default admin if none exists
  seedAdmin: () => {
    const all = read(KEYS.USERS);
    if (!all.find((u) => u.role === "admin")) {
      const admin = {
        id: "admin_001",
        name: "Admin",
        email: "admin@qikao.com",
        password: "admin123",   // hashed in a real app
        role: "admin",
        isAdmin: true,
        status: "Active",
        photoURL: "",
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };
      write(KEYS.USERS, [...all, admin]);
    }
  },
};

/* ---------- CURRENT USER (session) ---------- */
export const Session = {
  get: () => readOne(KEYS.CURRENT_USER),

  set: (user) => {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("qk_store_change", { detail: { key: KEYS.CURRENT_USER } }));
  },

  clear: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
    window.dispatchEvent(new CustomEvent("qk_store_change", { detail: { key: KEYS.CURRENT_USER } }));
  },
};

/* ---------- NOTIFICATIONS ---------- */
export const Notifications = {
  getAll: () => read(KEYS.NOTIFICATIONS).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

  // Notifications visible to a specific user (admin broadcasts + system events)
  forUser: (userId) => {
    return Notifications.getAll().filter((n) => {
      if (n.targetRole === "admin") return false;   // admin-only
      return true;
    });
  },

  // All notifications for admin
  forAdmin: () => Notifications.getAll(),

  add: (notif) => {
    const all = read(KEYS.NOTIFICATIONS);
    const n = {
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      readBy: [],
      ...notif,
    };
    write(KEYS.NOTIFICATIONS, [n, ...all]);
    return n;
  },

  markRead: (notifId, userId) => {
    const all = read(KEYS.NOTIFICATIONS).map((n) =>
      n.id === notifId && !n.readBy.includes(userId)
        ? { ...n, readBy: [...n.readBy, userId] }
        : n
    );
    write(KEYS.NOTIFICATIONS, all);
  },

  markAllRead: (userId) => {
    const all = read(KEYS.NOTIFICATIONS).map((n) =>
      n.readBy.includes(userId) ? n : { ...n, readBy: [...n.readBy, userId] }
    );
    write(KEYS.NOTIFICATIONS, all);
  },

  delete: (notifId) => {
    write(KEYS.NOTIFICATIONS, read(KEYS.NOTIFICATIONS).filter((n) => n.id !== notifId));
  },

  unreadCount: (userId) =>
    read(KEYS.NOTIFICATIONS).filter((n) => !n.readBy.includes(userId)).length,
};

/* ---------- ORDERS ---------- */
export const Orders = {
  getAll: () => read(KEYS.ORDERS).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

  getByUser: (userId) => Orders.getAll().filter((o) => o.userId === userId),

  add: (order) => {
    const all = read(KEYS.ORDERS);
    const o = { ...order, createdAt: new Date().toISOString() };
    write(KEYS.ORDERS, [o, ...all]);
    return o;
  },

  updateStatus: (orderId, status) => {
    const all = read(KEYS.ORDERS).map((o) =>
      o.orderId === orderId ? { ...o, status } : o
    );
    write(KEYS.ORDERS, all);
  },

  totalRevenue: () => Orders.getAll().reduce((s, o) => s + (o.total || 0), 0),

  count: () => read(KEYS.ORDERS).length,
};

/* ---------- DIRECT MESSAGES (user → admin) ---------- */
export const Messages = {
  getAll: () => read(KEYS.MESSAGES).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

  add: (msg) => {
    const all = read(KEYS.MESSAGES);
    const m = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      readByAdmin: false,
      ...msg,
    };
    write(KEYS.MESSAGES, [m, ...all]);
    return m;
  },

  markRead: (msgId) => {
    const all = read(KEYS.MESSAGES).map((m) =>
      m.id === msgId ? { ...m, readByAdmin: true } : m
    );
    write(KEYS.MESSAGES, all);
  },

  unreadCount: () => read(KEYS.MESSAGES).filter((m) => !m.readByAdmin).length,
};

/* ---------- React hook to subscribe to store changes ---------- */
import { useEffect, useState } from "react";

export function useStore(selector, keys = []) {
  const [value, setValue] = useState(() => selector());

  useEffect(() => {
    const handler = (e) => {
      if (keys.length === 0 || keys.includes(e.detail?.key)) {
        setValue(selector());
      }
    };
    window.addEventListener("qk_store_change", handler);
    return () => window.removeEventListener("qk_store_change", handler);
  }, []);

  return value;
}

// Init on first load
Users.seedAdmin();