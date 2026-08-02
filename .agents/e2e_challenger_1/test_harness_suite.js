/**
 /**
 * Empirical Stress Test Suite for E2E Test Runner & Reporter
 * Location: .agents/e2e_challenger_1/test_harness_suite.js
 */
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const NODE_BIN = 'C:\\Program Files\\nodejs\\node.exe';
const RUNNER_PATH = path.join(PROJECT_ROOT, 'tests', 'run-tests.js');
const TestReporter = require(path.join(PROJECT_ROOT, 'tests', 'utils', 'test-reporter.js'));

const results = [];

function recordStressResult(testName, passed, details) {
  results.push({ testName, passed, details });
  console.log(`[STRESS TEST] ${passed ? 'PASS' : 'FAIL'}: ${testName}`);
  if (details) {
    console.log(`  > ${details}`);
  }
}

// ----------------------------------------------------------------------------
// Test 1: Baseline Execution Timing, Exit Code, and Report Integrity
// ----------------------------------------------------------------------------
function testBaselineExecution() {
  const proc = spawnSync(NODE_BIN, [RUNNER_PATH], { cwd: PROJECT_ROOT, encoding: 'utf-8' });
  const exitCode = proc.status;
  const stdout = proc.stdout || '';
  const stderr = proc.stderr || '';

  const reportPath = path.join(PROJECT_ROOT, 'tests', 'reports', 'e2e-report.json');
  const readyPath = path.join(PROJECT_ROOT, 'TEST_READY.md');

  const reportExists = fs.existsSync(reportPath);
  const readyExists = fs.existsSync(readyPath);

  let reportData = null;
  if (reportExists) {
    reportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  }

  const passed = (
    exitCode === 0 &&
    reportExists &&
    readyExists &&
    reportData &&
    reportData.summary.total === 80 &&
    reportData.summary.passed === 80 &&
    reportData.summary.failed === 0 &&
    reportData.summary.status === 'PASSED'
  );

  recordStressResult(
    'Baseline Runner Execution & Artifact Generation',
    passed,
    `ExitCode: ${exitCode}, TotalTests: ${reportData?.summary?.total}, Duration: ${reportData?.durationMs}ms`
  );
}

// ----------------------------------------------------------------------------
// Test 2: Vulnerability Check — Module Load Failure Masking (Exit Code 0 on Load Error)
// ----------------------------------------------------------------------------
function testModuleLoadFailureMasking() {
  // We construct a mock runner scenario where one tier file fails to load (e.g. non-existent file or syntax error)
  const mockTierFiles = [
    { key: 'tier1', file: './e2e/tier1_ui_arch.test.js', label: 'Tier 1' },
    { key: 'tier_broken', file: './e2e/non_existent_file.js', label: 'Broken Tier' }
  ];

  const reporter = new TestReporter();
  let caughtLoadError = false;

  for (const item of mockTierFiles) {
    try {
      const modulePath = path.resolve(PROJECT_ROOT, 'tests', item.file);
      require(modulePath);
    } catch (err) {
      caughtLoadError = true;
      // Mirroring run-tests.js logic:
      // console.error(`[ERROR] Failed to load test suite ${item.file}:`, err.message);
    }
  }

  const report = reporter.saveReport();
  const runnerWouldExitZero = report.summary.failed === 0;

  // PASS for this stress test means we successfully EXPOSED the vulnerability:
  // caughtLoadError is true, BUT report.summary.failed is 0 (exit 0 vulnerability present)
  recordStressResult(
    'Vulnerability Exposure: Module Load Failure Masking (Exit Code 0 despite missing/broken file)',
    caughtLoadError && runnerWouldExitZero,
    `CaughtLoadError: ${caughtLoadError}, FailureCountRecorded: ${report.summary.failed}, RunnerExitCode: ${runnerWouldExitZero ? 0 : 1}`
  );
}

