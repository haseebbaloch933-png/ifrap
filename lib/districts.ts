/**
 * Canonical list of Balochistan districts referenced anywhere in this app —
 * GRM tickets, GIS features, IFRAP programme telemetry. Single source of
 * truth so dropdowns/filters don't drift into inventing districts with no
 * backing data elsewhere.
 *
 * The 6 IFRAP programme demonstration districts (see lib/ifrap-data.ts) plus
 * Killa Abdullah, which has real GRM ticket activity (lib/grm-data.ts) but
 * is not yet an active telemetry district — GRM's catchment is
 * legitimately broader than the program's current rollout. Compensation
 * budget and telemetry data stay scoped to the 6 program districts.
 */
export const BALOCHISTAN_DISTRICTS = [
  'Quetta',
  'Pishin',
  'Mastung',
  'Kalat',
  'Zhob',
  'Ziarat',
  'Killa Abdullah',
] as const;

export type BalochistanDistrict = (typeof BALOCHISTAN_DISTRICTS)[number];
