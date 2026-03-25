// scripts/addVsStats.js
const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

async function addVsStats() {
  await User.updateMany(
    { vsStats: { $exists: false } },
    {
      $set: {
        vsStats: {
          totalMatches: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          totalPoints: 0,
          winRate: 0
        }
      }
    }
  );
  
  console.log('✅ Added vsStats to all users');
  process.exit(0);
}

addVsStats();