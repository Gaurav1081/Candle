// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  type: {
    type: String,
    required: true,
    enum: [
      'prediction_result',   // TIME_WINDOW / TARGET prediction evaluated
      'vs_result',           // VS match completed
      'vs_invite',           // Someone invited you to a VS match
      'vs_joined',           // Someone joined your open VS match
      'community_like',      // Someone liked your post
      'streak_milestone',    // Streak achievement (3, 7, 14, 30 days)
      'rank_change',         // Global rank improved
      'system',              // Generic system message
    ]
  },

  title: {
    type: String,
    required: true,
    maxlength: 100
  },

  message: {
    type: String,
    required: true,
    maxlength: 300
  },

  // Optional metadata — varies by type
  meta: {
    // prediction_result
    predictionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction', default: null },
    ticker:         { type: String, default: null },
    isCorrect:      { type: Boolean, default: null },
    points:         { type: Number, default: null },

    // vs_result / vs_invite / vs_joined
    matchId:        { type: String, default: null },           // VsMatch.matchId (string)
    vsMatchObjId:   { type: mongoose.Schema.Types.ObjectId, ref: 'VsMatch', default: null },
    isWinner:       { type: Boolean, default: null },
    opponentName:   { type: String, default: null },

    // community_like
    postId:         { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', default: null },
    likedByUsername:{ type: String, default: null },

    // rank_change
    oldRank:        { type: Number, default: null },
    newRank:        { type: Number, default: null },

    // streak_milestone
    streakDays:     { type: Number, default: null },
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index: fetch unread for a user sorted by newest
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);