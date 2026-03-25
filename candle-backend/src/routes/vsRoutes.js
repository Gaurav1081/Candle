// routes/vsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createVsMatch,
  joinVsMatch,
  submitVsPrediction,
  getMyVsMatches,
  getOpenVsMatches,
  getMyInvites,
  getVsMatchDetails,
  getVsStats,
  cancelVsMatch
} = require('../controllers/vsController');

// All VS routes require authentication
router.use(auth);

// Create new VS match
router.post('/create', createVsMatch);

// Get open matches
router.get('/open', getOpenVsMatches);

// Get my invites
router.get('/invites', getMyInvites);

// Get my matches
router.get('/my-matches', getMyVsMatches);

// Get VS stats
router.get('/stats/:userId?', getVsStats);

// Get match details
router.get('/:matchId', getVsMatchDetails);

// Join a match
router.post('/:matchId/join', joinVsMatch);

// Submit prediction
router.post('/:matchId/predict', submitVsPrediction);

// Cancel match
router.delete('/:matchId', cancelVsMatch);

module.exports = router;