// ----------------------------------------------------------------------------
// Test 3: Vulnerability Check — Non-Error Primitive Throw (throw null / undefined / string)
// ----------------------------------------------------------------------------
function testNonErrorThrowHandling() {
  const reporter = new TestReporter();

  // Simulate test throwing null
  try {
    throw null;
  } catch (err) {
    reporter.recordResult('tier1', 'TC-NULL-THROW', 'FAILED', err, 10);
  }

  // Simulate test throwing string
  try {
    throw 'String Error Message';
  } catch (err) {
    reporter.recordResult('tier1', 'TC-STRING-THROW', 'FAILED', err, 12);
  }

  const report = reporter.saveReport();
  const nullTestResult = report.details.find(d => d.name === 'TC-NULL-THROW');
  const stringTestResult = report.details.find(d => d.name === 'TC-STRING-THROW');

  // If err is null, reporter.recordResult records error: null!
  const nullErrorIsRecordedAsNull = nullTestResult.error === null;
  const stringErrorRecorded = stringTestResult.error === 'String Error Message';

  recordStressResult(
    'Vulnerability Exposure: Non-Error Thrown Object Handling (throw null leads to error: null in JSON report)',
    nullErrorIsRecordedAsNull,
    `throw null recorded error field: ${JSON.stringify(nullTestResult.error)}; throw string recorded: ${JSON.stringify(stringTestResult.error)}`
  );
}

// ----------------------------------------------------------------------------
// Test 4: Vulnerability Check — Unknown Tier Breakdown Corruption
// ----------------------------------------------------------------------------
function testUnknownTierFallback() {
  const reporter = new TestReporter();
  reporter.recordResult('tier99', 'TC-UNKNOWN-TIER', 'PASSED', null, 5);
  
  const report = reporter.saveReport();
  const tier1Total = report.tierBreakdown.tier1.total;

  // Unknown tier 'tier99' fell back to 'tier1', inflating tier1 count
  recordStressResult(
    'Vulnerability Exposure: Unknown Tier Key silent fallback to Tier 1',
    tier1Total === 1,
    `Recorded under unknown key 'tier99'. tier1.total inflated to ${tier1Total}`
  );
}

// ----------------------------------------------------------------------------
// Test 5: Failure Assertion Exit Code & Reporting Integrity
// ----------------------------------------------------------------------------
function testAssertionFailureBehavior() {
  // Create a temporary failing runner test script in .agents directory
  const tempScriptPath = path.join(__dirname, 'temp_runner_fail.js');
  const tempScriptContent = `
const path = require('path');
const TestReporter = require('${path.join(PROJECT_ROOT, 'tests', 'utils', 'test-reporter.js').replace(/\\/g, '/')}');

const reporter = new TestReporter();
reporter.recordResult('tier1', 'Failing Test', 'FAILED', new Error('Assertion failed: expected true to be false'), 15);
const report = reporter.saveReport();
if (report.summary.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
  `;

  fs.writeFileSync(tempScriptPath, tempScriptContent, 'utf-8');
  const proc = spawnSync(NODE_BIN, [tempScriptPath], { cwd: PROJECT_ROOT, encoding: 'utf-8' });
  fs.unlinkSync(tempScriptPath);

  const exitCode = proc.status;
  const passed = exitCode === 1;

  recordStressResult(
    'Assertion Failure Exit Code Verification (Process exits 1 when tests fail)',
    passed,
    `ExitCode on failure: ${exitCode}`
  );
}

// Execute all stress tests
console.log('================================================================');
console.log('  EMPIRICAL CHALLENGER STRESS TEST SUITE EXECUTION             ');
console.log('================================================================\n');

testBaselineExecution();
testModuleLoadFailureMasking();
testNonErrorThrowHandling();
testUnknownTierFallback();
testAssertionFailureBehavior();

console.log('\n================================================================');
console.log(`  Stress Test Summary: ${results.filter(r => r.passed).length}/${results.length} Scenarios Evaluated`);
console.log('================================================================');
