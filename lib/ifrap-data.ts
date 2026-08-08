/**
 * IFRAP Programme — Balochistan district demonstration dataset (synthetic M&E telemetry)
 * 
 * Represents district datasets for M&E Telemetry in Balochistan:
 * - Quetta
 * - Mastung
 * - Pishin
 * - Kalat
 * - Zhob
 * - Ziarat
 */

import { DistrictCapabilityData } from './mpi';

export interface IFRAPProgressBar {
  id: string;
  label: string;
  value: number; // Current progress metric (0 to 100 or specific unit)
  target: number; // Target benchmark (usually 100)
  unit: string;
  color: 'cyan' | 'emerald' | 'violet' | 'amber';
  dimension: 'water_infrastructure' | 'customary_governance' | 'climate_resilience' | 'economic_capability';
}

export interface IFRAPDistrictData extends DistrictCapabilityData {
  id: string;
  province: string;
  component: number;
  componentName: string;
  coordinates: [number, number]; // [longitude, latitude]
  karezSystemsCount: number;
  rehabilitatedKarezes: number;
  beneficiaryHouseholds: number;
  progressBars: IFRAPProgressBar[];
  anthropologicalNote: string;
  mirabCouncilStatus: 'Active & Formalized' | 'Reorganizing' | 'Community Led' | 'Under Capacity Building';
}

