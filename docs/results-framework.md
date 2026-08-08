# IFRAP Results Framework — how to populate it

This documents the Results Framework scaffold added to address the audit's
domain-model / M&E-spine gap. It is the **operational spine** a World Bank Task
Team Leader or an MoPD&SI reviewer opens first.

## Where it lives

| Piece | Path |
|---|---|
| Data model + indicator rows | `lib/results-framework.ts` |
| Dashboard page (protected route `/results-framework`) | `app/results-framework/page.tsx` |

The route is role-protected (all authenticated roles) via `lib/auth/rbac.ts`
and the `proxy.ts` matcher; the RBAC drift guard (`npm test`) keeps the two in
sync.

## What is confirmed vs. placeholder

- **Confirmed** (safe to rely on): the **PDO**, the **financing instrument**
  (IPF / SOP, `P180323`), and the **six components**. The housing PDO target of
  **97,000** beneficiaries is the publicly reported Additional-Financing figure.
- **Placeholder** (`status: PENDING`): every indicator's exact **name,
  baseline, target, frequency, and data source**. These must be filled in
  **verbatim from the project's PAD Results Framework annex / PC-I** — nothing in
  the scaffold is presented as an official indicator value.

## How to populate it

1. Open `lib/results-framework.ts`.
2. For each row in `RESULTS_FRAMEWORK`, replace the placeholder fields with the
   official values and set `status` to `ON_TRACK` / `AT_RISK` / `OFF_TRACK` as
   appropriate (remove the `note` once confirmed).
3. Add the remaining intermediate indicators per component (keep the `RFIndicator`
   shape). Add the required **WBG Corporate Scorecard (FY24–30)** indicator.
4. Add disaggregation (sex, district) where the RF requires it.
5. `npm test` (contract suite + build) and `npm run test:e2e` (browser smoke)
   should stay green.

## Reporting alignment

- **World Bank:** the framework maps to the semi-annual **ISR**; changes to
  targets/scope go through a Restructuring Paper.
- **MoPD&SI:** map indicators to **PC-III** reporting.
- Keep it consistent with the **ESCP tracker** and the **GRM / field-log**
  evidence base (see `docs/ifrap-audit-plan.md`).

> Once the real RF is in place, the legacy demo dataset in `lib/ifrap-data.ts`
> (still framed around a fictional "Component 3 = Karez rehabilitation") should
> be reconciled or retired — it predates this authoritative model.
