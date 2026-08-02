## 2026-07-23T14:40:13Z

You are Worker 2-B (replacement for Worker 2) for Iteration 2 of the E2E Testing Track of the Next.js WebGIS Portfolio & M&E Telemetry Dashboard project.

Project directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio
Your working directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\e2e_worker_2b

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task is to implement the 100% GENUINE, authentic test suite remediation strategy designed by Explorer 4 and hardened per Challenger 1 & 2 recommendations:

1. Update `tests/run-tests.js` and `tests/utils/test-reporter.js`:
   - Add suite file load error tracking (`reporter.recordSuiteError(file, err)`) so syntax/import/file errors increment `summary.failed` and force exit code `1`.
   - Handle primitive error throws (`throw null`) gracefully in `TestReporter`.
   - Add per-test async execution timeout wrapper (5000ms limit per test).
   - Ensure console logging prints clear tier summaries and accurate metrics.
2. Update `tests/utils/ast-helpers.js`:
   - Provide genuine AST, file existence, export parsing, and execution helpers for inspecting project source code (`app/layout.tsx`, `app/page.tsx`, `components/GlassCard.tsx`, `lib/utils.ts`, `package.json`, `scripts/clean_pipeline.py`, `src/data/cleaned_submissions.json`, etc.).
   - Include regional coordinate bounding box checker for Balochistan ($60.5^\circ \le \text{lng} \le 70.5^\circ, 24.5^\circ \le \text{lat} \le 32.5^\circ$).
3. Refactor all 5 test files (`tests/e2e/tier1_ui_arch.test.js`, `tier2_webgis.test.js`, `tier3_telemetry.test.js`, `tier4_security.test.js`, `tier5_seo_hardening.test.js`):
   - REMOVE ALL inline dummy function declarations (`const calculateMPI = ...`, `const renderGlassCard = ...`, `const sanitizeHtml = ...`, `const RateLimiter = ...`).
   - REMOVE ALL fallback checks against `PROJECT.md` or `.agents/` strings.
   - Perform 100% GENUINE assertions directly against actual project source files (`app/layout.tsx`, `app/page.tsx`, `components/GlassCard.tsx`, `lib/utils.ts`, `package.json`, `scripts/clean_pipeline.py`, `src/data/cleaned_submissions.json`), actual exported functions/components, actual CLI Python scripts (`python scripts/clean_pipeline.py`), or actual source file contracts.
   - For pending features where files or routes are not yet created by the Implementation Track, assert the actual expected file presence / module export contract directly so the test reports its genuine status honestly.
4. Execute `node tests/run-tests.js` using run_command to verify test runner execution and observe real metrics.
5. Update/publish `TEST_READY.md` at project root (`C:\Users\Administrator\teamwork_projects\anthropology_portfolio\TEST_READY.md`) with accurate metrics and tier breakdown.
6. Write your detailed handoff report to `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\e2e_worker_2b\handoff.md`.
7. Send a message to the orchestrator (parent) detailing the remediation implementation results, test runner execution output, and `TEST_READY.md` publication.

Remember:
- Write metadata to your own directory `.agents/e2e_worker_2b/`.
- Maintain progress.md as your heartbeat signal.
