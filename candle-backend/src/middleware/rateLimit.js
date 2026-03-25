// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// ── Auth endpoints: login, register ──────────────────────────────────────────
// Generous enough for normal dev use, still blocks brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 30,                     // was 5 — way too low even for dev
  message: { message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts toward the limit
});

// ── General API: all other routes ────────────────────────────────────────────
// Old limit: 100/15min = ~6 req/min — one VS page load already fires 6 calls
// New limit: 500/min per IP, plenty for a single user in dev
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,    // 1 minute window (easier to reason about)
  max: 500,                    // 500 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  // Return JSON so the frontend can parse it properly
  // (fixes the "Unexpected token 'T'" SyntaxError — was returning plain text)
  message: { message: 'Too many requests, please slow down.' },
});

// ── Notification polling: lighter limit for the poll endpoint ─────────────────
// /api/notifications/unread-count is called every 30s — give it its own bucket
const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 10,                    // max 10 polls/min (polling every 30s = 2/min normally)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many notification requests.' },
});

module.exports = { authLimiter, generalLimiter, notificationLimiter };