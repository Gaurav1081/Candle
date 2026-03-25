// contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const POLL_INTERVAL_MS   = 60_000;  // Poll every 60s — safe for any rate limit config
const BACKOFF_INTERVAL_MS = 5 * 60_000; // Back off to 5 min if we hit a 429

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const pollRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  // ── Fetch notifications from backend ──────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications?limit=30`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      // Silently skip on rate limit or auth error — don't crash
      if (res.status === 429 || res.status === 401) return;
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      console.warn('fetchNotifications error (skipping):', err.message);
    }
  }, [isAuthenticated]);

  // ── Poll only unread count (lightweight) ─────────────────────────────────
  const pollUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      // If rate-limited, back off: clear current interval and restart at 5 min
      if (res.status === 429) {
        console.warn('Notifications: rate limited, backing off to 5 min polling');
        clearInterval(pollRef.current);
        pollRef.current = setInterval(pollUnreadCount, BACKOFF_INTERVAL_MS);
        return;
      }

      if (!res.ok) return;
      const data = await res.json();

      // If count changed, do a full refresh so bell updates instantly
      setUnreadCount(prev => {
        if (prev !== data.unreadCount) fetchNotifications();
        return data.unreadCount;
      });
    } catch (err) {
      // Network error — silently skip, don't crash the app
      console.warn('pollUnreadCount network error (skipping):', err.message);
    }
  }, [isAuthenticated, fetchNotifications]);

  // ── Initial load + start polling ─────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      clearInterval(pollRef.current);
      return;
    }

    // Initial fetch
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));

    // Start polling at normal interval
    pollRef.current = setInterval(pollUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [isAuthenticated, fetchNotifications, pollUnreadCount]);

  // ── Mark one notification as read ─────────────────────────────────────────
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  }, []);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('markAllAsRead error:', err);
    }
  }, []);

  // ── Delete one notification ───────────────────────────────────────────────
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications(prev => {
        const removed = prev.find(n => n._id === notificationId);
        if (removed && !removed.isRead) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
    } catch (err) {
      console.error('deleteNotification error:', err);
    }
  }, []);

  // ── Clear all notifications ───────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('clearAll error:', err);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};