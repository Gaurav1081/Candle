// services/vsEvaluator.js
// VS match evaluation - reuses core prediction logic
const { createNotification } = require('../controllers/notificationController');
const VsMatch = require('../models/VsMatch');
const User = require('../models/User');
const {
  calculatePoints,
  calculateTimeWindowOutcome,
  fetchCurrentPrice
} = require('./predictionEvaluator');

/**
 * Notify both participants of a completed VS match result
 */
const _notifyVsResult = async (match) => {
  try {
    for (const participant of match.participants) {
      const isWinner = match.winnerUserId
        ? match.winnerUserId.toString() === participant.userId.toString()
        : null; // null = tie
      const opponent = match.participants.find(
        p => p.userId.toString() !== participant.userId.toString()
      );
      let title, message;
      if (isWinner === null) {
        title   = "🤝 VS Match — It's a Tie!";
        message = `Your VS match on ${match.stockSymbol} against ${opponent?.username ?? 'opponent'} ended in a draw.`;
      } else if (isWinner) {
        title   = '🏆 VS Match Won!';
        message = `You beat ${opponent?.username ?? 'opponent'} in your ${match.stockSymbol} VS match! +${participant.points} pts`;
      } else {
        title   = '💔 VS Match Lost';
        message = `${opponent?.username ?? 'opponent'} beat you in the ${match.stockSymbol} VS match. Better luck next time!`;
      }
      await createNotification({
        userId:  participant.userId,
        type:    'vs_result',
        title,
        message,
        meta: {
          matchId:      match.matchId,
          vsMatchObjId: match._id,
          isWinner:     isWinner ?? false,
          opponentName: opponent?.username ?? null,
          ticker:       match.stockSymbol,
          points:       participant.points,
        }
      });
    }
  } catch (err) {
    console.error('_notifyVsResult error:', err);
  }
};

/**
 * Evaluate a single VS match
 * Uses same scoring logic as TIME_WINDOW predictions
 */
const evaluateVsMatch = async (matchId) => {
  try {
    const match = await VsMatch.findById(matchId).populate('participants.userId', 'username');
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    if (match.status !== 'locked') {
      throw new Error('Match is not locked yet');
    }
    
    if (match.participants.length !== 2) {
      throw new Error('Match does not have 2 participants');
    }
    
    // Fetch current price
    const exitPrice = await fetchCurrentPrice(match.stockSymbol);
    
    if (!exitPrice) {
      console.error(`Cannot evaluate VS match ${matchId}: Failed to fetch price for ${match.stockSymbol}`);
      return null;
    }
    
    console.log(`🔥 Evaluating VS match ${matchId}: ${match.stockSymbol} @ $${exitPrice}`);
    
    // Evaluate each participant
    const results = match.participants.map(participant => {
      const entryPrice = participant.referencePrice;
      const priceChange = ((exitPrice - entryPrice) / entryPrice) * 100;
      
      // Use same outcome calculation as TIME_WINDOW predictions
      const outcome = calculateTimeWindowOutcome(participant.priceDirection, priceChange);
      
      // Use same points calculation as TIME_WINDOW predictions
      const points = calculatePoints('TIME_WINDOW', outcome, participant.confidence);
      
      return {
        userId: participant.userId,
        username: participant.username,
        priceDirection: participant.priceDirection,
        confidence: participant.confidence,
        entryPrice,
        exitPrice,
        priceChange,
        outcome,
        points,
        isCorrect: (outcome === 'Beat' || outcome === 'Meet')
      };
    });
    
    // Determine winner (highest points, or tie)
    const [p1, p2] = results;
    let winnerUserId = null;
    let resultDetails = '';
    
    if (p1.points > p2.points) {
      winnerUserId = p1.userId;
      p1.isWinner = true;
      resultDetails = `${p1.username} wins with ${p1.points} pts (${p1.outcome}) vs ${p2.username} with ${p2.points} pts (${p2.outcome})`;
    } else if (p2.points > p1.points) {
      winnerUserId = p2.userId;
      p2.isWinner = true;
      resultDetails = `${p2.username} wins with ${p2.points} pts (${p2.outcome}) vs ${p1.username} with ${p1.points} pts (${p1.outcome})`;
    } else {
      // Tie
      resultDetails = `TIE! Both scored ${p1.points} pts (${p1.username}: ${p1.outcome}, ${p2.username}: ${p2.outcome})`;
    }
    
    // Update match with results
    match.participants[0].exitPrice = p1.exitPrice;
    match.participants[0].percentChange = p1.priceChange;
    match.participants[0].outcome = p1.outcome;
    match.participants[0].points = p1.points;
    match.participants[0].isWinner = p1.isWinner;
    
    match.participants[1].exitPrice = p2.exitPrice;
    match.participants[1].percentChange = p2.priceChange;
    match.participants[1].outcome = p2.outcome;
    match.participants[1].points = p2.points;
    match.participants[1].isWinner = p2.isWinner;
    
    match.winnerUserId = winnerUserId;
    match.resultDetails = resultDetails;
    match.status = 'completed';
    match.evaluatedAt = new Date();
    
    await match.save();
    await _notifyVsResult(match);
    
    // Update VS stats for both users (separate from global leaderboard)
    await updateVsStats(p1.userId, p1.isWinner, p1.points);
    await updateVsStats(p2.userId, p2.isWinner, p2.points);
    
    console.log(`✅ VS match ${matchId} evaluated: ${resultDetails}`);
    
    return match;
  } catch (error) {
    console.error(`Error evaluating VS match ${matchId}:`, error);
    throw error;
  }
};

