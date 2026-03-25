// jobs/vsEvaluationJob.js
const cron = require('node-cron');
const { evaluateAllDueVsMatches, cleanupExpiredMatches } = require('../services/vsEvaluator');

/**
 * VS Match Evaluation Job
 * Runs every 5 minutes to evaluate completed matches
 */
const startVsEvaluationJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔥 Running VS match evaluation job...');
    
    try {
      const result = await evaluateAllDueVsMatches();
      console.log(`✅ VS evaluation job completed: ${result.evaluated} evaluated, ${result.failed} failed`);
    } catch (error) {
      console.error('❌ VS evaluation job failed:', error);
    }
  });
  
  console.log('✅ VS evaluation job scheduled (every 5 minutes)');
};

/**
 * VS Match Cleanup Job
 * Runs every 5 minutes to cleanup expired waiting matches (30min timeout)
 */
const startVsCleanupJob = () => {
  // Run every 5 minutes (since matches expire in 30 minutes)
  cron.schedule('*/5 * * * *', async () => {
    console.log('🧹 Running VS match cleanup job...');
    
    try {
      const count = await cleanupExpiredMatches();
      if (count > 0) {
        console.log(`✅ VS cleanup job completed: ${count} matches cleaned up`);
      }
    } catch (error) {
      console.error('❌ VS cleanup job failed:', error);
    }
  });
  
  console.log('✅ VS cleanup job scheduled (every 5 minutes)');
};

module.exports = {
  startVsEvaluationJob,
  startVsCleanupJob
};