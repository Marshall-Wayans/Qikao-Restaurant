import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

//This is the Qikao Admin PIN
const ADMIN_PIN = "qikao2025";

// sessionStorage key — kept per tab, cleared on tab close
const PIN_SESSION_KEY = "qk_admin_verified";

export default function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinVerified, setPinVerified] = useState(
    () => sessionStorage.getItem(PIN_SESSION_KEY) === "1"
  );
  const [shake, setShake] = useState(false);

  if (isLoading) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  //When a user is not logged in, it sends thm to the signin page
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // When a user is logged in but is not an admin, sends them to the home pag
  if (!user.isAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin user but PIN not yet verified this session
  if (!pinVerified) {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (pinInput.trim() === ADMIN_PIN) {
        sessionStorage.setItem(PIN_SESSION_KEY, "1");
        setPinVerified(true);
        setPinError("");
      } else {
        setPinError("Incorrect PIN. Please try again.");
        setPinInput("");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    };

    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, animation: shake ? "shake 0.4s ease" : "none" }}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>Q</div>
            <span style={styles.logoText}>
              Qikao <span style={styles.logoRed}>Grill</span>
            </span>
          </div>

          <div style={styles.lockIcon}>🔒</div>
          <h2 style={styles.heading}>Admin Access</h2>
          <p style={styles.sub}>Enter the admin PIN to continue</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {pinError && <div style={styles.errorBox}>{pinError}</div>}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Admin PIN</label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
                placeholder="Enter PIN"
                autoFocus
                style={styles.input}
                onFocus={(e) => { e.target.style.borderColor = "#ef4444"; e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.12)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "#e0e0e8"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button type="submit" style={styles.btn}
              onMouseEnter={(e) => { e.target.style.background = "#dc2626"; }}
              onMouseLeave={(e) => { e.target.style.background = "#ef4444"; }}
            >
              Verify &amp; Enter
            </button>
          </form>

          <p style={styles.hint}>
            This panel is restricted to authorised administrators only.
          </p>
        </div>

        <style>{`
          @keyframes shake {
            0%   { transform: translateX(0); }
            20%  { transform: translateX(-8px); }
            40%  { transform: translateX(8px); }
            60%  { transform: translateX(-6px); }
            80%  { transform: translateX(6px); }
            100% { transform: translateX(0); }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }


  return children;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', 'Inter', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#ffffff",
    border: "1px solid #e8eaf0",
    borderRadius: "16px",
    padding: "36px 32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0px",
    animation: "fadeUp 0.35s ease",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    textDecoration: "none",
  },
  logoIcon: {
    width: "34px", height: "34px",
    background: "#ef4444",
    borderRadius: "9px",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: "800", fontSize: "17px",
  },
  logoText: {
    fontSize: "17px", fontWeight: "700", color: "#1a1a2e",
  },
  logoRed: { color: "#ef4444" },
  lockIcon: {
    fontSize: "36px",
    marginBottom: "10px",
    lineHeight: 1,
  },
  heading: {
    fontSize: "21px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 6px",
    textAlign: "center",
  },
  sub: {
    fontSize: "13.5px",
    color: "#9ca3af",
    margin: "0 0 22px",
    textAlign: "center",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "9px 13px",
    fontSize: "13px",
    color: "#dc2626",
    fontWeight: "500",
    textAlign: "center",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    height: "44px",
    border: "1px solid #e0e0e8",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "15px",
    color: "#1a1a2e",
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
    fontFamily: "inherit",
    letterSpacing: "0.15em",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    height: "46px",
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.18s",
    fontFamily: "inherit",
    marginTop: "2px",
  },
  hint: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#c0c0cc",
    textAlign: "center",
    lineHeight: "1.5",
  },
  loader: {
    position: "fixed",
    inset: 0,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  spinner: {
    width: "40px", height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #ef4444",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};