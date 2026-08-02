## 2026-07-31T01:15:43Z
You are Worker M3 for the Anthropology Portfolio frontend refactoring project.
Working Directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m3
Project Directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio

Task: Implement Milestone 3 - Accessibility (WCAG 2.1 AA), Urdu i18n Localization, & High-Contrast Mode.
Refer to Explorer 3 findings at `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_3\analysis.md`.

Requirements:
1. Create `lib/i18n-context.tsx` with English (`en`, LTR) and Urdu (`ur`, RTL) translation dictionaries covering all UI strings (navigation, map controls, M&E telemetry, usufruct generator, accessibility settings). Set document `dir="rtl"` and `lang="ur"` when Urdu is active.
2. Create `lib/accessibility-context.tsx` providing High-Contrast styling mode toggle (`contrast-high` CSS class injection) and text sizing controls.
3. Enhance WCAG 2.1 AA accessibility across `app/globals.css`, `app/layout.tsx`, and core components:
   - Add Skip-to-Content link (`<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>`).
   - Add explicit ARIA attributes (`aria-label`, `aria-selected`, `role="tab"`, `aria-expanded`, `aria-controls`, `aria-live="polite"`).
   - Ensure high contrast mode styling overrides (`.contrast-high .glass-card`, etc.) with contrast ratio >= 4.5:1.
   - Add visible focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none`).
4. Include language toggle switch (EN / UR) and high-contrast toggle switch components.
5. Verify your implementation by running `node tests/run-tests.js` and `npm run build`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Deliver your handoff report to `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m3\handoff.md` and send a completion message to parent (`d873fff7-a0e4-4815-9db3-abe0c016949c`).
