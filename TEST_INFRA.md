# Test Infrastructure Specification (TEST_INFRA.md)

## 1. Overview & Architecture

The E2E Test Suite for the Next.js WebGIS Portfolio & M&E Telemetry Dashboard project is designed as a **zero-dependency, native Node.js testing framework**. It provides high-performance, opaque-box, and static/dynamic assertion capabilities without relying on heavy external test runners like Jest or Cypress.

The infrastructure evaluates all project capabilities across 5 distinct testing tiers:
- **Tier 1**: UI & Architecture Feature Coverage (30+ tests)
- **Tier 2**: WebGIS & System Boundary/Corner Cases (30+ tests)
- **Tier 3**: Cross-Feature Interactions & Multi-Module Sync (8+ tests)
- **Tier 4**: Real-World User Workflows & Application Scenarios (6+ tests)
- **Tier 5**: Adversarial & SEO Hardening (Hardening & Edge Security tests)

## 2. Directory Layout

```
anthropology_portfolio/
├── TEST_INFRA.md                 # Test architecture & runner specification
├── TEST_READY.md                 # Test execution status & summary dashboard (auto-generated)
├── package.json                  # Root manifest with "test": "node tests/run-tests.js"
└── tests/
    ├── run-tests.js              # Main CLI orchestrator & test executor
    ├── reports/
    │   └── e2e-report.json       # JSON execution summary & structured results
    ├── utils/
    │   ├── ast-helpers.js        # AST, regex, and file-system structural assertions
    │   ├── test-reporter.js     # Console formatter, JSON exporter & TEST_READY.md publisher
    │   └── mock-context.js       # Browser, DOM, Mapbox GL & Firebase mock environments
    └── e2e/
        ├── tier1_ui_arch.test.js       # Tier 1 Feature Coverage
        ├── tier2_webgis.test.js        # Tier 2 Boundary & Corner Cases
        ├── tier3_telemetry.test.js     # Tier 3 Cross-Feature Interactions
        ├── tier4_security.test.js      # Tier 4 Real-World Application Scenarios
        └── tier5_seo_hardening.test.js # Tier 5 Adversarial & SEO Hardening
```

## 3. Utility Modules

### `tests/utils/ast-helpers.js`
Provides robust static and AST-like parsing helpers for inspecting React components, Next.js App Router pages, Tailwind utility usage, and TypeScript source files:
- `fileExists(filePath)`: Checks if a target file exists relative to project root.
- `getFileContent(filePath)`: Reads file utf-8 contents safely.
- `assertContains(filePath, pattern)`: Asserts regex or substring presence in file.
- `assertImports(filePath, moduleName)`: Validates module import presence.
- `assertTailwindClasses(filePath, classesArray)`: Verifies Tailwind utility classes in TSX/CSS.
- `assertExportExists(filePath, exportName)`: Checks named/default export definitions.

### `tests/utils/mock-context.js`
Provides lightweight zero-dependency mocks for client-side environments:
- `createMockWindow()`: Mocks `window`, `document`, `navigator`, `localStorage`.
- `createMockMapbox()`: Mocks Mapbox GL JS map instance, event listeners, source/layer operations.
- `createMockFirebase()`: Mocks simulated Firebase Auth, Firestore, and Realtime Database interfaces.
- `createMockNextRequest(options)`: Mocks Next.js `NextRequest` and `NextResponse` handling.

### `tests/utils/test-reporter.js`
Orchestrates test output formatting and artifact generation:
- Formats colorized CLI test summaries.
- Computes execution duration, pass/fail ratios, and tier breakdowns.
- Writes detailed execution records to `tests/reports/e2e-report.json`.
- Generates or updates `TEST_READY.md` at the project root upon test completion.

## 4. Execution Commands

- **Run Full Test Suite via NPM**:
  ```bash
  npm test
  ```

- **Run Orchestrator Directly**:
  ```bash
  node tests/run-tests.js
  ```

- **Run Individual Tier Test via Node Native Test Runner**:
  ```bash
  node --test tests/e2e/tier1_ui_arch.test.js
  ```

## 5. Pass / Fail Criteria & Integrity Compliance
- **Zero Hardcoding**: All tests verify actual codebase files, functions, AST structures, or dynamic execution paths.
- **Fail Fast & Report**: Any assertion failure increments the failure counter and records full stack trace in `e2e-report.json`.
- **Integrity Compliance**: Evaluated independently by Forensic Auditor tools.
