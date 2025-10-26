import React, { useEffect, useState, createContext, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("qikaoUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Simulate login (replace with API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const isAdmin = email === "admin@qikao.com" && password === "admin123";
      const userData = {
        id: "1",
        name: isAdmin ? "Admin User" : "Regular User",
        email,
        isAdmin,
      };

      setUser(userData);
      localStorage.setItem("qikaoUser", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        isAdmin: false,
      };
      setUser(userData);
      localStorage.setItem("qikaoUser", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("qikaoUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {isLoading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};