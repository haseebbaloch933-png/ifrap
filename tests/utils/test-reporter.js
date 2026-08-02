/**
 * Test Reporter & TEST_READY.md Publisher
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const REPORT_FILE = path.join(ROOT_DIR, 'tests', 'reports', 'e2e-report.json');
const TEST_READY_FILE = path.join(ROOT_DIR, 'TEST_READY.md');

class TestReporter {
  constructor() {
    this.startTime = Date.now();
    this.results = [];
    this.tierBreakdown = {
      tier1: { total: 0, passed: 0, failed: 0, skipped: 0, tests: [] },
      tier2: { total: 0, passed: 0, failed: 0, skipped: 0, tests: [] },
      tier3: { total: 0, passed: 0, failed: 0, skipped: 0, tests: [] },
      tier4: { total: 0, passed: 0, failed: 0, skipped: 0, tests: [] },
      tier5: { total: 0, passed: 0, failed: 0, skipped: 0, tests: [] }
    };
  }

  recordResult(tierKey, name, status, error = null, durationMs = 0) {
    const tier = this.tierBreakdown[tierKey] || this.tierBreakdown['tier1'];
    tier.total++;
    if (status === 'PASSED') tier.passed++;
    else if (status === 'FAILED') tier.failed++;
    else tier.skipped++;

    let errorFormatted = null;
    if (error !== null && error !== undefined) {
      errorFormatted = typeof error === 'object' ? (error.stack || error.message || String(error)) : String(error);
    }

    const item = {
      tier: tierKey,
      name,
      status,
      error: errorFormatted,
      durationMs
    };
    tier.tests.push(item);
    this.results.push(item);
  }

  recordSuiteError(file, err) {
    this.tierBreakdown.tier1.total++;
    this.tierBreakdown.tier1.failed++;
    let errStr = 'Unknown Suite Error';
    if (err !== null && err !== undefined) {
      errStr = typeof err === 'object' ? (err.stack || err.message || String(err)) : String(err);
    }
    const item = {
      tier: 'suite',
      name: `Suite Load Error: ${file}`,
      status: 'FAILED',
      error: errStr,
      durationMs: 0
    };
    this.results.push(item);
  }

  saveReport() {
    const duration = Date.now() - this.startTime;
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASSED').length;
    const failedTests = this.results.filter(r => r.status === 'FAILED').length;
    const skippedTests = this.results.filter(r => r.status === 'SKIPPED').length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : '0.00';

    const reportData = {
      timestamp: new Date().toISOString(),
      durationMs: duration,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
        passRate: `${passRate}%`,
        status: failedTests === 0 ? 'PASSED' : 'FAILED'
      },
      tierBreakdown: this.tierBreakdown,
      details: this.results
    };

    const reportsDir = path.dirname(REPORT_FILE);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    fs.writeFileSync(REPORT_FILE, JSON.stringify(reportData, null, 2), 'utf-8');

    this.publishTestReadyMd(reportData);

    return reportData;
  }

  publishTestReadyMd(reportData) {
    const statusSymbol = reportData.summary.failed === 0 ? '✅ PASS' : '❌ FAIL';
    const content = `# TEST_READY.md — Next.js WebGIS Portfolio & M&E Telemetry Dashboard

## Test Execution Status: ${statusSymbol}

**Execution Date**: ${reportData.timestamp}  
**Total Execution Time**: ${(reportData.durationMs / 1000).toFixed(2)}s  
**Pass Rate**: ${reportData.summary.passRate} (${reportData.summary.passed} / ${reportData.summary.total} Passed, ${reportData.summary.failed} Failed)

---

## E2E Test Suite Summary & Coverage Breakdown

| Test Tier | Scope & Focus | Total Tests | Passed | Failed | Status |
|-----------|---------------|-------------|--------|--------|--------|
| **Tier 1** | UI Architecture, Layout, Glassmorphism, WebGIS & Telemetry Feature Coverage | ${reportData.tierBreakdown.tier1.total} | ${reportData.tierBreakdown.tier1.passed} | ${reportData.tierBreakdown.tier1.failed} | ${reportData.tierBreakdown.tier1.failed === 0 ? '✅ Pass' : '❌ Fail'} |
| **Tier 2** | Boundary & Corner Cases (Extreme Coordinates, Invalid Payloads, Missing Headers) | ${reportData.tierBreakdown.tier2.total} | ${reportData.tierBreakdown.tier2.passed} | ${reportData.tierBreakdown.tier2.failed} | ${reportData.tierBreakdown.tier2.failed === 0 ? '✅ Pass' : '❌ Fail'} |
| **Tier 3** | Cross-Feature Interactions & Multi-Module Synchronizations | ${reportData.tierBreakdown.tier3.total} | ${reportData.tierBreakdown.tier3.passed} | ${reportData.tierBreakdown.tier3.failed} | ${reportData.tierBreakdown.tier3.failed === 0 ? '✅ Pass' : '❌ Fail'} |
| **Tier 4** | Real-World Application Workflows & End-to-End User Journeys | ${reportData.tierBreakdown.tier4.total} | ${reportData.tierBreakdown.tier4.passed} | ${reportData.tierBreakdown.tier4.failed} | ${reportData.tierBreakdown.tier4.failed === 0 ? '✅ Pass' : '❌ Fail'} |
| **Tier 5** | Adversarial & SEO Hardening (Input Sanitization, Schema Robustness) | ${reportData.tierBreakdown.tier5.total} | ${reportData.tierBreakdown.tier5.passed} | ${reportData.tierBreakdown.tier5.failed} | ${reportData.tierBreakdown.tier5.failed === 0 ? '✅ Pass' : '❌ Fail'} |
| **TOTAL** | **Full Opaque-Box E2E Suite** | **${reportData.summary.total}** | **${reportData.summary.passed}** | **${reportData.summary.failed}** | **${statusSymbol}** |

---

## Detailed Test Cases Executed

### Tier 1: UI & Architecture Feature Coverage (${reportData.tierBreakdown.tier1.passed}/${reportData.tierBreakdown.tier1.total})
${reportData.tierBreakdown.tier1.tests.map(t => `- [${t.status === 'PASSED' ? 'x' : ' '}] \`${t.name}\`: ${t.status}`).join('\n')}

### Tier 2: WebGIS Boundary & Corner Cases (${reportData.tierBreakdown.tier2.passed}/${reportData.tierBreakdown.tier2.total})
${reportData.tierBreakdown.tier2.tests.map(t => `- [${t.status === 'PASSED' ? 'x' : ' '}] \`${t.name}\`: ${t.status}`).join('\n')}

### Tier 3: Cross-Feature Interactions (${reportData.tierBreakdown.tier3.passed}/${reportData.tierBreakdown.tier3.total})
${reportData.tierBreakdown.tier3.tests.map(t => `- [${t.status === 'PASSED' ? 'x' : ' '}] \`${t.name}\`: ${t.status}`).join('\n')}

### Tier 4: Real-World Application Scenarios (${reportData.tierBreakdown.tier4.passed}/${reportData.tierBreakdown.tier4.total})
${reportData.tierBreakdown.tier4.tests.map(t => `- [${t.status === 'PASSED' ? 'x' : ' '}] \`${t.name}\`: ${t.status}`).join('\n')}

### Tier 5: Adversarial & SEO Hardening (${reportData.tierBreakdown.tier5.passed}/${reportData.tierBreakdown.tier5.total})
${reportData.tierBreakdown.tier5.tests.map(t => `- [${t.status === 'PASSED' ? 'x' : ' '}] \`${t.name}\`: ${t.status}`).join('\n')}

---

## Verification & Execution Instructions

To execute the test suite locally or in CI environments:

\`\`\`bash
# Method 1: Using package.json test script
npm test

# Method 2: Direct CLI orchestrator execution
node tests/run-tests.js

# Method 3: Running tier files directly via Node test runner
node --test tests/e2e/*.test.js
\`\`\`

Report JSON generated at \`tests/reports/e2e-report.json\`.
`;

    fs.writeFileSync(TEST_READY_FILE, content, 'utf-8');
  }
}

module.exports = TestReporter;
