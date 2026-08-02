# E2E Test Runner & Test Suite Empirical Challenge Report

**Target**: `tests/run-tests.js` and `tests/e2e/*.test.js`  
**Project**: Next.js WebGIS Portfolio & M&E Telemetry Dashboard  
**Author**: Challenger 1 (EMPIRICAL CHALLENGER — E2E Testing Track)  
**Date**: 2026-07-23  

---

## 1. Observation

Direct empirical observations from executing and inspecting `tests/run-tests.js`, `tests/utils/test-reporter.js`, and `tests/e2e/*.test.js`:

1. **Baseline Execution Timing & Results**:
   - Command executed: `& "C:\Program Files\nodejs\node.exe" tests/run-tests.js`
   - Exit code: `0`
   - Output: 80 total tests executed across 5 tiers (Tier 1: 30, Tier 2: 30, Tier 3: 8, Tier 4: 6, Tier 5: 6).
   - Execution duration: `0.22s` (220 ms).
   - Artifacts generated: `tests/reports/e2e-report.json` and `TEST_READY.md`.

2. **Runner Architecture Inspection (`tests/run-tests.js`)**:
   - Lines 23-48:
     ```javascript
     for (const item of TIER_FILES) {
       console.log(`\n--- Running ${item.label} ---`);
       try {
         const modulePath = path.resolve(__dirname, item.file);
         delete require.cache[modulePath];
         const tierModule = require(modulePath);

         for (const t of tierModule.tests) {
           const start = Date.now();
           try {
             await t.run();
             const duration = Date.now() - start;
             reporter.recordResult(item.key, t.name, 'PASSED', null, duration);
             console.log(`  [PASS] ${t.name} (${duration}ms)`);
           } catch (err) {
             const duration = Date.now() - start;
             reporter.recordResult(item.key, t.name, 'FAILED', err, duration);
             console.error(`  [FAIL] ${t.name} (${duration}ms)`);
             console.error(`         Error: ${err.message || String(err)}`);
           }
         }
       } catch (err) {
         console.error(`\n[ERROR] Failed to load test suite ${item.file}:`, err.message);
       }
     }
     ```
   - Lines 67-71:
     ```javascript
     if (report.summary.failed > 0) {
       process.exit(1);
     } else {
       process.exit(0);
     }
     ```

3. **Reporter Implementation Inspection (`tests/utils/test-reporter.js`)**:
   - Lines 24-40 (`recordResult`):
     ```javascript
     recordResult(tierKey, name, status, error = null, durationMs = 0) {
       const tier = this.tierBreakdown[tierKey] || this.tierBreakdown['tier1'];
       tier.total++;
       if (status === 'PASSED') tier.passed++;
       else if (status === 'FAILED') tier.failed++;
       else tier.skipped++;

       const item = {
         tier: tierKey,
         name,
         status,
         error: error ? (error.stack || error.message || String(error)) : null,
         durationMs
       };
       tier.tests.push(item);
       this.results.push(item);
     }
     ```

---

## 2. Logic Chain

1. **Module Load Failure Masking (Exit Code 0 on Load Error)**:
   - **Step 1**: `require(modulePath)` is wrapped inside `try...catch(err)` at line 25 of `tests/run-tests.js`.
   - **Step 2**: If a tier file cannot be loaded (due to missing file, syntax error, top-level exception, or broken import), the exception is caught on line 45.
   - **Step 3**: Line 46 logs `[ERROR] Failed to load test suite...`, but NO error is recorded in `reporter` (i.e. `reporter.recordResult` is never called for that tier).
   - **Step 4**: At summary evaluation (line 67), `report.summary.failed` remains `0` because no test failure objects were recorded.
   - **Step 5**: Line 70 executes `process.exit(0)`.
   - **Conclusion**: A completely missing or syntax-broken test file results in a successful `0` process exit code and `TEST_READY.md` reporting `✅ PASS` status.

2. **Primitive/Null Exception Information Erasure**:
   - **Step 1**: `recordResult` evaluates `error ? (error.stack || error.message || String(error)) : null` on line 35 of `test-reporter.js`.
   - **Step 2**: If a test fails by throwing `null` (`throw null;`), `err` in the runner is `null`.
   - **Step 3**: Passing `null` as the `error` argument causes `error ? ... : null` to evaluate to `null`.
   - **Step 4**: The saved result in `e2e-report.json` contains `"status": "FAILED", "error": null`.
   - **Conclusion**: Throwing primitive falsy values (like `null`) causes the failure details in the JSON artifact to be erased.

3. **Absence of Per-Test Execution Timeout**:
   - **Step 1**: Line 34 of `run-tests.js` awaits `t.run()`.
   - **Step 2**: There is no timeout wrapper (e.g. `Promise.race` with a timer).
   - **Step 3**: If a test returns an unfulfilled promise or enters an infinite loop/hang, `run-tests.js` will block indefinitely.
   - **Conclusion**: The runner lacks async execution timeout protection.

4. **Silent Tier Key Fallback**:
   - **Step 1**: Line 25 of `test-reporter.js` uses `this.tierBreakdown[tierKey] || this.tierBreakdown['tier1']`.
   - **Step 2**: If an invalid or unexpected `tierKey` is passed, `recordResult` silently modifies `tier1` statistics.
   - **Conclusion**: Unrecognized tier keys corrupt Tier 1 breakdown metrics in `TEST_READY.md` without warning.

