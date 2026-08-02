/**
 * Senian Multidimensional Poverty Index (MPI) Capability Reduction Engine
 * 
 * Based on Amartya Sen's Capability Approach & Multidimensional Poverty Measurement:
 * - Headcount Ratio (H): Proportion of population multidimensionally poor.
 * - Poverty Intensity (A): Average proportion of deprivations experienced.
 * - Senian MPI = H × A
 * 
 * Capability Deprivation metrics spans 4 core dimensions:
 * 1. Water Infrastructure
 * 2. Customary Governance
 * 3. Climate Resilience
 * 4. Economic Capability
 */

export type CapabilityDimensionKey = 
  | 'water_infrastructure'
  | 'customary_governance'
  | 'climate_resilience'
  | 'economic_capability';

export interface CapabilityDimensionInfo {
  key: CapabilityDimensionKey;
  label: string;
  weight: number; // Sum of dimension weights = 1.0
  color: string;
  accentClass: string;
  description: string;
}

export interface CapabilityIndicator {
  id: string;
  name: string;
  dimension: CapabilityDimensionKey;
  weight: number; // Indicator weight within dimension
  deprivationThreshold: number; // Score below which capability is deprived (0 to 1)
  unit: string;
  description: string;
}

export interface DistrictIndicatorValues {
  [indicatorId: string]: number; // Value between 0 (complete deprivation) and 1 (full capability)
}

export interface DistrictCapabilityData {
  districtId: string;
  districtName: string;
  population: number;
  headcountRatio: number; // H (0.0 to 1.0)
  povertyIntensity: number; // A (0.0 to 1.0)
  indicatorValues: DistrictIndicatorValues;
}

export interface DimensionBreakdown {
  key: CapabilityDimensionKey;
  label: string;
  deprivationRatio: number; // 0.0 to 1.0 (proportion deprived)
  weightedContribution: number; // Contribution to total deprivation
  capabilityScorePercentage: number; // 0% to 100%
}

export interface MPIResult {
  headcountRatio: number; // H
  povertyIntensity: number; // A
  mpiScore: number; // MPI = H × A
  deprivationStatus: 'Low Deprivation' | 'Moderate Deprivation' | 'High Deprivation' | 'Severe Deprivation';
  dimensionBreakdown: Record<CapabilityDimensionKey, DimensionBreakdown>;
}

/**
 * 4 Capability Dimensions Definition
 */
export const CAPABILITY_DIMENSIONS: Record<CapabilityDimensionKey, CapabilityDimensionInfo> = {
  water_infrastructure: {
    key: 'water_infrastructure',
    label: 'Water Infrastructure',
    weight: 0.25,
    color: 'cyan',
    accentClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    description: 'Karez channel flow integrity, conveyance loss reduction, and clean drinking water access points.',
  },
  customary_governance: {
    key: 'customary_governance',
    label: 'Customary Governance',
    weight: 0.25,
    color: 'emerald',
    accentClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Mirab water allocation equity, Karez elders committee active participation, and Usufruct land tenure recognition.',
  },
  climate_resilience: {
    key: 'climate_resilience',
    label: 'Climate Resilience',
    weight: 0.25,
    color: 'violet',
    accentClass: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    description: 'Flash flood diversion bunds, drought buffer aquifer reserves, and climate adaptive infrastructure.',
  },
  economic_capability: {
    key: 'economic_capability',
    label: 'Economic Capability',
    weight: 0.25,
    color: 'amber',
    accentClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description: 'Agrarian crop yield security, household water expenditure reduction, and micro-irrigation adoption.',
  },
};

/**
 * Standard Capability Indicators across the 4 dimensions
 */
export const CAPABILITY_INDICATORS: CapabilityIndicator[] = [
  // Water Infrastructure
  {
    id: 'karez_flow_rate',
    name: 'Karez Discharge Volumetric Rate',
    dimension: 'water_infrastructure',
    weight: 0.5,
    deprivationThreshold: 0.5,
    unit: 'L/s',
    description: 'Average seasonal flow rate maintained through Mother Well (Sar-e-Karez).',
  },
  {
    id: 'water_potability_access',
    name: 'Clean Drinking Water Proximity',
    dimension: 'water_infrastructure',
    weight: 0.5,
    deprivationThreshold: 0.6,
    unit: '% HH',
    description: 'Percentage of households within 15 minutes walk of uncontaminated Karez outlet.',
  },

  // Customary Governance
  {
    id: 'mirab_equity_index',
    name: 'Mirab Water Distribution Equity',
    dimension: 'customary_governance',
    weight: 0.5,
    deprivationThreshold: 0.5,
    unit: 'Index (0-1)',
    description: 'Adherence to traditional timed turn-taking (Shabana) without elite capture.',
  },
  {
    id: 'usufruct_rights_legal_protection',
    name: 'Usufruct Land Tenure Recognition',
    dimension: 'customary_governance',
    weight: 0.5,
    deprivationThreshold: 0.6,
    unit: '% Secured',
    description: 'Formalized customary land rights registered in digital fiduciary ledger.',
  },

  // Climate Resilience
  {
    id: 'flood_protection_bunds',
    name: 'Flash Flood Diversion Infrastructure',
    dimension: 'climate_resilience',
    weight: 0.5,
    deprivationThreshold: 0.5,
    unit: '% Protected',
    description: 'Structure protection against seasonal torrents eroding Karez channels.',
  },
  {
    id: 'drought_buffer_reserve',
    name: 'Aquifer Drought Buffer Reserve',
    dimension: 'climate_resilience',
    weight: 0.5,
    deprivationThreshold: 0.55,
    unit: 'Months Buffer',
    description: 'Sub-surface water retention capacity during prolonged dry spells.',
  },

  // Economic Capability
  {
    id: 'crop_yield_sustainability',
    name: 'Agrarian Yield Sustainability',
    dimension: 'economic_capability',
    weight: 0.5,
    deprivationThreshold: 0.5,
    unit: 'Tons/Hectare',
    description: 'High-value orchard crop protection (Pomegranates, Grapes, Almonds).',
  },
  {
    id: 'water_cost_burden',
    name: 'Household Water Expenditure Burden',
    dimension: 'economic_capability',
    weight: 0.5,
    deprivationThreshold: 0.6,
    unit: '% Income Saved',
    description: 'Reduction in household expenditure on private diesel tube-well tankers.',
  },
];

