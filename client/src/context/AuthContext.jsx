import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getProfile, logoutUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);   // only for initial token validation
  const [error, setError] = useState(null);

  // ─── Validate existing token on mount ───────────────────────────────────

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile();
        setUser(response.data.user);
        setToken(storedToken);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await loginUser(email, password);
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // ─── Register ───────────────────────────────────────────────────────────

  const register = useCallback(async (userData) => {
    setError(null);

    try {
      const response = await registerUser(userData);

      // Don't expect token/user yet
      return response.data;

    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed.";

      setError(message);
      throw new Error(message);
    }
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Ignore — token may already be expired
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  // ─── Clear error ────────────────────────────────────────────────────────

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
