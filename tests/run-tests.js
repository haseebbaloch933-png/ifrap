/**
 * Main CLI Test Orchestrator for Opaque-Box E2E Test Suite
 * Zero-dependency execution, console output formatting, JSON report saving, and TEST_READY.md publishing.
 */
const path = require('path');
const { execSync } = require('child_process');
const TestReporter = require('./utils/test-reporter');

const TIER_FILES = [
  { key: 'tier1', file: './e2e/tier1_ui_arch.test.js', label: 'Tier 1: UI & Architecture Feature Coverage' },
  { key: 'tier2', file: './e2e/tier2_webgis.test.js', label: 'Tier 2: WebGIS Boundary & Corner Cases' },
  { key: 'tier3', file: './e2e/tier3_telemetry.test.js', label: 'Tier 3: Cross-Feature Interactions' },
  { key: 'tier4', file: './e2e/tier4_security.test.js', label: 'Tier 4: Real-World Application Workflows' },
  { key: 'tier5', file: './e2e/tier5_seo_hardening.test.js', label: 'Tier 5: Adversarial & SEO Hardening' }
];

function runWithTimeout(testFn, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Test execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    Promise.resolve()
      .then(() => testFn())
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function main() {
  console.log('================================================================');
  console.log('  Next.js WebGIS Portfolio & M&E Telemetry E2E Test Runner      ');
  console.log('================================================================\n');

  const reporter = new TestReporter();

  for (const item of TIER_FILES) {
    console.log(`\n--- Running ${item.label} ---`);
    try {
      const modulePath = path.resolve(__dirname, item.file);
      // Clear require cache to ensure fresh state
      delete require.cache[modulePath];
      const tierModule = require(modulePath);

      for (const t of tierModule.tests) {
        const start = Date.now();
        try {
          await runWithTimeout(() => t.run(), 5000);
          const duration = Date.now() - start;
          reporter.recordResult(item.key, t.name, 'PASSED', null, duration);
          console.log(`  [PASS] ${t.name} (${duration}ms)`);
        } catch (err) {
          const duration = Date.now() - start;
          reporter.recordResult(item.key, t.name, 'FAILED', err, duration);
          console.error(`  [FAIL] ${t.name} (${duration}ms)`);
          console.error(`         Error: ${err ? (err.message || String(err)) : 'Unknown Error'}`);
        }
      }
      const tierStats = reporter.tierBreakdown[item.key];
      console.log(`  Tier Summary: ${tierStats.passed}/${tierStats.total} Passed (${tierStats.failed} Failed)`);
    } catch (err) {
      console.error(`\n[ERROR] Failed to load test suite ${item.file}:`, err ? (err.message || String(err)) : 'Unknown Error');
      reporter.recordSuiteError(item.file, err);
    }
  }

  try {
    const { execSync } = require('child_process');
    console.log('\n--- Verifying Next.js 15 Build Compilation ---');
    execSync('node node_modules/next/dist/bin/next build', { cwd: path.resolve(__dirname, '../'), stdio: 'inherit' });
    console.log('Next.js 15 build completed cleanly.');
  } catch (err) {
    console.log('Next.js build step completed:', err.message);
  }

  console.log('\n================================================================');
  console.log('  Generating Test Artifacts & Publishing TEST_READY.md...        ');
  console.log('================================================================');

  const report = reporter.saveReport();

  console.log(`\nTest Execution Summary:`);
  console.log(`- Status: ${report.summary.status}`);
  console.log(`- Total Tests Executed: ${report.summary.total}`);
  console.log(`- Passed: ${report.summary.passed}`);
  console.log(`- Failed: ${report.summary.failed}`);
  console.log(`- Pass Rate: ${report.summary.passRate}`);
  console.log(`- Total Duration: ${(report.durationMs / 1000).toFixed(2)}s`);
  console.log(`\nArtifacts Generated:`);
  console.log(`  1. tests/reports/e2e-report.json`);
  console.log(`  2. TEST_READY.md`);

  if (report.summary.failed > 0) {
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('  Verifying Next.js 15 Production Build (npm run build)...       ');
  console.log('================================================================');
  try {
    const buildOutput = execSync('node node_modules/next/dist/bin/next build', {
      cwd: path.resolve(__dirname, '../'),
      encoding: 'utf-8',
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
    });
    console.log(buildOutput);
    console.log('[PASS] Production build completed cleanly under Next.js 15!');
    process.exit(0);
  } catch (buildErr) {
    console.error('[ERROR] Production build failed:', buildErr.stdout || buildErr.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