/**
 * Sanitizes a numeric metric to ensure it stays strictly in the range [0.0, 1.0].
 */
export function sanitizeMetric(val: number): number {
  if (typeof val !== 'number' || isNaN(val)) return 0;
  return Math.min(Math.max(val, 0), 1.0);
}

/**
 * Computes average deprivation ratio from a set of indicator scores.
 */
export function computeAverageDeprivation(indicators: number[]): number {
  if (!indicators || indicators.length === 0) return 0;
  const valid = indicators.map(sanitizeMetric);
  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / valid.length).toFixed(4));
}

export function calculateMPI(H: number, A: number): number {
  const sanitizedH = sanitizeMetric(H);
  const sanitizedA = sanitizeMetric(A);
  return Number((sanitizedH * sanitizedA).toFixed(4));
}

export const ifrapModule = {
  component: 3,
  indicators: ['water_access', 'land_usufruct', 'poverty_index'] as const,
};

/**
 * Calculates Senian Multidimensional Poverty Index (MPI = H × A).
 * @param headcountRatio H: proportion of population multidimensionally poor [0.0 - 1.0]
 * @param intensity A: average proportion of deprivations experienced [0.0 - 1.0]
 * @returns MPI score [0.0 - 1.0]
 */
export function calculateSenianMPI(headcountRatio: number, intensity: number): number {
  return calculateMPI(headcountRatio, intensity);
}

/**
 * Formats a metric decimal (0-1) to a percentage string (0%-100%).
 */
export function formatProgress(val: number, max: number = 100): string {
  if (max === 0) return '0%';
  const ratio = val / max;
  const clamped = Math.min(Math.max(ratio, 0), 1);
  return `${Math.round(clamped * 100)}%`;
}

/**
 * Derives comprehensive MPI Result and dimensional breakdown for a district.
 */
export function calculateDistrictMPI(data: DistrictCapabilityData): MPIResult {
  const H = sanitizeMetric(data.headcountRatio);
  const A = sanitizeMetric(data.povertyIntensity);
  const mpiScore = calculateSenianMPI(H, A);

  const dimensionKeys: CapabilityDimensionKey[] = [
    'water_infrastructure',
    'customary_governance',
    'climate_resilience',
    'economic_capability',
  ];

  const breakdown = {} as Record<CapabilityDimensionKey, DimensionBreakdown>;

  dimensionKeys.forEach((key) => {
    const dimIndicators = CAPABILITY_INDICATORS.filter((ind) => ind.dimension === key);
    let totalScore = 0;

    dimIndicators.forEach((ind) => {
      const val = data.indicatorValues[ind.id] ?? 0.5;
      totalScore += sanitizeMetric(val) * ind.weight;
    });

    const capabilityScore = dimIndicators.length > 0 ? totalScore : 0.5;
    const deprivationRatio = Number((1.0 - capabilityScore).toFixed(4));
    const weightedContribution = Number((deprivationRatio * CAPABILITY_DIMENSIONS[key].weight).toFixed(4));

    breakdown[key] = {
      key,
      label: CAPABILITY_DIMENSIONS[key].label,
      deprivationRatio,
      weightedContribution,
      capabilityScorePercentage: Math.round(capabilityScore * 100),
    };
  });

  let deprivationStatus: MPIResult['deprivationStatus'] = 'Low Deprivation';
  if (mpiScore >= 0.5) {
    deprivationStatus = 'Severe Deprivation';
  } else if (mpiScore >= 0.35) {
    deprivationStatus = 'High Deprivation';
  } else if (mpiScore >= 0.2) {
    deprivationStatus = 'Moderate Deprivation';
  }

  return {
    headcountRatio: H,
    povertyIntensity: A,
    mpiScore,
    deprivationStatus,
    dimensionBreakdown: breakdown,
  };
}
