# Handoff Report: Senian MPI Logic Engine (`lib/mpi.ts`) Investigation

**Agent**: Explorer 2 (`explorer_m3_2`)  
**Milestone**: Milestone 3 (Telemetry & Senian MPI Logic Engine)  
**Target File**: `lib/mpi.ts`  
**Date**: 2026-07-23  

---

## 1. Observation

1. **Project Directory & Architecture Contract**:
   - Inspected `PROJECT.md` lines 11 & 26–28:
     > `M3 | Telemetry & Senian MPI Logic Engine | Telemetry dashboard page, Senian Multidimensional Poverty Index capability reduction formulas, bind visual progress bars to IFRAP Component 3 data modules`
     > `Telemetry & Senian MPI Logic (lib/mpi.ts or components/TelemetryDashboard.tsx): Implements Senian MPI formulas: $MPI = H \times A$ or capability reduction metrics. Binds values to IFRAP Component 3 data modules with progress bars.`
2. **Existing Codebase & File Tree**:
   - `lib/` directory currently contains only `utils.ts` (`import { clsx, type ClassValue } from 'clsx'`).
   - `lib/mpi.ts` does not yet exist and needs to be created by the Implementer.
3. **Test Infrastructure Contract**:
   - Evaluated `package.json` line 10: `"test": "node tests/run-tests.js"`.
   - Inspected `tests/e2e/tier1_ui_arch.test.js` lines 120–126:
     ```javascript
     name: 'TC-T1-F3-01: Senian MPI Engine Calculation Formula',
     run: () => {
       const calculateMPI = (H, A) => Number((H * A).toFixed(4));
       assert.strictEqual(calculateMPI(0.4, 0.5), 0.2);
       assert.strictEqual(calculateMPI(0.8, 0.75), 0.6);
     }
     ```
   - Inspected `tests/e2e/tier3_telemetry.test.js` lines 59–80:
     ```javascript
     name: 'TC-T3-03: Senian MPI Calculation Pipeline feeding CSV Data Exporter',
     run: () => {
       const calculateMPI = (H, A) => Number((H * A).toFixed(3));
       ...
     }
     ```
4. **All 80 E2E Tests Passing Baseline**:
   - Executed view of `TEST_READY.md` line 7: `Pass Rate: 100.00% (80 / 80 Passed, 0 Failed)`.

---

## 2. Logic Chain

1. **Step 1 (Requirement Derivation)**: Observation 1 establishes that Milestone 3 requires `lib/mpi.ts` to implement Senian MPI formulas ($MPI = H \times A$) and capability reduction metrics bound to IFRAP Component 3 data modules.
2. **Step 2 (Math & Methodology Standardization)**: Grounded in Amartya Sen's Capability Approach and Alkire-Foster (AF) methodology:
   - Deprivation Matrix $Y_{i,j} \in \{0, 1\}$ (where $g_{ij}^0 = 1$ if $y_{ij} < z_j$ else $0$).
   - Normalized Weights Vector $w_j$ ($\sum w_j = 1.0$).
   - Deprivation Score Vector $c_i = \sum w_j g_{ij}^0$.
   - Poverty Cutoff $k$ (default $1/3 \approx 0.3333$).
   - Censored Score Vector $c_i(k) = c_i$ if $c_i \ge k$ else $0$.
   - Headcount Ratio $H = q / n$.
   - Intensity of Poverty $A = \frac{\sum c_i(k)}{q}$.
   - Multidimensional Poverty Index $MPI = H \times A = \frac{1}{n} \sum c_i(k)$.
   - Indicator relative contribution $C_j = \frac{w_j \sum_i g_{ij}^0(k)}{n \times MPI}$, with $\sum C_j = 1.0$.
3. **Step 3 (Engine Interface Design)**: Observation 2 confirms `lib/mpi.ts` is not yet created. Providing a complete, production-ready TypeScript interface specification in `analysis.md` allows the Implementer agent to seamlessly implement `lib/mpi.ts` with zero architectural ambiguity.
4. **Step 4 (Test Integration)**: Observation 3 and 4 show that existing tests in `tier1` and `tier3` test basic $MPI = H \times A$ calculations. Creating a robust unit test specification guarantees compatibility with the existing native Node.js runner without breaking existing test suites.

---

## 3. Caveats

1. **Synthetic Telemetry Inputs**: Real-world field data from Balochistan IFRAP Component 3 is simulated using structured JSON/JS records. The module is designed to consume both live API feeds and simulated telemetry fixtures.
2. **Custom Weight Normalization**: If user overrides indicator weights, the engine assumes normalized weights $\sum w_j = 1.0$. An internal normalization check should be included to auto-scale weights if $\sum w_j \neq 1.0$.
3. **Floating Point Precision**: Double-precision floating point operations in JavaScript/TypeScript may produce minor rounding artifacts (e.g. `0.3333333333333333`). All output metrics in `bindIFRAPComponent3Data` are safely rounded using `.toFixed(4)` or `.toFixed(1)` for UI rendering.

---

## 4. Conclusion

The mathematical framework, taxonomy of 6 capability domains (13 indicators), TypeScript interface design, and unit testing strategy for `lib/mpi.ts` are fully defined in `analysis.md`. The design adheres to Alkire-Foster MPI axioms, supports Senian capability reduction metrics, enables real-time dynamic re-evaluation, binds to visual progress bars, and integrates smoothly into the zero-dependency Node.js test infrastructure.

---

## 5. Verification Method

To verify the investigation and subsequent implementation of `lib/mpi.ts`:

1. **Inspect Analysis & Spec Files**:
   - Check `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_m3_2\analysis.md`.
2. **Run Project Test Suite**:
   ```bash
   npm test
   ```
   Or directly run Node test runner:
   ```bash
   node tests/run-tests.js
   ```
3. **Verify Invalidity Conditions**:
   - If $MPI \neq H \times A$ or $\sum C_j \neq 1.0$, the mathematical engine is invalid.
   - If empty dataset ($n=0$) throws runtime exceptions instead of returning 0 headcount, the edge case handler is invalid.
