// validators/predictionValidators.js
const { body } = require('express-validator');
const { VALID_DURATIONS } = require('../config/durations');

const validateEventPrediction = [
  body('company').notEmpty().withMessage('Company name is required'),
  body('ticker').notEmpty().matches(/^[A-Z]{1,5}$/).withMessage('Ticker must be 1-5 uppercase letters'),
  body('predictionType').equals('EVENT').withMessage('Must be EVENT type'),
  body('eventType').isIn(['earnings', 'product_launch', 'other']).withMessage('Invalid event type'),
  body('eventDate').isISO8601().withMessage('Event date must be valid'),
  body('eventOutcome').isIn(['Beat', 'Meet', 'Miss']).withMessage('Event outcome must be Beat, Meet, or Miss'),
  body('confidence').optional().isInt({ min: 1, max: 5 }).withMessage('Confidence must be 1-5')
];

const validateTimeWindowPrediction = [
  body('company').notEmpty().withMessage('Company name is required'),
  body('ticker').notEmpty().matches(/^[A-Z]{1,5}$/).withMessage('Ticker must be 1-5 uppercase letters'),
  body('predictionType').equals('TIME_WINDOW').withMessage('Must be TIME_WINDOW type'),
  
  // NEW: Accept numeric duration in minutes
  body('durationMinutes')
    .optional()
    .custom((value) => {
      const numValue = parseInt(value);
      if (!VALID_DURATIONS.includes(numValue)) {
        throw new Error(`Duration must be one of: ${VALID_DURATIONS.join(', ')} minutes`);
      }
      return true;
    })
    .withMessage('Invalid duration'),
  
  // LEGACY: Still accept old string format
  body('timeWindow')
    .optional()
    .isIn(['1D', '7D', '30D'])
    .withMessage('Time window must be 1D, 7D, or 30D'),
  
  // Require at least one duration format
  body()
    .custom((value) => {
      if (!value.durationMinutes && !value.timeWindow) {
        throw new Error('Either durationMinutes or timeWindow is required');
      }
      return true;
    }),
  
  body('priceDirection').isIn(['UP', 'DOWN', 'FLAT']).withMessage('Direction must be UP, DOWN, or FLAT'),
  body('startPrice').isFloat({ min: 0 }).withMessage('Start price must be positive'),
  body('confidence').optional().isInt({ min: 1, max: 5 }).withMessage('Confidence must be 1-5')
];

const validateTargetPrediction = [
  body('company').notEmpty().withMessage('Company name is required'),
  body('ticker').notEmpty().matches(/^[A-Z]{1,5}$/).withMessage('Ticker must be 1-5 uppercase letters'),
  body('predictionType').equals('TARGET').withMessage('Must be TARGET type'),
  body('targetPrice').isFloat({ min: 0 }).withMessage('Target price must be positive'),
  body('targetDate').isISO8601().withMessage('Target date must be valid'),
  body('entryPrice').isFloat({ min: 0 }).withMessage('Entry price must be positive'),
  body('confidence').optional().isInt({ min: 1, max: 5 }).withMessage('Confidence must be 1-5')
];

module.exports = { 
  validateEventPrediction, 
  validateTimeWindowPrediction, 
  validateTargetPrediction 
};