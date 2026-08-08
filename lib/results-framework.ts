/**
 * IFRAP Results Framework — authoritative data model (scaffold).
 *
 * This is the World Bank IPF Results Framework spine the operation is actually
 * reported against (PDO + intermediate indicators by component, feeding the
 * ISR). It is intentionally SEPARATE from lib/ifrap-data.ts, which is legacy
 * demo telemetry data.
 *
 * IMPORTANT — HONEST SCAFFOLD: the PDO wording, the financing instrument, and
 * the component list below are the CONFIRMED IFRAP (P180323) structure. The
 * indicator ROWS are placeholders marked `PENDING` — the exact indicator names,
 * baselines, targets, frequencies and data sources MUST be populated verbatim
 * from the project's PAD Results Framework annex / PC-I. Nothing here is
 * presented as an official indicator value except where a `note` cites a
 * public source. See docs/results-framework.md and docs/ifrap-audit-plan.md.
 */

export type IndicatorLevel = 'PDO' | 'Intermediate';
export type IndicatorStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'PENDING';

export interface RFIndicator {
  id: string;
  name: string;
  level: IndicatorLevel;
  /** Component name, or 'PDO' for outcome-level indicators. */
  component: string;
  unit: string;
  baseline: string; // strings so 'TBD' is representable alongside numbers
  target: string;
  actual: string;
  frequency: string;
  dataSource: string;
  responsibility: string;
  status: IndicatorStatus;
  note?: string;
}

/** Confirmed Project Development Objective (IFRAP, P180323). */
export const IFRAP_PDO =
  'To improve livelihoods and essential services and enhance flood-hazard-resilient housing units and livelihoods in Balochistan.';

export const IFRAP_INSTRUMENT = 'Investment Project Financing (IPF) · Series of Projects · P180323';

/** Confirmed component structure (FPMU implements Components 3 & 5). */
export const IFRAP_COMPONENTS = [
  '1 · Community Infrastructure Rehabilitation',
  '2 · Housing Reconstruction',
  '3 · Hydromet & Institutional Strengthening',
  '4 · Livelihood Support & Watershed Management',
  '5 · Project Management & Institutional Strengthening',
  '6 · Contingent Emergency Response (CERC)',
] as const;

const TBD = 'TBD';
const PENDING: IndicatorStatus = 'PENDING';

/**
 * Placeholder Results Framework. Replace each PENDING row with the official
 * indicator from the PAD RF / PC-I (keep the same shape).
 */
export const RESULTS_FRAMEWORK: RFIndicator[] = [
  // ---- PDO-level (outcome) indicators ----
  {
    id: 'pdo-livelihoods',
    name: 'People with improved livelihoods (disaggregated by sex)',
    level: 'PDO',
    component: 'PDO',
    unit: 'Number',
    baseline: TBD,
    target: TBD,
    actual: TBD,
    frequency: 'Semi-annual',
    dataSource: 'Programme MIS',
    responsibility: 'FPMU M&E',
    status: PENDING,
    note: 'Placeholder wording — confirm exact indicator against the PAD Results Framework.',
  },
  {
    id: 'pdo-housing',
    name: 'Beneficiaries with flood-resilient housing',
    level: 'PDO',
    component: '2 · Housing Reconstruction',
    unit: 'Number',
    baseline: '0',
    target: '97,000',
    actual: TBD,
    frequency: 'Semi-annual',
    dataSource: 'Housing MIS / third-party verification',
    responsibility: 'FPMU',
    status: PENDING,
    note: 'Target 97,000 is the publicly reported Additional-Financing scale-up (from 35,100). Confirm baseline/actuals & exact wording against the PAD RF.',
  },
  {
    id: 'pdo-essential-services',
    name: 'People with access to improved essential services',
    level: 'PDO',
    component: 'PDO',
    unit: 'Number',
    baseline: TBD,
    target: TBD,
    actual: TBD,
    frequency: 'Semi-annual',
    dataSource: 'Programme MIS',
    responsibility: 'FPMU',
    status: PENDING,
    note: 'Placeholder — confirm against PAD RF.',
  },
  {
    id: 'pdo-scorecard',
    name: 'WBG Corporate Scorecard indicator (FY24–30)',
    level: 'PDO',
    component: 'PDO',
    unit: TBD,
    baseline: TBD,
    target: TBD,
    actual: TBD,
    frequency: 'Semi-annual',
    dataSource: TBD,
    responsibility: 'FPMU',
    status: PENDING,
    note: 'A WBG Corporate Scorecard indicator is required — populate from the PAD RF.',
  },

  // ---- Intermediate results indicators (one placeholder per component) ----
  ...IFRAP_COMPONENTS.map((component, i) => ({
    id: `ir-${i + 1}`,
    name: 'TBD — populate from PAD RF / PC-I',
    level: 'Intermediate' as const,
    component,
    unit: TBD,
    baseline: TBD,
    target: TBD,
    actual: TBD,
    frequency: TBD,
    dataSource: TBD,
    responsibility: 'FPMU',
    status: PENDING,
    note: 'Placeholder row — add the component’s real intermediate indicator(s).',
  })),
];

export interface RFSummary {
  total: number;
  pending: number;
  onTrack: number;
  atRisk: number;
  offTrack: number;
}

export function getResultsFrameworkSummary(rows: RFIndicator[] = RESULTS_FRAMEWORK): RFSummary {
  const count = (s: IndicatorStatus) => rows.filter((r) => r.status === s).length;
  return {
    total: rows.length,
    pending: count('PENDING'),
    onTrack: count('ON_TRACK'),
    atRisk: count('AT_RISK'),
    offTrack: count('OFF_TRACK'),
  };
}
