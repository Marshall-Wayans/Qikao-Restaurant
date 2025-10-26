import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import SignIn from "./pages/Auth/SignIn";
import Register from "./pages/Auth/Register";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/UserManagement";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

// --- Scroll to top on every route change ---
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// --- Ultra Modern Loader (Red / White / Black) ---
function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeInOut 0.3s ease-in-out forwards",
      }}
    >
      <div className="modern-loader">
        <div className="loader-ring outer-ring"></div>
        <div className="loader-ring middle-ring"></div>
        <div className="loader-ring inner-ring"></div>
        <div className="loader-core"></div>
      </div>

      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: scale(0.9); }
            30% { opacity: 1; transform: scale(1.02); }
            70% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.9); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .modern-loader {
            position: relative;
            width: 80px;
            height: 80px;
          }

          .loader-ring {
            position: absolute;
            border-radius: 50%;
            border-style: solid;
            animation: spin 0.8s linear infinite;
          }

          .outer-ring {
            inset: 0;
            border-width: 4px;
            border-color: #000 #000 transparent transparent;
            animation-duration: 0.9s;
            filter: drop-shadow(0 0 4px rgba(0,0,0,0.3));
          }

          .middle-ring {
            inset: 10px;
            border-width: 4px;
            border-color: #ff0000 #ff0000 transparent transparent;
            animation-duration: 0.7s;
            filter: drop-shadow(0 0 8px rgba(255,0,0,0.4));
          }

          .inner-ring {
            inset: 20px;
            border-width: 3px;
            border-color: #aaa #aaa transparent transparent;
            animation-duration: 0.5s;
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
          }

          .loader-core {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 16px;
            height: 16px;
            background: radial-gradient(circle, #000 0%, #ff0000 70%, #fff 100%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.4);
          }
        `}
      </style>
    </div>
  );
}

// --- Page transitions with loader + scroll reset ---
function AppContent() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300); // 0.3 seconds
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      <ScrollToTop />
      {loading && <LoadingScreen />}
      {!loading && (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="menu" element={<Menu />} />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route path="signin" element={<SignIn />} />
          <Route path="register" element={<Register />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
