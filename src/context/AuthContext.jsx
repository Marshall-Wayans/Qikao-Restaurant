// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Users, Session, Notifications } from "../store/localStore";

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session on mount
  useEffect(() => {
    const stored = Session.get();
    if (stored) {
      // Re-fetch the latest user data from the store in case it was updated
      const fresh = Users.getById(stored.id);
      if (fresh) {
        const { password: _, ...safe } = fresh;
        setUser(safe);
        Session.set(safe);
      } else {
        Session.clear();
      }
    }
    setIsLoading(false);
  }, []);

  /* ---- LOGIN ---- */
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400)); // simulate async

      const found = Users.getByEmail(email);
      if (!found) throw new Error("No account found with that email.");
      if (found.password !== password) throw new Error("Incorrect password.");

      // Update lastLogin
      Users.update(found.id, { lastLogin: new Date().toLocaleString(), status: "Active" });

      const { password: _, ...safe } = { ...found, lastLogin: new Date().toLocaleString() };
      Session.set(safe);
      setUser(safe);

      // Notify admin of login
      if (!safe.isAdmin) {
        Notifications.add({
          type: "login",
          title: "User Logged In",
          message: `${safe.name} (${safe.email}) just signed in`,
          targetRole: "admin",
          senderUid: safe.id,
          senderName: safe.name,
          senderRole: "user",
        });
      }

      return safe;
    } finally {
      setIsLoading(false);
    }
  };

  /* ---- REGISTER ---- */
  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));

      if (Users.getByEmail(email)) throw new Error("An account with this email already exists.");

      const newUser = Users.add({
        id: `usr_${Date.now()}`,
        name,
        email,
        password,
        role: "user",
        isAdmin: false,
        status: "Active",
        photoURL: "",
        lastLogin: new Date().toLocaleString(),
      });

      const { password: _, ...safe } = newUser;
      Session.set(safe);
      setUser(safe);

      // Notify admin of new registration
      Notifications.add({
        type: "register",
        title: "New User Registered 🎉",
        message: `${name} (${email}) just created an account`,
        targetRole: "admin",
        senderUid: safe.id,
        senderName: name,
        senderRole: "user",
      });

      return safe;
    } finally {
      setIsLoading(false);
    }
  };

  /* ---- LOGOUT ---- */
  const logout = () => {
    Session.clear();
    setUser(null);
  };

  /* ---- UPDATE PROFILE (for admin photo etc) ---- */
  const updateProfile = (patch) => {
    if (!user) return;
    Users.update(user.id, patch);
    const updated = { ...user, ...patch };
    Session.set(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {isLoading ? (
        <div style={{
          position: "fixed", inset: 0, background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{
            width: 44, height: 44,
            border: "4px solid #f0f0f0", borderTop: "4px solid #ef4444",
            borderRadius: "50%", animation: "spin 0.7s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};