// models/Prediction.js
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  ticker: { type: String, required: true },
  
  // Prediction Type Discriminator
  predictionType: { 
    type: String, 
    required: true, 
    enum: ['EVENT', 'TIME_WINDOW', 'TARGET'] 
  },
  
  // EVENT-BASED fields (Beat/Meet/Miss for earnings)
  eventType: { 
    type: String, 
    enum: ['earnings', 'product_launch', 'merger', 'regulation', 'other']
  },
  eventDate: { type: Date },
  eventOutcome: { 
    type: String, 
    enum: ['Beat', 'Meet', 'Miss']
  },
  eventPrediction: { 
    type: String, 
    enum: ['Beat', 'Meet', 'Miss']
  },
  actualResult: { 
    type: String, 
    enum: ['Beat', 'Meet', 'Miss']
  },
  // Earnings-specific data
  expectedEPS: { type: Number }, // Analyst consensus
  actualEPS: { type: Number }, // Actual reported
  expectedRevenue: { type: Number }, // Optional
  actualRevenue: { type: Number }, // Optional
  tolerance: { type: Number, default: 2 }, // Tolerance % for Meet (default 2%)
  
  // TIME-WINDOW fields
  timeWindow: { 
    type: String, 
    enum: ['1D', '7D', '30D'] // DEPRECATED: Legacy string format for backward compatibility
  },
  durationMinutes: {
    type: Number, // NEW: Duration in minutes (10, 20, 30, 60, 1440, 10080, 43200)
    min: 1
  },
  priceDirection: { 
    type: String, 
    enum: ['UP', 'DOWN', 'FLAT']
  },
  direction: { type: String, enum: ['UP', 'DOWN', 'FLAT'] }, // Alias for compatibility
  startPrice: { type: Number },
  entryPrice: { type: Number }, // Alias for startPrice
  exitPrice: { type: Number },
  
  // TARGET-PRICE fields
  targetPrice: { type: Number },
  targetDate: { type: Date },
  highestPrice: { type: Number },
  hitTargetAt: { type: Date },
  
  // Common fields
  confidence: { type: Number, min: 1, max: 5, default: 3 },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'locked', 'evaluated'] 
  },
  
  // Result fields
  isCorrect: { type: Boolean }, // For TIME_WINDOW and TARGET
  points: { type: Number, default: 0 },
  resultDetails: { type: String },
  
  // Timestamps
  lockAt: { type: Date, required: true },
  evaluateAt: { type: Date, required: true },
  evaluatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Virtual field to get duration (handles both old and new format)
predictionSchema.virtual('duration').get(function() {
  // New format takes precedence
  if (this.durationMinutes) {
    return this.durationMinutes;
  }
  
  // Convert legacy format to minutes
  if (this.timeWindow) {
    const { convertLegacyDuration } = require('../config/durations');
    return convertLegacyDuration(this.timeWindow);
  }
  
  return null;
});

// Indexes
predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ status: 1, lockAt: 1 });
predictionSchema.index({ status: 1, evaluateAt: 1 });
predictionSchema.index({ userId: 1, ticker: 1, predictionType: 1, status: 1 });
predictionSchema.index({ durationMinutes: 1 }); // New index for filtering by duration

// Ensure virtuals are included in JSON output
predictionSchema.set('toJSON', { virtuals: true });
predictionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Prediction', predictionSchema);