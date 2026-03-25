// controllers/vsController.js
const VsMatch = require('../models/VsMatch');
const User = require('../models/User');
const { fetchCurrentPrice } = require('../services/predictionEvaluator');
const { createNotification } = require('./notificationController'); // ← ADDED

/**
 * Create a new VS match
 * POST /api/vs/create
 */
const createVsMatch = async (req, res) => {
  try {
    const { stockSymbol, company, exchange, durationMinutes, matchType, invitedUsername } = req.body;
    const userId = req.user.id;
    
    // Validate match type
    if (!['invite', 'open'].includes(matchType)) {
      return res.status(400).json({ message: 'Invalid match type' });
    }
    
    // If invite mode, validate invited user exists
    let invitedUser = null; // ← ADDED: capture for notification
    if (matchType === 'invite') {
      if (!invitedUsername) {
        return res.status(400).json({ message: 'Invited username required for invite mode' });
      }
      
      invitedUser = await User.findOne({ username: invitedUsername }); // ← CHANGED: assign to invitedUser
      if (!invitedUser) {
        return res.status(404).json({ message: `User ${invitedUsername} not found` });
      }
      
      if (invitedUser._id.toString() === userId) {
        return res.status(400).json({ message: 'Cannot invite yourself' });
      }
    }
    
    // Create match
    const match = new VsMatch({
      stockSymbol: stockSymbol.toUpperCase(),
      company,
      exchange,
      durationMinutes,
      matchType,
      invitedUsername: matchType === 'invite' ? invitedUsername : null,
      createdBy: userId,
      status: 'waiting'
    });
    
    // Add creator as first participant
    const creator = await User.findById(userId);
    match.addParticipant(userId, creator.username);
    
    await match.save();

    // Notify invited user if this is an invite match ← ADDED
    if (match.matchType === 'invite' && invitedUser) {
      await _notifyVsInvite(match, invitedUser);
    }
    
    res.status(201).json({
      message: 'VS match created',
      match
    });
  } catch (error) {
    console.error('Error creating VS match:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Join an open VS match
 * POST /api/vs/:matchId/join
 */
const joinVsMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;
    
    const match = await VsMatch.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    if (match.status !== 'waiting') {
      return res.status(400).json({ message: 'Match is not accepting players' });
    }
    
    if (match.isFull) {
      return res.status(400).json({ message: 'Match is full' });
    }
    
    // Check if invite-only
    if (match.matchType === 'invite') {
      const user = await User.findById(userId);
      if (match.invitedUsername !== user.username) {
        return res.status(403).json({ message: 'This match is invite-only' });
      }
    }
    
    // Add user as participant
    const user = await User.findById(userId);
    match.addParticipant(userId, user.username);
    
    await match.save();

    await _notifyVsJoined(match, user); // ← ADDED (uses already-fetched user)
    
    res.json({
      message: 'Joined VS match',
      match
    });
  } catch (error) {
    console.error('Error joining VS match:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Submit prediction for VS match
 * POST /api/vs/:matchId/predict
 */
const submitVsPrediction = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { priceDirection, confidence } = req.body;
    const userId = req.user.id;
    
    const match = await VsMatch.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    if (match.status !== 'waiting') {
      return res.status(400).json({ message: 'Match is locked or completed' });
    }
    
    // Validate user is in match
    const participant = match.participants.find(p => p.userId.toString() === userId);
    if (!participant) {
      return res.status(403).json({ message: 'You are not in this match' });
    }
    
    if (participant.priceDirection) {
      return res.status(400).json({ message: 'You have already submitted your prediction' });
    }
    
    // Fetch current price as reference
    const referencePrice = await fetchCurrentPrice(match.stockSymbol);
    
    if (!referencePrice) {
      return res.status(500).json({ message: 'Failed to fetch current stock price' });
    }
    
    // Submit prediction
    match.submitPrediction(userId, priceDirection, confidence || 3, referencePrice);
    
    await match.save();
    
    // Check if match is now locked
    const isLocked = match.status === 'locked';
    
    res.json({
      message: isLocked ? 'Match locked! Both predictions submitted' : 'Prediction submitted',
      match,
      isLocked
    });
  } catch (error) {
    console.error('Error submitting VS prediction:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user's VS matches
 * GET /api/vs/my-matches?status=waiting|locked|completed
 */
const getMyVsMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    const query = {
      'participants.userId': userId
    };
    
    if (status) {
      query.status = status;
    }
    
    const matches = await VsMatch.find(query)
      .populate('createdBy', 'username fullName')
      .populate('participants.userId', 'username fullName')
      .populate('winnerUserId', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ matches });
  } catch (error) {
    console.error('Error fetching user VS matches:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get open VS matches (that user can join)
 * GET /api/vs/open
 */
const getOpenVsMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const matches = await VsMatch.find({
      matchType: 'open',
      status: 'waiting',
      'participants.userId': { $ne: userId } // Not already in
    })
      .populate('createdBy', 'username fullName')
      .populate('participants.userId', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({ matches });
  } catch (error) {
    console.error('Error fetching open VS matches:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user's VS invites (pending)
 * GET /api/vs/invites
 */
const getMyInvites = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const invites = await VsMatch.find({
      matchType: 'invite',
      status: 'waiting',
      invitedUsername: user.username,
      'participants.userId': { $ne: userId } // Not already joined
    })
      .populate('createdBy', 'username fullName')
      .populate('participants.userId', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ invites });
  } catch (error) {
    console.error('Error fetching VS invites:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get VS match details
 * GET /api/vs/:matchId
 */
const getVsMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const match = await VsMatch.findById(matchId)
      .populate('createdBy', 'username fullName')
      .populate('participants.userId', 'username fullName')
      .populate('winnerUserId', 'username fullName');
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json({ match });
  } catch (error) {
    console.error('Error fetching VS match details:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user VS stats
 * GET /api/vs/stats/:userId?
 */
const getVsStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const user = await User.findById(userId).select('username fullName vsStats');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get match history
    const matches = await VsMatch.find({
      'participants.userId': userId,
      status: 'completed'
    })
      .populate('participants.userId', 'username')
      .sort({ evaluatedAt: -1 })
      .limit(10);
    
    res.json({
      user: {
        username: user.username,
        fullName: user.fullName
      },
      vsStats: user.vsStats || {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        totalPoints: 0,
        winRate: 0
      },
      recentMatches: matches
    });
  } catch (error) {
    console.error('Error fetching VS stats:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cancel a VS match (creator only, before lock)
 * DELETE /api/vs/:matchId
 */
const cancelVsMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;
    
    const match = await VsMatch.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    if (match.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only match creator can cancel' });
    }
    
    if (match.status !== 'waiting') {
      return res.status(400).json({ message: 'Cannot cancel locked or completed match' });
    }
    
    match.status = 'cancelled';
    match.resultDetails = 'Match cancelled by creator';
    await match.save();
    
    res.json({ message: 'Match cancelled' });
  } catch (error) {
    console.error('Error cancelling VS match:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification helpers
// ─────────────────────────────────────────────────────────────────────────────

// Notify invited user when a VS invite is created ← ADDED
const _notifyVsInvite = async (match, invitedUser) => {
  try {
    const creator = match.participants[0]; // Creator is always first participant
    await createNotification({
      userId:  invitedUser._id,
      type:    'vs_invite',
      title:   '⚔️ VS Challenge Received!',
      message: `${creator.username} challenged you to a VS match on ${match.stockSymbol}!`,
      meta: {
        matchId:      match.matchId,
        vsMatchObjId: match._id,
        opponentName: creator.username,
        ticker:       match.stockSymbol,
      }
    });
  } catch (err) {
    console.error('_notifyVsInvite error:', err);
  }
};

// Notify match creator when someone joins their open match ← ADDED
const _notifyVsJoined = async (match, joinerUser) => {
  try {
    const creatorId = match.createdBy;
    // Don't notify if creator joined their own open match (edge case)
    if (creatorId.toString() === joinerUser._id.toString()) return;
    await createNotification({
      userId:  creatorId,
      type:    'vs_joined',
      title:   '🎮 Someone joined your VS match!',
      message: `${joinerUser.username} joined your open VS match on ${match.stockSymbol}. Submit your prediction!`,
      meta: {
        matchId:      match.matchId,
        vsMatchObjId: match._id,
        opponentName: joinerUser.username,
        ticker:       match.stockSymbol,
      }
    });
  } catch (err) {
    console.error('_notifyVsJoined error:', err);
  }
};

module.exports = {
  createVsMatch,
  joinVsMatch,
  submitVsPrediction,
  getMyVsMatches,
  getOpenVsMatches,
  getMyInvites,
  getVsMatchDetails,
  getVsStats,
  cancelVsMatch
};