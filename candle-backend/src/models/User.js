// models/User.js (UPDATED VERSION with VS stats)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  stats: {
    currentStreak: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    globalRank: { type: Number, default: null },
    accuracyRate: { type: Number, default: 0 },
    totalPredictions: { type: Number, default: 0 },
    correctPredictions: { type: Number, default: 0 }
  },
  // NEW: VS-specific stats (separate from global leaderboard)
  vsStats: {
    totalMatches: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    ties: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 } // Percentage
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'stats.globalRank': 1 });
userSchema.index({ 'vsStats.wins': -1 }); // NEW: For VS leaderboard

module.exports = mongoose.model('User', userSchema);