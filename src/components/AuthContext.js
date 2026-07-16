// src/components/AuthContext.js
// ─── Authentication Context ──────────────────────────────────
// Provides login state to the entire app.
// Stores JWT token and user info in localStorage.
// All components can use useAuth() to check login status.

"use client";

import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the context (this is like a "global store")
const AuthContext = createContext(null);

// 2. Provider component — wraps the entire app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Currently logged-in user
  const [loading, setLoading] = useState(true);  // True while checking localStorage

  // On first load, check if user was already logged in
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // If localStorage data is corrupted, clear it
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  // Login function — saves token and user to localStorage + state
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function — clears everything
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Get the saved token (used for API calls)
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // The value we share with all components
  const value = {
    user,        // The user object (null if not logged in)
    loading,     // True while checking localStorage on first load
    login,       // Call this after successful login/register
    logout,      // Call this to log out
    getToken,    // Call this to get the JWT token for API calls
    isLoggedIn: !!user,  // Quick boolean check
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook — use this in any component to access auth
//    Example: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