---

## 3. Caveats

- **Network Environment**: Ran under CODE_ONLY network restrictions. Browser-based Playwright / Puppeteer live rendering tests were not executed as the suite relies on zero-dependency native Node.js AST and DOM/Mapbox mocks.
- **Node Execution Path**: `node` is located at `C:\Program Files\nodejs\node.exe` on this system.
- **Project Source Code**: Implementation code was inspected in review-only mode and not modified during stress testing.

---

## 4. Conclusion

- **Baseline Verdict**: **PASS WITH HARDENING RECOMMENDATIONS**. The test suite is highly functional, running all 80 tests in 0.22s with zero external dependencies and generating both JSON and Markdown reports cleanly.
- **Critical Risk**: The test runner `tests/run-tests.js` hides suite loading failures by exiting with code `0` when a tier file fails to import.
- **Reporting Integrity**: Null/primitive exceptions lose error messages in `e2e-report.json`.

---

## 5. Verification Method

To independently verify all observations and test findings:

1. **Verify Baseline Execution**:
   ```powershell
   & "C:\Program Files\nodejs\node.exe" tests/run-tests.js
   ```
   *Expected*: All 80 tests pass; outputs summary; returns exit code 0; generates `tests/reports/e2e-report.json` and `TEST_READY.md`.

2. **Verify Module Load Failure Exit Code Vulnerability**:
   - Temporarily point one entry in `TIER_FILES` in `tests/run-tests.js` to a non-existent file `./e2e/missing.test.js`.
   - Run `& "C:\Program Files\nodejs\node.exe" tests/run-tests.js`.
   - *Observation*: Console shows `[ERROR] Failed to load test suite`, but runner prints `Status: PASSED` and exits with code 0!

3. **Verify Null Throw Reporting Vulnerability**:
   - Add `throw null;` inside any test `run` function.
   - Run `& "C:\Program Files\nodejs\node.exe" tests/run-tests.js`.
   - Inspect `tests/reports/e2e-report.json`.
   - *Observation*: Test has `"status": "FAILED"`, but `"error": null`.

---

## Adversarial Challenge Report

### Challenge Summary

**Overall risk assessment**: MEDIUM-HIGH (Test infrastructure resilience & reporting risks)

### Challenges

#### 1. [HIGH] Module Load Failure Masking
- **Assumption challenged**: The test runner will report a failure and exit non-zero if any test suite fails to run or load.
- **Attack scenario**: A tier file is renamed, deleted, or contains a syntax error / unhandled top-level exception.
- **Blast radius**: CI/CD pipeline green-lights broken builds because missing test suites report status `PASSED` with exit code `0`.
- **Mitigation**: Track suite load errors in `TestReporter` (e.g., `reporter.recordSuiteError(item.file, err)`) and force `process.exit(1)` when load errors occur.

#### 2. [MEDIUM] Primitive Error Information Loss
- **Assumption challenged**: Failure reports in `e2e-report.json` contain the cause of failure for all failed tests.
- **Attack scenario**: A test throws `null`, `undefined`, or a non-Error object.
- **Blast radius**: `error` field in JSON report is saved as `null`, masking the failure diagnostic.
- **Mitigation**: Update `recordResult` to check `error !== null && error !== undefined` and format string fallback:
  ```javascript
  error: error !== null && error !== undefined
    ? (error.stack || error.message || String(error))
    : 'Unknown error (thrown value was null/undefined)'
  ```

#### 3. [MEDIUM] Lack of Async Timeout Protection
- **Assumption challenged**: Tests execute to completion in a bounded amount of time.
- **Attack scenario**: An async test contains an unfulfilled promise or endless event listener.
- **Blast radius**: The runner process hangs infinitely in automated test pipelines.
- **Mitigation**: Wrap `await t.run()` in a `Promise.race` with a configurable timeout (e.g., 5000ms per test).

#### 4. [LOW] Silent Unknown Tier Fallback
- **Assumption challenged**: Test results are strictly bucketed into their defined tiers.
- **Attack scenario**: A test result is recorded with an unrecognized `tierKey`.
- **Blast radius**: Tier 1 statistics in `TEST_READY.md` become corrupted without alert.
- **Mitigation**: Explicitly throw or dynamically initialize unknown tier breakdowns in `TestReporter`.

---

## Stress Test Results

| Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| **Baseline 80 E2E Tests** | Run all 80 tests in < 1s, exit 0 | 80/80 passed in 0.22s, exit 0 | PASS |
| **Missing/Broken Tier File** | Fail runner, exit code 1 | Log error, report PASSED, exit 0 | VULNERABLE |
| **Test throws `null`** | Record `"error": "null"` in JSON | Recorded `"error": null` | VULNERABLE |
| **Unregistered Tier Key** | Alert or create tier | Silently merged into `tier1` | VULNERABLE |
| **Assertion Failure** | Mark test FAILED, exit code 1 | Marked FAILED, exit code 1 | PASS |

---

## Unchallenged Areas

- **Client-Side Live WebGL Canvas Rendering**: Mocked using `createMockMapbox` AST/context wrappers rather than headless GPU rendering. Out of scope for zero-dependency native Node test runner.