/**
 * Update user VS statistics (separate from global stats)
 * Does NOT affect global leaderboard
 */
const updateVsStats = async (userId, isWinner, points) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Initialize VS stats if not exist
    if (!user.vsStats) {
      user.vsStats = {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        totalPoints: 0,
        winRate: 0
      };
    }
    
    user.vsStats.totalMatches += 1;
    user.vsStats.totalPoints += points;
    
    if (isWinner === true) {
      user.vsStats.wins += 1;
    } else if (isWinner === false) {
      user.vsStats.losses += 1;
    } else {
      user.vsStats.ties += 1;
    }
    
    // Calculate win rate
    user.vsStats.winRate = (user.vsStats.wins / user.vsStats.totalMatches) * 100;
    
    await user.save();
    
    console.log(`📊 Updated VS stats for ${user.username}: ${user.vsStats.wins}W-${user.vsStats.losses}L-${user.vsStats.ties}T (${user.vsStats.winRate.toFixed(1)}% win rate)`);
  } catch (error) {
    console.error('Error updating VS stats:', error);
  }
};

/**
 * Evaluate all due VS matches
 * Called by cron job
 */
const evaluateAllDueVsMatches = async () => {
  const now = new Date();
  
  try {
    const dueMatches = await VsMatch.find({
      status: 'locked',
      evaluateAt: { $lte: now }
    });
    
    console.log(`🔍 Found ${dueMatches.length} VS matches to evaluate`);
    
    let evaluated = 0;
    let failed = 0;
    
    for (const match of dueMatches) {
      try {
        await evaluateVsMatch(match._id);
        evaluated++;
      } catch (error) {
        console.error(`Error evaluating VS match ${match._id}:`, error);
        failed++;
      }
    }
    
    console.log(`✅ VS evaluation complete: ${evaluated} evaluated, ${failed} failed out of ${dueMatches.length} total`);
    
    return { evaluated, failed, total: dueMatches.length };
  } catch (error) {
    console.error('Error in evaluateAllDueVsMatches:', error);
    throw error;
  }
};

/**
 * Clean up expired waiting matches (24h timeout)
 */
const cleanupExpiredMatches = async () => {
  const now = new Date();
  
  try {
    const result = await VsMatch.updateMany(
      {
        status: 'waiting',
        expiresAt: { $lte: now }
      },
      {
        $set: {
          status: 'cancelled',
          resultDetails: 'Match expired - no opponent joined'
        }
      }
    );
    
    console.log(`🧹 Cleaned up ${result.modifiedCount} expired VS matches`);
    
    return result.modifiedCount;
  } catch (error) {
    console.error('Error cleaning up expired matches:', error);
    throw error;
  }
};

module.exports = {
  evaluateVsMatch,
  evaluateAllDueVsMatches,
  updateVsStats,
  cleanupExpiredMatches,
  _notifyVsResult
};