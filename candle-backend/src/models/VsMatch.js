// models/VsMatch.js
const mongoose = require('mongoose');

const vsMatchSchema = new mongoose.Schema({
  // Match identification
  matchId: {
    type: String,
    unique: true,
    required: true,
    default: () => `VS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Stock information
  stockSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  company: {
    type: String,
    required: true
  },
  exchange: {
    type: String,
    required: true
  },
  
  // Match settings
  durationMinutes: {
    type: Number,
    required: true,
    enum: [10, 20, 30, 60, 1440, 10080, 43200] // Same as TIME_WINDOW predictions
  },
  
  // Match type
  matchType: {
    type: String,
    enum: ['invite', 'open'],
    required: true
  },
  
  // Match status
  status: {
    type: String,
    enum: ['waiting', 'locked', 'active', 'completed', 'cancelled'],
    default: 'waiting'
  },
  
  // Creator info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Invite-specific (if matchType = 'invite')
  invitedUsername: {
    type: String,
    default: null
  },
  
  // Participants (max 2)
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    // Their prediction - NO ENUM HERE, we validate manually
    priceDirection: {
      type: String,
      default: null,
      validate: {
        validator: function(v) {
          // Allow null OR valid enum values
          return v === null || ['UP', 'DOWN', 'FLAT'].includes(v);
        },
        message: props => `${props.value} is not a valid price direction`
      }
    },
    confidence: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    // Reference price when they joined
    referencePrice: {
      type: Number,
      default: null
    },
    submittedAt: {
      type: Date,
      default: null
    },
    // Results (populated after evaluation)
    exitPrice: {
      type: Number,
      default: null
    },
    percentChange: {
      type: Number,
      default: null
    },
    outcome: {
      type: String,
      default: null,
      validate: {
        validator: function(v) {
          // Allow null OR valid enum values
          return v === null || ['Beat', 'Meet', 'Miss'].includes(v);
        },
        message: props => `${props.value} is not a valid outcome`
      }
    },
    points: {
      type: Number,
      default: 0
    },
    isWinner: {
      type: Boolean,
      default: false
    }
  }],
  
  // Match timing
  startTime: {
    type: Date,
    default: null // Set when both users submit
  },
  lockAt: {
    type: Date,
    default: null // Set when match becomes active
  },
  evaluateAt: {
    type: Date,
    default: null // startTime + durationMinutes
  },
  evaluatedAt: {
    type: Date,
    default: null
  },
  
  // Winner
  winnerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Result details
  resultDetails: {
    type: String,
    default: null
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes to join
  }
}, {
  timestamps: true
});

// Indexes
vsMatchSchema.index({ status: 1, createdAt: -1 });
vsMatchSchema.index({ createdBy: 1, status: 1 });
vsMatchSchema.index({ 'participants.userId': 1, status: 1 });
vsMatchSchema.index({ matchType: 1, status: 1 });
vsMatchSchema.index({ evaluateAt: 1, status: 1 });
vsMatchSchema.index({ expiresAt: 1, status: 1 }); // For cleanup

// Virtual to check if match is full
vsMatchSchema.virtual('isFull').get(function() {
  return this.participants.length >= 2;
});

// Virtual to check if both predictions submitted
vsMatchSchema.virtual('bothSubmitted').get(function() {
  return this.participants.length === 2 && 
         this.participants.every(p => p.priceDirection && p.referencePrice);
});

// Method to add participant
vsMatchSchema.methods.addParticipant = function(userId, username) {
  if (this.participants.length >= 2) {
    throw new Error('Match is full');
  }
  
  if (this.participants.some(p => p.userId.toString() === userId.toString())) {
    throw new Error('User already in this match');
  }
  
  this.participants.push({
    userId,
    username,
    priceDirection: null,
    confidence: 3,
    referencePrice: null,
    submittedAt: null
  });
};

// Method to submit prediction
vsMatchSchema.methods.submitPrediction = function(userId, priceDirection, confidence, referencePrice) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  
  if (!participant) {
    throw new Error('User not in this match');
  }
  
  if (participant.priceDirection) {
    throw new Error('Prediction already submitted');
  }
  
  participant.priceDirection = priceDirection;
  participant.confidence = confidence;
  participant.referencePrice = referencePrice;
  participant.submittedAt = new Date();
  
  // If both submitted, activate match
  if (this.bothSubmitted) {
    this.status = 'locked';
    this.startTime = new Date();
    this.lockAt = new Date();
    
    const { getDurationMilliseconds } = require('../config/durations');
    this.evaluateAt = new Date(Date.now() + getDurationMilliseconds(this.durationMinutes));
  }
};

// Ensure virtuals are included in JSON output
vsMatchSchema.set('toJSON', { virtuals: true });
vsMatchSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('VsMatch', vsMatchSchema);