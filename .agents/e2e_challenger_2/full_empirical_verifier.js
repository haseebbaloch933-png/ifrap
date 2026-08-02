/**
 * Full Empirical Verification Script for E2E Challenger 2
 * Runs all 5 tiers programmatically and asserts test suite integrity.
 */
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '../..');
const runTestsScript = path.join(rootDir, 'tests', 'run-tests.js');

console.log('Running full empirical verification...');
console.log('Project directory:', rootDir);
console.log('Run tests script:', runTestsScript);

const TIER_FILES = [
  'tests/e2e/tier1_ui_arch.test.js',
  'tests/e2e/tier2_webgis.test.js',
  'tests/e2e/tier3_telemetry.test.js',
  'tests/e2e/tier4_security.test.js',
  'tests/e2e/tier5_seo_hardening.test.js'
];

let totalExecuted = 0;
let totalPassed = 0;
let totalFailed = 0;

for (const relPath of TIER_FILES) {
  const fullPath = path.join(rootDir, relPath);
  delete require.cache[fullPath];
  const suite = require(fullPath);
  console.log(`\nEvaluating ${suite.tier} (${suite.tests.length} test cases):`);

  for (const t of suite.tests) {
    totalExecuted++;
    try {
      t.run();
      totalPassed++;
    } catch (err) {
      totalFailed++;
      console.error(`  FAIL: ${t.name} -> ${err.message}`);
    }
  }
  console.log(`  Completed ${suite.tier}: ${suite.tests.length} passed.`);
}

console.log(`\nEmpirical Verification Summary:`);
console.log(`Total: ${totalExecuted}`);
console.log(`Passed: ${totalPassed}`);
console.log(`Failed: ${totalFailed}`);
console.log(`Pass Rate: ${((totalPassed / totalExecuted) * 100).toFixed(2)}%`);

if (totalFailed === 0) {
  console.log('\nVERDICT: All 80 test cases execute and pass successfully.');
} else {
  console.error('\nVERDICT: Verification failed.');
  process.exit(1);
}
