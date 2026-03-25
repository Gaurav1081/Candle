// controllers/notificationController.js
const Notification = require('../models/Notification');

// ─── GET /api/notifications ──────────────────────────────────────────────────
// Returns the 30 most recent notifications for the logged-in user.
// Query params:
//   ?unreadOnly=true   — only return unread notifications
//   ?limit=N           — override default limit (max 50)
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = Math.min(parseInt(req.query.limit) || 30, 50);

    const filter = { userId };
    if (unreadOnly) filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// ─── GET /api/notifications/unread-count ────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
};

// ─── PATCH /api/notifications/:id/read ──────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// ─── PATCH /api/notifications/read-all ──────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ updated: result.modifiedCount });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

// ─── DELETE /api/notifications/:id ──────────────────────────────────────────
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('deleteNotification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// ─── DELETE /api/notifications ──────────────────────────────────────────────
const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user._id });
    res.json({ deleted: result.deletedCount });
  } catch (error) {
    console.error('deleteAllNotifications error:', error);
    res.status(500).json({ message: 'Failed to delete notifications' });
  }
};

// ─── Utility: create a notification (used internally by other services) ─────
const createNotification = async ({
  userId,
  type,
  title,
  message,
  meta = {}
}) => {
  try {
    const notification = await Notification.create({ userId, type, title, message, meta });
    return notification;
  } catch (error) {
    // Non-fatal — log and continue so it never breaks the calling flow
    console.error('createNotification error:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
};