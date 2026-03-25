// config/durations.js
// Central configuration for prediction time windows

/**
 * Duration configuration for TIME_WINDOW predictions
 * - Stores as MINUTES in database (numeric)
 * - Maps to human-readable labels
 * - Calculates milliseconds for evaluation timing
 */

const DURATION_CONFIG = {
  // Short-term (intraday)
  10: {
    label: '10 Minutes',
    shortLabel: '10m',
    minutes: 10,
    milliseconds: 10 * 60 * 1000,
    category: 'intraday'
  },
  20: {
    label: '20 Minutes',
    shortLabel: '20m',
    minutes: 20,
    milliseconds: 20 * 60 * 1000,
    category: 'intraday'
  },
  30: {
    label: '30 Minutes',
    shortLabel: '30m',
    minutes: 30,
    milliseconds: 30 * 60 * 1000,
    category: 'intraday'
  },
  60: {
    label: '1 Hour',
    shortLabel: '1h',
    minutes: 60,
    milliseconds: 60 * 60 * 1000,
    category: 'intraday'
  },
  // Medium-term (days)
  1440: {
    label: '1 Day',
    shortLabel: '1D',
    minutes: 1440,
    milliseconds: 24 * 60 * 60 * 1000,
    category: 'daily'
  },
  10080: {
    label: '7 Days',
    shortLabel: '7D',
    minutes: 10080,
    milliseconds: 7 * 24 * 60 * 60 * 1000,
    category: 'weekly'
  },
  43200: {
    label: '30 Days',
    shortLabel: '30D',
    minutes: 43200,
    milliseconds: 30 * 24 * 60 * 60 * 1000,
    category: 'monthly'
  }
};

// Valid duration values (in minutes)
const VALID_DURATIONS = Object.keys(DURATION_CONFIG).map(Number);

// Get duration config by minutes
const getDurationConfig = (minutes) => {
  return DURATION_CONFIG[minutes] || null;
};

// Get display label by minutes
const getDurationLabel = (minutes) => {
  const config = DURATION_CONFIG[minutes];
  return config ? config.label : `${minutes} minutes`;
};

// Get short label by minutes
const getDurationShortLabel = (minutes) => {
  const config = DURATION_CONFIG[minutes];
  return config ? config.shortLabel : `${minutes}m`;
};

// Get milliseconds by minutes
const getDurationMilliseconds = (minutes) => {
  const config = DURATION_CONFIG[minutes];
  return config ? config.milliseconds : minutes * 60 * 1000;
};

// Legacy support: Convert old string format to minutes
const convertLegacyDuration = (legacyValue) => {
  const legacyMap = {
    '1D': 1440,
    '7D': 10080,
    '30D': 43200
  };
  return legacyMap[legacyValue] || null;
};

// Convert minutes back to legacy format (for backward compatibility)
const convertToLegacyFormat = (minutes) => {
  const reverseMap = {
    1440: '1D',
    10080: '7D',
    43200: '30D'
  };
  return reverseMap[minutes] || null;
};

module.exports = {
  DURATION_CONFIG,
  VALID_DURATIONS,
  getDurationConfig,
  getDurationLabel,
  getDurationShortLabel,
  getDurationMilliseconds,
  convertLegacyDuration,
  convertToLegacyFormat
};