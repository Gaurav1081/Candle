// contexts/AuthContext.jsx  (fixed)
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [error, setError]     = useState(null);

  // `loading` is ONLY true during the initial token check on app mount.
  // It must NEVER be set to true during login/register — doing so causes
  // App.jsx to render <LoadingScreen />, which unmounts <AuthGate /> and
  // wipes the error message before it can display (looks like a page refresh).
  const [loading, setLoading] = useState(true);

  // Separate per-action flags that the Login/Signup forms use for their
  // own spinner — these never affect the top-level LoadingScreen gate.
  const [loginLoading,    setLoginLoading]    = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // ── Initial auth check ────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false); // ← only place this is ever set to false after init
      }
    };
    initAuth();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (emailOrUsername, password) => {
    try {
      setError(null);
      setLoginLoading(true); // ← local flag only, never touches `loading`

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (userData) => {
    try {
      setError(null);
      setRegisterLoading(true); // ← local flag only

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setRegisterLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // ── Generic API helper ────────────────────────────────────────────────────
  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      logout();
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  };

  const value = {
    user,
    loading,          // true only during initial mount check
    loginLoading,     // use this in <Login /> for the button spinner
    registerLoading,  // use this in <Signup /> for the button spinner
    error,
    login,
    register,
    logout,
    updateProfile,
    apiCall,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};