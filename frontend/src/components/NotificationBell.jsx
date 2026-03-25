// components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Swords, Target, Heart, Trophy, TrendingUp, Info } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

// ── Icon map by notification type ─────────────────────────────────────────
const TYPE_ICON = {
  prediction_result: Target,
  vs_result:         Swords,
  vs_invite:         Swords,
  vs_joined:         Swords,
  community_like:    Heart,
  streak_milestone:  TrendingUp,
  rank_change:       Trophy,
  system:            Info,
};

// ── Colour accent map by type ─────────────────────────────────────────────
const TYPE_COLOR = {
  prediction_result: 'text-blue-400',
  vs_result:         'text-yellow-400',
  vs_invite:         'text-orange-400',
  vs_joined:         'text-orange-400',
  community_like:    'text-pink-400',
  streak_milestone:  'text-green-400',
  rank_change:       'text-purple-400',
  system:            'text-slate-400',
};

// ── Relative time helper ──────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleItemClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full
                   hover:bg-candle-electric-blue/10 transition-colors focus:outline-none
                   focus:ring-2 focus:ring-candle-electric-blue/40"
        aria-label="Notifications"
      >
        <Bell className="size-5 text-candle-muted-blue hover:text-white transition-colors" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center
                           min-w-[18px] h-[18px] px-1 rounded-full
                           bg-candle-electric-blue text-white text-[10px] font-bold
                           shadow-glow-sm animate-pulse-subtle">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[520px]
                        flex flex-col rounded-xl border border-candle-electric-blue/20
                        bg-candle-deep-dark/95 backdrop-blur-xl shadow-2xl z-[100]
                        overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-candle-electric-blue/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-candle-electric-blue" />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-candle-electric-blue/20
                                 text-candle-electric-blue text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-md text-candle-muted-blue hover:text-white
                             hover:bg-candle-electric-blue/10 transition-colors"
                >
                  <CheckCheck className="size-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="p-1.5 rounded-md text-candle-muted-blue hover:text-red-400
                             hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-candle-muted-blue hover:text-white
                           hover:bg-candle-electric-blue/10 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              /* Skeleton loading state */
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                      <div className="h-2.5 bg-white/5 rounded w-full" />
                      <div className="h-2 bg-white/5 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="size-10 text-candle-electric-blue/20 mb-3" />
                <p className="text-sm text-white/50 font-medium">No notifications yet</p>
                <p className="text-xs text-white/30 mt-1">
                  Prediction results and VS updates will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-candle-electric-blue/5">
                {notifications.map((n) => {
                  const Icon  = TYPE_ICON[n.type]  ?? Info;
                  const color = TYPE_COLOR[n.type] ?? 'text-slate-400';

                  return (
                    <div
                      key={n._id}
                      onClick={() => handleItemClick(n)}
                      className={`group relative flex gap-3 px-4 py-3.5 cursor-pointer
                                  transition-colors hover:bg-candle-electric-blue/5
                                  ${!n.isRead ? 'bg-candle-electric-blue/[0.04]' : ''}`}
                    >
                      {/* Unread dot */}
                      {!n.isRead && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2
                                         w-1.5 h-1.5 rounded-full bg-candle-electric-blue" />
                      )}

                      {/* Icon bubble */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center
                                       justify-center bg-white/5 ${color}`}>
                        <Icon className="size-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-snug
                                       ${!n.isRead ? 'text-white' : 'text-white/70'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-white/50 mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-white/30 mt-1.5">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {/* Delete button (shows on hover) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100
                                   p-1 rounded text-white/20 hover:text-red-400
                                   hover:bg-red-500/10 transition-all"
                        title="Remove"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-candle-electric-blue/10
                            flex-shrink-0 flex items-center justify-between">
              <span className="text-[10px] text-white/30">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] text-candle-electric-blue/70
                             hover:text-candle-electric-blue transition-colors"
                >
                  <Check className="size-3" />
                  Mark all read
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}