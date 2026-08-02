## 2026-07-24T02:09:30Z
Implement Requirement R3 (M&E Telemetry & Senian MPI Engine):
1. Create mathematical MPI calculation module `lib/mpi.ts`:
   - Implement Senian Multidimensional Poverty Index (MPI) capability reduction formulas:
     - Headcount Ratio (H): proportion of population multidimensionally poor.
     - Poverty Intensity (A): average proportion of deprivations experienced.
     - MPI = H * A.
     - Capability deprivation metrics across 4 dimensions: Water Infrastructure, Customary Governance, Climate Resilience, Economic Capability.
     - Export calculation functions, types, and capability deprivation indicators.
2. Create IFRAP Component 3 data module `lib/ifrap-data.ts`:
   - Represents IFRAP Component 3 data modules (Balochistan Karez Rehabilitation & Community Water Management).
   - District datasets (Quetta, Mastung, Pishin, Kalat, Zhob, Ziarat).
3. Create Telemetry Dashboard component `components/TelemetryDashboard.tsx` and page `app/telemetry/page.tsx`:
   - Interactive district & indicator selector.
   - Real-time animated visual progress bars bound to IFRAP Component 3 capability metrics.
   - Displays calculated Senian MPI capability reduction score (MPI = H * A) with breakdown charts/bars.
   - Glassmorphic styling using Tailwind `backdrop-blur` and Framer Motion animation.
4. Test & Verification:
   - Run `cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run build"` to verify 0 compilation errors.
   - Run `cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node tests/run-tests.js"` to verify test suite.
5. Write `handoff.md` in your working directory and notify the parent orchestrator.