export const IFRAP_DISTRICTS: IFRAPDistrictData[] = [
  {
    id: 'quetta',
    districtId: 'quetta',
    districtName: 'Quetta',
    province: 'Balochistan',
    component: 3,
    componentName: 'IFRAP Programme · Balochistan (synthetic demonstration dataset)',
    coordinates: [66.975, 30.1798],
    population: 1001205,
    karezSystemsCount: 18,
    rehabilitatedKarezes: 14,
    beneficiaryHouseholds: 12400,
    headcountRatio: 0.4,
    povertyIntensity: 0.7,
    indicatorValues: {
      karez_flow_rate: 0.75,
      water_potability_access: 0.70,
      mirab_equity_index: 0.80,
      usufruct_rights_legal_protection: 0.65,
      flood_protection_bunds: 0.60,
      drought_buffer_reserve: 0.55,
      crop_yield_sustainability: 0.70,
      water_cost_burden: 0.65,
    },
    progressBars: [
      {
        id: 'pb_karez_rehab',
        label: 'Karez Channel De-silting & Structural Lining',
        value: 78,
        target: 100,
        unit: '%',
        color: 'cyan',
        dimension: 'water_infrastructure',
      },
      {
        id: 'pb_mirab_equity',
        label: 'Mirab Timed Water Distribution Equity',
        value: 80,
        target: 100,
        unit: '%',
        color: 'emerald',
        dimension: 'customary_governance',
      },
      {
        id: 'pb_flood_bunds',
        label: 'Flash Flood Diversion Infrastructure Built',
        value: 65,
        target: 100,
        unit: '%',
        color: 'violet',
        dimension: 'climate_resilience',
      },
      {
        id: 'pb_orchard_yield',
        label: 'High-Value Agrarian Crop Yield Protection',
        value: 72,
        target: 100,
        unit: '%',
        color: 'amber',
        dimension: 'economic_capability',
      },
    ],
    anthropologicalNote: 'Peri-urban aquifer drawdown requires strict Mirab time allocations to prevent upstream tube-well encroachment on historic Karez-e-Aman flow.',
    mirabCouncilStatus: 'Active & Formalized',
  },
  {
    id: 'pishin',
    districtId: 'pishin',
    districtName: 'Pishin',
    province: 'Balochistan',
    component: 3,
    componentName: 'IFRAP Programme · Balochistan (synthetic demonstration dataset)',
    coordinates: [67.0, 30.58],
    population: 736481,
    karezSystemsCount: 24,
    rehabilitatedKarezes: 16,
    beneficiaryHouseholds: 18900,
    headcountRatio: 0.6,
    povertyIntensity: 0.7,
    indicatorValues: {
      karez_flow_rate: 0.55,
      water_potability_access: 0.50,
      mirab_equity_index: 0.60,
      usufruct_rights_legal_protection: 0.55,
      flood_protection_bunds: 0.45,
      drought_buffer_reserve: 0.40,
      crop_yield_sustainability: 0.50,
      water_cost_burden: 0.45,
    },
    progressBars: [
      {
        id: 'pb_karez_rehab',
        label: 'Karez Mother Well (Sar-e-Karez) Stabilization',
        value: 66,
        target: 100,
        unit: '%',
        color: 'cyan',
        dimension: 'water_infrastructure',
      },
      {
        id: 'pb_mirab_equity',
        label: 'Tribal Elders Usufruct Rights Ledger Sync',
        value: 58,
        target: 100,
        unit: '%',
        color: 'emerald',
        dimension: 'customary_governance',
      },
      {
        id: 'pb_flood_bunds',
        label: 'Check Dams & Recharge Shaft Construction',
        value: 50,
        target: 100,
        unit: '%',
        color: 'violet',
        dimension: 'climate_resilience',
      },
      {
        id: 'pb_orchard_yield',
        label: 'Micro-Irrigation Drip Adoption Rate',
        value: 45,
        target: 100,
        unit: '%',
        color: 'amber',
        dimension: 'economic_capability',
      },
    ],
    anthropologicalNote: 'Dense agricultural orchards dependent on seasonal floodwaters; tribal councils govern water rights across Kakar and Tareen clans.',
    mirabCouncilStatus: 'Community Led',
  },
  {
    id: 'mastung',
    districtId: 'mastung',
    districtName: 'Mastung',
    province: 'Balochistan',
    component: 3,
    componentName: 'IFRAP Programme · Balochistan (synthetic demonstration dataset)',
    coordinates: [66.84, 29.79],
    population: 266461,
    karezSystemsCount: 31,
    rehabilitatedKarezes: 19,
    beneficiaryHouseholds: 14200,
    headcountRatio: 0.6,
    povertyIntensity: 0.85,
    indicatorValues: {
      karez_flow_rate: 0.45,
      water_potability_access: 0.40,
      mirab_equity_index: 0.50,
      usufruct_rights_legal_protection: 0.45,
      flood_protection_bunds: 0.35,
      drought_buffer_reserve: 0.30,
      crop_yield_sustainability: 0.40,
      water_cost_burden: 0.35,
    },
    progressBars: [
      {
        id: 'pb_karez_rehab',
        label: 'Tunnel Section Masonry Lining & De-silting',
        value: 61,
        target: 100,
        unit: '%',
        color: 'cyan',
        dimension: 'water_infrastructure',
      },
      {
        id: 'pb_mirab_equity',
        label: 'Usufruct Boundary Disputes Resolution Rate',
        value: 52,
        target: 100,
        unit: '%',
        color: 'emerald',
        dimension: 'customary_governance',
      },
      {
        id: 'pb_flood_bunds',
        label: 'Torrent Protection Deflection Walls',
        value: 42,
        target: 100,
        unit: '%',
        color: 'violet',
        dimension: 'climate_resilience',
      },
      {
        id: 'pb_orchard_yield',
        label: 'Household Tanker Water Burden Reduction',
        value: 38,
        target: 100,
        unit: '%',
        color: 'amber',
        dimension: 'economic_capability',
      },
    ],
    anthropologicalNote: 'Historic Karez hub with high vulnerability to severe drought; customary water master (Mirab) retains high legal authority over land parcel shares.',
    mirabCouncilStatus: 'Active & Formalized',
  },
  {
    id: 'kalat',
    districtId: 'kalat',
    districtName: 'Kalat',
    province: 'Balochistan',
    component: 3,
    componentName: 'IFRAP Programme · Balochistan (synthetic demonstration dataset)',
    coordinates: [66.58, 29.03],
    population: 412232,
    karezSystemsCount: 22,
    rehabilitatedKarezes: 11,
    beneficiaryHouseholds: 9800,
    headcountRatio: 0.7,
    povertyIntensity: 0.8,
    indicatorValues: {
      karez_flow_rate: 0.40,
      water_potability_access: 0.35,
      mirab_equity_index: 0.45,
      usufruct_rights_legal_protection: 0.40,
      flood_protection_bunds: 0.30,
      drought_buffer_reserve: 0.25,
      crop_yield_sustainability: 0.35,
      water_cost_burden: 0.30,
    },
    progressBars: [
      {
        id: 'pb_karez_rehab',
        label: 'Karez Channel Rehabilitation & Well Casing',
        value: 50,
        target: 100,
        unit: '%',
        color: 'cyan',
        dimension: 'water_infrastructure',
      },
      {
        id: 'pb_mirab_equity',
        label: 'Customary Water Rights Committee Formation',
        value: 48,
        target: 100,
        unit: '%',
        color: 'emerald',
        dimension: 'customary_governance',
      },
      {
        id: 'pb_flood_bunds',
        label: 'Aquifer Infiltration Gallery Recharge',
        value: 35,
        target: 100,
        unit: '%',
        color: 'violet',
        dimension: 'climate_resilience',
      },
      {
        id: 'pb_orchard_yield',
        label: 'Agrarian Income Diversification',
        value: 32,
        target: 100,
        unit: '%',
        color: 'amber',
        dimension: 'economic_capability',
      },
    ],
    anthropologicalNote: 'High plateau customary land system; water rights deeply linked to lineage-based ancestral land holdings (Usufruct rights).',
    mirabCouncilStatus: 'Under Capacity Building',
  },
  {
    id: 'zhob',
    districtId: 'zhob',
    districtName: 'Zhob',
    province: 'Balochistan',
    component: 3,
    componentName: 'IFRAP Programme · Balochistan (synthetic demonstration dataset)',
    coordinates: [69.45, 31.34],
    population: 310544,
    karezSystemsCount: 15,
    rehabilitatedKarezes: 8,
    beneficiaryHouseholds: 7600,
    headcountRatio: 0.65,
    povertyIntensity: 0.75,
    indicatorValues: {
      karez_flow_rate: 0.42,
      water_potability_access: 0.38,
      mirab_equity_index: 0.48,
      usufruct_rights_legal_protection: 0.42,
      flood_protection_bunds: 0.38,
      drought_buffer_reserve: 0.32,
      crop_yield_sustainability: 0.38,
      water_cost_burden: 0.34,
    },
    progressBars: [
      {
        id: 'pb_karez_rehab',
        label: 'Karez Main Stream Silt Removal & Desilting',
        value: 53,
        target: 100,
        unit: '%',
        color: 'cyan',
        dimension: 'water_infrastructure',
      },
      {
        id: 'pb_mirab_equity',
        label: 'Community Water Governance Participation',
        value: 45,
        target: 100,
        unit: '%',
        color: 'emerald',
        dimension: 'customary_governance',
      },
      {
        id: 'pb_flood_bunds',
        label: 'Spillway & Torrent Diversion Protection',
        value: 40,
        target: 100,
        unit: '%',
        color: 'violet',
        dimension: 'climate_resilience',
      },
      {
        id: 'pb_orchard_yield',
        label: 'Smallholder Farming Subsistence Security',
        value: 36,
        target: 100,
        unit: '%',
        color: 'amber',
        dimension: 'economic_capability',
      },
    ],
    anthropologicalNote: 'Northern Balochistan basin; community water distribution relies on traditional stones and wooden sluice gates (Viyala system).',
    mirabCouncilStatus: 'Reorganizing',
  },
  {
    id: 'ziarat',
    districtId: 'ziarat',
    districtName: 'Ziarat',
    province: 'Balochistan',
    component: 3,
    componentName: 'IFRAP Programme · Balochistan (synthetic demonstration dataset)',
    coordinates: [67.72, 30.38],
    population: 160422,
    karezSystemsCount: 12,
    rehabilitatedKarezes: 10,
    beneficiaryHouseholds: 6500,
    headcountRatio: 0.38,
    povertyIntensity: 0.65,
    indicatorValues: {
      karez_flow_rate: 0.70,
      water_potability_access: 0.75,
      mirab_equity_index: 0.72,
      usufruct_rights_legal_protection: 0.68,
      flood_protection_bunds: 0.65,
      drought_buffer_reserve: 0.60,
      crop_yield_sustainability: 0.72,
      water_cost_burden: 0.68,
    },
    progressBars: [
      {
        id: 'pb_karez_rehab',
        label: 'Juniper Forest Aquifer Channel Protection',
        value: 83,
        target: 100,
        unit: '%',
        color: 'cyan',
        dimension: 'water_infrastructure',
      },
      {
        id: 'pb_mirab_equity',
        label: 'Community Water Management Council Active',
        value: 76,
        target: 100,
        unit: '%',
        color: 'emerald',
        dimension: 'customary_governance',
      },
      {
        id: 'pb_flood_bunds',
        label: 'Mountain Stream Erosion Defense Walls',
        value: 70,
        target: 100,
        unit: '%',
        color: 'violet',
        dimension: 'climate_resilience',
      },
      {
        id: 'pb_orchard_yield',
        label: 'Apple & Cherry Orchard Yield Protection',
        value: 75,
        target: 100,
        unit: '%',
        color: 'amber',
        dimension: 'economic_capability',
      },
    ],
    anthropologicalNote: 'Montane Juniper ecosystem; Karez discharge fed by snowmelt springs, managed by indigenous village committees (Karez Tanzeem).',
    mirabCouncilStatus: 'Active & Formalized',
  },
];

