// test-durations.js
// Quick test script to verify duration system works correctly

const {
  DURATION_CONFIG,
  VALID_DURATIONS,
  getDurationConfig,
  getDurationLabel,
  getDurationShortLabel,
  getDurationMilliseconds,
  convertLegacyDuration,
  convertToLegacyFormat
} = require('./src/config/durations');

console.log('🧪 Testing Duration Configuration\n');

// Test 1: Valid durations
console.log('✅ Valid Durations:', VALID_DURATIONS);
console.log('   Expected: [10, 20, 30, 60, 1440, 10080, 43200]\n');

// Test 2: Get labels
console.log('✅ Duration Labels:');
VALID_DURATIONS.forEach(minutes => {
  const label = getDurationLabel(minutes);
  const shortLabel = getDurationShortLabel(minutes);
  console.log(`   ${minutes} minutes → "${label}" (${shortLabel})`);
});
console.log();

// Test 3: Get milliseconds
console.log('✅ Duration to Milliseconds:');
[10, 60, 1440].forEach(minutes => {
  const ms = getDurationMilliseconds(minutes);
  const hours = (ms / (1000 * 60 * 60)).toFixed(2);
  console.log(`   ${minutes} minutes → ${ms} ms (${hours} hours)`);
});
console.log();

// Test 4: Legacy conversion
console.log('✅ Legacy Format Conversion:');
['1D', '7D', '30D'].forEach(legacy => {
  const minutes = convertLegacyDuration(legacy);
  console.log(`   "${legacy}" → ${minutes} minutes`);
});
console.log();

// Test 5: Reverse conversion
console.log('✅ Minutes to Legacy Format:');
[1440, 10080, 43200].forEach(minutes => {
  const legacy = convertToLegacyFormat(minutes);
  console.log(`   ${minutes} minutes → "${legacy}"`);
});
console.log();

// Test 6: New durations (should NOT convert to legacy)
console.log('✅ New Durations (no legacy format):');
[10, 20, 30, 60].forEach(minutes => {
  const legacy = convertToLegacyFormat(minutes);
  console.log(`   ${minutes} minutes → ${legacy === null ? 'null (expected)' : legacy}`);
});
console.log();

// Test 7: Evaluation time calculation
console.log('✅ Evaluation Time Calculation:');
const now = new Date();
console.log(`   Current time: ${now.toISOString()}`);

[10, 60, 1440].forEach(minutes => {
  const ms = getDurationMilliseconds(minutes);
  const evaluateAt = new Date(now.getTime() + ms);
  console.log(`   ${minutes} min prediction → Evaluate at ${evaluateAt.toISOString()}`);
});
console.log();

// Test 8: Get full config
console.log('✅ Full Config for 60 minutes:');
const hourConfig = getDurationConfig(60);
console.log('   ', JSON.stringify(hourConfig, null, 2));
console.log();

console.log('🎉 All tests completed!\n');

// Quick validation
const allTestsPassed = 
  VALID_DURATIONS.length === 7 &&
  getDurationLabel(10) === '10 Minutes' &&
  getDurationShortLabel(1440) === '1D' &&
  convertLegacyDuration('7D') === 10080 &&
  convertToLegacyFormat(10) === null;

if (allTestsPassed) {
  console.log('✅ ✅ ✅ All validations PASSED! Duration system is working correctly.\n');
} else {
  console.log('❌ ❌ ❌ Some validations FAILED! Check the output above.\n');
  process.exit(1);
}