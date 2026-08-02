## 2026-07-31T06:15:44Z
<USER_REQUEST>
You are Worker M4 for the Anthropology Portfolio frontend refactoring project.
Working Directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m4
Project Directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio

Task: Implement Milestone 4 - Role-Based Access Control (RBAC) Interface.
Refer to Explorer 3 findings at `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_3\analysis.md`.

Requirements:
1. Create `lib/rbac-context.tsx` defining roles: `FIELD_ENUMERATOR`, `PROVINCIAL_PIU`, `FPMU_DIRECTOR`.
2. Define permission rules for each role:
   - `FIELD_ENUMERATOR`: Can access spatial map, submit field survey data, view basic telemetry; CANNOT view financial compensation burn rates, budget figures, or compliance logs.
   - `PROVINCIAL_PIU`: Access to regional telemetry, GRM tickets, spatial layers, and operational summaries.
   - `FPMU_DIRECTOR`: Full administrative access to financial burn rates, budget allocations, compliance logs, and export APIs.
3. Create `<RoleGate allowedRoles={['PROVINCIAL_PIU', 'FPMU_DIRECTOR']}>` component to wrap sensitive UI elements (financial burn rate widgets, fiduciary compliance audit logs) and show a graceful fallback message when restricted.
4. Create `components/RoleSwitcher.tsx` to allow switching active role in the UI for field testing & demonstration.
5. Verify your implementation by running `node tests/run-tests.js` and `npm run build`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Deliver your handoff report to `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m4\handoff.md` and send a completion message to parent (`d873fff7-a0e4-4815-9db3-abe0c016949c`).
</USER_REQUEST>