export function getIFRAPDistrictById(id: string): IFRAPDistrictData | undefined {
  if (!id) return undefined;
  const target = id.toLowerCase().trim();
  return IFRAP_DISTRICTS.find((d) => d.id === target || d.districtName.toLowerCase() === target);
}

export function getAllIFRAPDistricts(): IFRAPDistrictData[] {
  return IFRAP_DISTRICTS;
}

export function getIFRAPSummaryStats() {
  const totalDistricts = IFRAP_DISTRICTS.length;
  const totalPopulation = IFRAP_DISTRICTS.reduce((acc, curr) => acc + curr.population, 0);
  const totalKarez = IFRAP_DISTRICTS.reduce((acc, curr) => acc + curr.karezSystemsCount, 0);
  const totalRehabilitated = IFRAP_DISTRICTS.reduce((acc, curr) => acc + curr.rehabilitatedKarezes, 0);
  const totalBeneficiaryHH = IFRAP_DISTRICTS.reduce((acc, curr) => acc + curr.beneficiaryHouseholds, 0);

  const avgH = IFRAP_DISTRICTS.reduce((acc, curr) => acc + curr.headcountRatio, 0) / totalDistricts;
  const avgA = IFRAP_DISTRICTS.reduce((acc, curr) => acc + curr.povertyIntensity, 0) / totalDistricts;
  const avgMPI = Number((avgH * avgA).toFixed(4));

  return {
    totalDistricts,
    totalPopulation,
    totalKarez,
    totalRehabilitated,
    totalBeneficiaryHH,
    avgHeadcountRatio: Number(avgH.toFixed(4)),
    avgPovertyIntensity: Number(avgA.toFixed(4)),
    avgMPI,
  };
}

export * from './me-analytics';

