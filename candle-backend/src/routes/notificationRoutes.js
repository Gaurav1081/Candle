// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { notificationLimiter } = require('../middleware/rateLimit');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require('../controllers/notificationController');

router.use(authenticateToken);

// Polling endpoint — uses lighter rate limiter so it never triggers 429
router.get('/unread-count', notificationLimiter, getUnreadCount);

router.get('/',             getNotifications);
router.patch('/read-all',   markAllAsRead);
router.patch('/:id/read',   markAsRead);
router.delete('/',          deleteAllNotifications);
router.delete('/:id',       deleteNotification);

module.exports = router;