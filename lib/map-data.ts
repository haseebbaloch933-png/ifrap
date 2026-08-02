/**
 * Balochistan Archaeological & Decolonial Hydrology Map Data
 * Provides spatial coordinates, technocratic metadata, and Indigenous Technical Knowledge (ITK) notes
 * for Karez water systems, ancient archaeological sites, and pastoral migration corridors.
 */

export interface CustomaryWaterRights {
  governanceModel: string;
  allocationUnits: string;
  dischargeRate: string;
  depthMeters?: number;
  customaryLaw: string;
  tribalAllocation: string;
}

export interface FeatureMetadata {
  id: string;
  itkName: string;
  colonialName?: string;
  category: 'karez' | 'archaeological_node' | 'pastoral_corridor' | 'state_infrastructure';
  era: string;
  anthropologicalContext: string;
  customaryWaterRights?: CustomaryWaterRights;
  infrastructureType?: string;
  dischargeRate?: string;
  depth?: string;
  status?: string;
  district?: string;
}

export interface LocationFeature {
  id: string;
  name: string;
  indigenousName: string;
  type: 'karez' | 'archaeological' | 'hydrology_route' | 'pastoral_corridor';
  coordinates: [number, number]; // [longitude, latitude]
  district: string;
  technocraticMetaData: {
    stateInfrastructureId: string;
    governmentalCanalCode: string;
    flowDischargeLps: number;
    concreteLiningStatus: string;
    administrativeStatus: string;
    topDownAnnotation: string;
  };
  decolonialItkData: {
    customaryWaterRights: string;
    mirabDistributionSystem: string;
    shabanaShareHours: number;
    pastoralCorridorName: string;
    indigenousHydrologyTerms: string[];
    anthropologicalNotes: string;
    indigenousWaterRightsStatus: string;
  };
}

export interface RouteFeature {
  id: string;
  name: string;
  indigenousName: string;
  coordinates: [number, number][]; // LineString coordinates [[lng, lat], ...]
  district: string;
  technocraticAnnotation: string;
  decolonialITKNotes: string;
  waterRightsStatus: string;
}

export const BALOCHISTAN_LOCATIONS: LocationFeature[] = [
  {
    id: 'karez-aman',
    name: 'Karez-e-Aman',
    indigenousName: 'کاریزِ امان (Karez-e-Aman Subterranean System)',
    type: 'karez',
    coordinates: [66.975, 30.1798], // Quetta Valley
    district: 'Quetta',
    technocraticMetaData: {
      stateInfrastructureId: 'GOV-BAL-K01',
      governmentalCanalCode: 'QTA-HYD-04',
      flowDischargeLps: 45,
      concreteLiningStatus: 'Partially Subsidized / Unlined',
      administrativeStatus: 'State Irrigation Dept Surveyed',
      topDownAnnotation: 'Quetta Valley Sub-surface Aquifer Discharge Point 1',
    },
    decolonialItkData: {
      customaryWaterRights: 'Ancestral communal usufruct divided into 24 Shabana (time-shares) overseen by elected Mirab.',
      mirabDistributionSystem: 'Solar-rotation time distribution using sun-dial shadow metrics (Tassu).',
      shabanaShareHours: 24,
      pastoralCorridorName: 'Shaal-Valley Transhumance Path',
      indigenousHydrologyTerms: ['Karez', 'Moth', 'Tassu', 'Mirab', 'Khas'],
      anthropologicalNotes: 'Sustained over 800 years without electric tubewells. Protects subterranean aquifer gravity flow.',
      indigenousWaterRightsStatus: 'Customary Tribal Commons (Inalienable Usufruct)',
    },
  },
  {
    id: 'mehrgarh-site',
    name: 'Mehrgarh Archaeological Complex',
    indigenousName: 'مہرگڑھ (Ancient Neolithic Farming & Hydrology)',
    type: 'archaeological',
    coordinates: [67.6167, 29.3833], // Kachi Plain / Bolan Pass
    district: 'Kacchi (Bolan)',
    technocraticMetaData: {
      stateInfrastructureId: 'ARCH-BAL-M01',
      governmentalCanalCode: 'KCH-BOL-01',
      flowDischargeLps: 120,
      concreteLiningStatus: 'N/A - Heritage Monument Zone',
      administrativeStatus: 'Archaeology Dept Protection Zone 1',
      topDownAnnotation: 'Neolithic Agricultural & Hydrological Site (7000 BCE - 2500 BCE)',
    },
    decolonialItkData: {
      customaryWaterRights: 'Early Holocene flood-water harvesting (Sailaba) and communal terraced silt-retention bunds (Gharband).',
      mirabDistributionSystem: 'Seasonal Bolan River inundation management by tribal lineage elders.',
      shabanaShareHours: 48,
      pastoralCorridorName: 'Bolan Pass Trans-Indus Route',
      indigenousHydrologyTerms: ['Sailaba', 'Gabarbund', 'Nallah', 'Band-e-Aab'],
      anthropologicalNotes: 'Oldest evidence of cereal farming and domesticated zebu cattle in South Asia utilizing ephemeral stream control.',
      indigenousWaterRightsStatus: 'Heritage Communal Sacred Hydrology Zone',
    },
  },
  {
    id: 'nausharo-site',
    name: 'Nausharo Archaeological Outpost',
    indigenousName: 'نوشہرو (Harappan Hydraulic Outpost)',
    type: 'archaeological',
    coordinates: [67.92, 29.40], // Kachi Plain
    district: 'Kacchi',
    technocraticMetaData: {
      stateInfrastructureId: 'ARCH-BAL-N02',
      governmentalCanalCode: 'KCH-NAU-02',
      flowDischargeLps: 80,
      concreteLiningStatus: 'Unlined Inundation Channels',
      administrativeStatus: 'Provincial Survey Grid 44',
      topDownAnnotation: 'Indus Civilization Peripheral Trading & Water Channel Outpost',
    },
    decolonialItkData: {
      customaryWaterRights: 'Inter-settlement alluvial soil sharing & communal silt dredging traditions.',
      mirabDistributionSystem: 'Rotational sluice opening coordinated with monsoon river surges.',
      shabanaShareHours: 12,
      pastoralCorridorName: 'Kacchi Plain - Indus Basin Migratory Belt',
      indigenousHydrologyTerms: ['Gharbund', 'Rahi', 'Mirab-i-Aab'],
      anthropologicalNotes: 'Exhibits transition from Mehrgarh Neolithic to mature Indus hydraulic engineering.',
      indigenousWaterRightsStatus: 'Customary Lineage Alluvial Usufruct',
    },
  },
  {
    id: 'pishin-karez',
    name: 'Karez-e-Pishin Valley System',
    indigenousName: 'پشین کاریزات (Pishin Customary Hydrology)',
    type: 'karez',
    coordinates: [67.0, 30.58], // Pishin
    district: 'Pishin',
    technocraticMetaData: {
      stateInfrastructureId: 'GOV-BAL-K02',
      governmentalCanalCode: 'PSN-IRR-08',
      flowDischargeLps: 60,
      concreteLiningStatus: 'Partially Encroached by Tubewell Permits',
      administrativeStatus: 'State District Water Board Monitoring',
      topDownAnnotation: 'Pishin Basin Underground Aquifer Channel Segment',
    },
    decolonialItkData: {
      customaryWaterRights: 'Shared Usufruct between Tareen and Kakar lineage councils.',
      mirabDistributionSystem: 'Water distribution measured by night-star positions (Kaukab) and shadow markers.',
      shabanaShareHours: 36,
      pastoralCorridorName: 'Toba Kakar High-Altitude Pastoral Path',
      indigenousHydrologyTerms: ['Karez', 'Chasma', 'Shabana', 'Tassu'],
      anthropologicalNotes: 'Demonstrates community self-governance defending against predatory groundwater overdraft.',
      indigenousWaterRightsStatus: 'Tribal Collective Usufruct Title',
    },
  },
  {
    id: 'quetta-hydrology-route',
    name: 'Quetta Valley Indigenous Hydrology Route',
    indigenousName: 'شال کوٹ قدیم کاریز نظام (Shaalkot Hydro-Cultural Route)',
    type: 'hydrology_route',
    coordinates: [66.84, 29.79], // Mastung - Quetta Corridor
    district: 'Mastung / Quetta',
    technocraticMetaData: {
      stateInfrastructureId: 'GOV-BAL-R03',
      governmentalCanalCode: 'MST-QTA-09',
      flowDischargeLps: 95,
      concreteLiningStatus: 'State Tubewell Heavy Encroachment Zone',
      administrativeStatus: 'Provincial Water Authority Priority Zone',
      topDownAnnotation: 'Regional Aquifer Transfer Route & Urban Expansion Interface',
    },
    decolonialItkData: {
      customaryWaterRights: 'Inter-tribal Karez confederation water sharing compact.',
      mirabDistributionSystem: 'Seasonal emergency reserve allocation for drought years.',
      shabanaShareHours: 72,
      pastoralCorridorName: 'Sarawan Pastoral Migration Highway',
      indigenousHydrologyTerms: ['Karez-e-Chiltan', 'Mirab-e-Aab', 'Guth', 'Wara'],
      anthropologicalNotes: 'Ancient subterranean canal network channeling snowmelt from Mount Chiltan to agricultural terraces.',
      indigenousWaterRightsStatus: 'Protected Inter-tribal Usufruct Compact',
    },
  },
];

export const BALOCHISTAN_ROUTES: RouteFeature[] = [
  {
    id: 'route-karez-network',
    name: 'Quetta-Mastung Karez Underground Corridor',
    indigenousName: 'شال تا مستونگ زیرِ زمین کاریز راہ (Shaal-Mastung Subterranean Route)',
    coordinates: [
      [66.975, 30.1798],
      [66.91, 30.02],
      [66.84, 29.79],
      [67.05, 29.60],
    ],
    district: 'Quetta - Mastung',
    technocraticAnnotation: 'High-Risk Groundwater Depletion Zone (Tubewell Density > 50/km2)',
    decolonialITKNotes: 'Historical gravity-flow Karez chain linking mountain alluvial fans to arid plain orchards.',
    waterRightsStatus: 'Customary Tribal Commons under Threat by Technocratic Over-Pumping',
  },
  {
    id: 'route-bolan-migration',
    name: 'Bolan Pass Transhumance & Hydrology Migration Route',
    indigenousName: 'درہ بولان کوچ و زراعت راہ (Bolan Pastoral-Water Corridor)',
    coordinates: [
      [67.0, 30.58],
      [67.15, 30.10],
      [67.6167, 29.3833],
      [67.92, 29.40],
    ],
    district: 'Pishin - Quetta - Bolan - Kacchi',
    technocraticAnnotation: 'N-65 Highway Trans-Provincial Logistics Corridor & Irrigation District 4',
    decolonialITKNotes: '5000-year-old seasonal pastoral migration route synchronizing livestock movement with Karez water discharge.',
    waterRightsStatus: 'Inalienable Pastoral Transhumance & Inundation Usufruct Rights',
  },
];

export function getLocationsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: BALOCHISTAN_LOCATIONS.map((loc) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: loc.coordinates,
      },
      properties: {
        id: loc.id,
        name: loc.name,
        indigenousName: loc.indigenousName,
        type: loc.type,
        district: loc.district,
        stateId: loc.technocraticMetaData.stateInfrastructureId,
        canalCode: loc.technocraticMetaData.governmentalCanalCode,
        flowLps: loc.technocraticMetaData.flowDischargeLps,
        topDownAnnotation: loc.technocraticMetaData.topDownAnnotation,
        customaryWaterRights: loc.decolonialItkData.customaryWaterRights,
        mirabSystem: loc.decolonialItkData.mirabDistributionSystem,
        pastoralCorridor: loc.decolonialItkData.pastoralCorridorName,
        anthropologicalNotes: loc.decolonialItkData.anthropologicalNotes,
        usufructStatus: loc.decolonialItkData.indigenousWaterRightsStatus,
      },
    })),
  };
}

export function getRoutesGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: BALOCHISTAN_ROUTES.map((rt) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: rt.coordinates,
      },
      properties: {
        id: rt.id,
        name: rt.name,
        indigenousName: rt.indigenousName,
        district: rt.district,
        technocraticAnnotation: rt.technocraticAnnotation,
        decolonialITKNotes: rt.decolonialITKNotes,
        waterRightsStatus: rt.waterRightsStatus,
      },
    })),
  };
}

export const BALOCHISTAN_SPATIAL_FEATURES: FeatureMetadata[] = [
  {
    id: 'karez-quetta-chashma',
    itkName: 'کاریز چشمہِ زندگ (Quetta Chashma-e-Zindag)',
    colonialName: 'Quetta Urban Water Source Grid 1',
    category: 'karez',
    era: '800 CE - Present',
    district: 'Quetta',
    anthropologicalContext: 'Ancestral underground aqueduct tapping sub-surface alluvial aquifers of Mount Chiltan. Operates on gravity flow without fuel or electric pumping.',
    customaryWaterRights: {
      governanceModel: 'Elected Mirab Council & Elders Assembly',
      allocationUnits: '24 Shabana (time-shares per lunar cycle)',
      dischargeRate: '45 L/s',
      depthMeters: 18,
      customaryLaw: 'Inalienable Tribal Usufruct Commons',
      tribalAllocation: 'Shared Kasi, Durrani & Pashtun Lineages'
    }
  },
  {
    id: 'karez-pishin-surkhab',
    itkName: 'کاریز سرخاب پشین (Pishin Surkhab Aqueduct)',
    colonialName: 'Pishin Main Irrigation Canal 8',
    category: 'karez',
    era: '1200 CE - Present',
    district: 'Pishin',
    anthropologicalContext: 'High-altitude mother-well aqueduct system drawing snowmelt from Toba Kakar range. Managed using sundial and stellar timekeeping.',
    customaryWaterRights: {
      governanceModel: 'Tareen-Kakar Inter-tribal Compact',
      allocationUnits: '36 Shabana (time-shares)',
      dischargeRate: '60 L/s',
      depthMeters: 25,
      customaryLaw: 'Rotational Celestial Time-Share (Kaukab)',
      tribalAllocation: 'Tareen & Kakar Lineage Councils'
    }
  },
  {
    id: 'karez-mastung-aqueducts',
    itkName: 'کاریزاتِ مستونگ (Mastung Aqueducts Confederation)',
    colonialName: 'Mastung District Aquifer Overlay',
    category: 'karez',
    era: '1000 CE - Present',
    district: 'Mastung',
    anthropologicalContext: 'Network of interconnected subterranean channels supporting date palm and fruit orchard micro-ecosystems across Mastung valley.',
    customaryWaterRights: {
      governanceModel: 'Sarawan Tribal Water Assembly',
      allocationUnits: '72 Shabana (time-shares)',
      dischargeRate: '95 L/s',
      depthMeters: 30,
      customaryLaw: 'Communal Usufruct Rights (Guth & Wara)',
      tribalAllocation: 'Bangulzai, Shahwani & Raisani Lineages'
    }
  },
  {
    id: 'node-mehrgarh',
    itkName: 'مہرگڑھ (Mehrgarh Neolithic Node)',
    colonialName: 'Site BAL-M01 / Kacchi Plain Grid',
    category: 'archaeological_node',
    era: '7000 BCE - 2500 BCE',
    district: 'Kacchi (Bolan)',
    anthropologicalContext: 'Oldest known agricultural and hydraulic settlement in South Asia. Features stone Gabarbund terraced dams and seasonal floodwater harvesting.',
    customaryWaterRights: {
      governanceModel: 'Neolithic Lineage Flood-water Sharing',
      allocationUnits: 'Seasonal Alluvial Inundation Shares',
      dischargeRate: '120 L/s (Seasonal Surge)',
      depthMeters: 0,
      customaryLaw: 'Ancient Alluvial Silt & Water Usufruct (Sailaba)',
      tribalAllocation: 'Bolan Basin Agricultural Lineages'
    }
  },
  {
    id: 'node-nausharo',
    itkName: 'نوشہرو (Nausharo Harappan Complex)',
    colonialName: 'Site BAL-N02 / Provincial Survey 44',
    category: 'archaeological_node',
    era: '2800 BCE - 1900 BCE',
    district: 'Kacchi',
    anthropologicalContext: 'Indus Civilization peripheral hydraulic outpost with mud-brick sluices, drainage channels, and potter craft quarter.',
    customaryWaterRights: {
      governanceModel: 'Harappan Sluice Distribution System',
      allocationUnits: 'Alluvial Channel Silt Shares',
      dischargeRate: '80 L/s',
      depthMeters: 5,
      customaryLaw: 'Alluvial Sluice Diversion Law',
      tribalAllocation: 'Harappan-Bolan Hydraulic Network'
    }
  },
  {
    id: 'node-rana-ghundai',
    itkName: 'رانا غنڈئی (Rana Ghundai Pastoral Mound)',
    colonialName: 'Loralai Site 3 / Grid LR-03',
    category: 'archaeological_node',
    era: '4500 BCE - 2000 BCE',
    district: 'Loralai',
    anthropologicalContext: 'Stratified pastoral mound site showing early Zebu cattle domestication and ephemeral stream embankment control.',
    customaryWaterRights: {
      governanceModel: 'Loralai Basin Seasonal Water Rights',
      allocationUnits: 'Terrace Embankment Shares',
      dischargeRate: '35 L/s',
      depthMeters: 2,
      customaryLaw: 'Gabarbund Terrace Water Rights',
      tribalAllocation: 'Loralai Regional Pastoralists'
    }
  },
  {
    id: 'node-pirak',
    itkName: 'پیرک (Pirak Iron Age Settlement)',
    colonialName: 'Pirak Reserve Grid 12',
    category: 'archaeological_node',
    era: '1800 BCE - 800 BCE',
    district: 'Kacchi',
    anthropologicalContext: 'Post-Harappan site introducing double-cropping (sorghum/rice) and winter canal diversion techniques.',
    customaryWaterRights: {
      governanceModel: 'Early Iron Age Canal Assembly',
      allocationUnits: 'Seasonal Flood Diversion Shares',
      dischargeRate: '50 L/s',
      depthMeters: 4,
      customaryLaw: 'Seasonal Riverine Diversion Compact',
      tribalAllocation: 'Kacchi Plain Agricultural Lineages'
    }
  },
  {
    id: 'corridor-bolan-pass',
    itkName: 'درہ بولان (Bolan Pass Pastoral Migration Corridor)',
    colonialName: 'N-65 Highway & Railway Logistics Line',
    category: 'pastoral_corridor',
    era: '5000 BCE - Present',
    district: 'Quetta-Bolan-Kacchi',
    anthropologicalContext: 'Transhumance migration artery linking high-altitude summer pastures in Shaalkot to winter grazing plains in Kacchi basin.',
    customaryWaterRights: {
      governanceModel: 'Inter-tribal Waystation Access Compact',
      allocationUnits: 'Pastoral Stream & Well Rest Rights',
      dischargeRate: 'Perennial Gravity Surface Flow',
      depthMeters: 0,
      customaryLaw: 'Free Transhumance Water Access',
      tribalAllocation: 'Brahui & Pashtun Nomadic Clans'
    }
  },
  {
    id: 'corridor-zhob-pishin',
    itkName: 'ژوب-پشین (Zhob-Pishin Pastoral Corridor)',
    colonialName: 'N-50 Provincial Highway Corridor',
    category: 'pastoral_corridor',
    era: '3000 BCE - Present',
    district: 'Zhob-Pishin',
    anthropologicalContext: 'Highland pastoral route along Zhob river valley utilizing seasonal spring pools and ephemeral stream depressions.',
    customaryWaterRights: {
      governanceModel: 'Pashtun Powindah Water Council',
      allocationUnits: 'Pastoral Stream Grazing Rights',
      dischargeRate: 'Seasonal Ephemeral Flow',
      depthMeters: 0,
      customaryLaw: 'Tribal Spring & Grazing Usufruct',
      tribalAllocation: 'Kakar & Mandokhail Pastoral Nomads'
    }
  },
  {
    id: 'infra-mirani-dam',
    itkName: 'دشت میرانی (Mirani Dam State Project)',
    colonialName: 'Mirani Storage Reservoir Infrastructure',
    category: 'state_infrastructure',
    era: '2006 CE',
    district: 'Kech (Turbat)',
    anthropologicalContext: 'State hydro-engineering project on Dasht River; caused backwater flooding, displaced date palm farmers, and disrupted customary riverine rights.',
    infrastructureType: 'Concrete & Rock-fill Impoundment Dam',
    dischargeRate: '1500 L/s',
    status: 'Operational / Customary Rights Displaced'
  },
  {
    id: 'infra-sabakzai-dam',
    itkName: 'سبکزئی (Sabakzai Dam Reservoir)',
    colonialName: 'Zhob Basin Storage Dam Grid',
    category: 'state_infrastructure',
    era: '2007 CE',
    district: 'Zhob',
    anthropologicalContext: 'Top-down embankment dam on Sawar river; impounded upstream flow and reduced downstream spate irrigation for pastoral communities.',
    infrastructureType: 'Earth-fill Embankment Dam',
    dischargeRate: '800 L/s',
    status: 'Operational / State Managed'
  },
  {
    id: 'infra-quetta-tubewells',
    itkName: 'کویٹہ ٹیوب ویل گریڈ (Quetta State Well Field Grid)',
    colonialName: 'WAPDA Deep Tubewell Pumping Grid',
    category: 'state_infrastructure',
    era: '1970 CE - Present',
    district: 'Quetta',
    anthropologicalContext: 'Subsidized electric deep-well extraction grid causing critical groundwater drop (>5m/yr) and drying ancient gravity Karez channels.',
    infrastructureType: 'Motorized Deep Aquifer Extraction Field',
    depth: '250 meters',
    status: 'Critical Groundwater Depletion'
  },
  {
    id: 'infra-canal-drain-4b',
    itkName: 'ڈراین ۴-بی (Colonial Canal Drain 4-B)',
    colonialName: 'Pat Feeder Canal Outfall Drain 4-B',
    category: 'state_infrastructure',
    era: '1932 CE / Post-Colonial',
    district: 'Jaffarabad',
    anthropologicalContext: 'Colonial drainage canal bisecting indigenous customary grazing routes and causing saline waterlogging in adjacent pastoral lands.',
    infrastructureType: 'Unlined Agricultural Drainage Outfall',
    status: 'Active Saline Drainage Line'
  }
];

export const FEATURE_GEOMETRIES: Record<string, { type: 'Point' | 'LineString'; coordinates: any }> = {
  'karez-quetta-chashma': { type: 'Point', coordinates: [66.9750, 30.1798] },
  'karez-pishin-surkhab': { type: 'Point', coordinates: [67.0000, 30.5800] },
  'karez-mastung-aqueducts': { type: 'Point', coordinates: [66.8400, 29.7900] },
  'node-mehrgarh': { type: 'Point', coordinates: [67.6167, 29.2127] },
  'node-nausharo': { type: 'Point', coordinates: [67.8800, 29.3500] },
  'node-rana-ghundai': { type: 'Point', coordinates: [68.3200, 30.3000] },
  'node-pirak': { type: 'Point', coordinates: [67.8900, 29.2800] },
  'corridor-bolan-pass': {
    type: 'LineString',
    coordinates: [
      [67.0000, 30.5800],
      [67.1500, 30.1000],
      [67.6167, 29.2127],
      [67.8900, 29.2800]
    ]
  },
  'corridor-zhob-pishin': {
    type: 'LineString',
    coordinates: [
      [67.0000, 30.5800],
      [68.3200, 30.3000],
      [69.1500, 31.1800]
    ]
  },
  'infra-mirani-dam': { type: 'Point', coordinates: [62.4700, 26.0400] },
  'infra-sabakzai-dam': { type: 'Point', coordinates: [69.1500, 31.1800] },
  'infra-quetta-tubewells': { type: 'Point', coordinates: [66.9700, 30.1800] },
  'infra-canal-drain-4b': { type: 'Point', coordinates: [68.2000, 28.5000] }
};

export function getBalochistanSpatialData() {
  return {
    type: 'FeatureCollection' as const,
    features: BALOCHISTAN_SPATIAL_FEATURES.map((meta) => {
      const geom = FEATURE_GEOMETRIES[meta.id] || { type: 'Point', coordinates: [67.0, 29.8] };
      return {
        type: 'Feature' as const,
        geometry: geom,
        properties: {
          ...meta,
          governanceModel: meta.customaryWaterRights?.governanceModel,
          allocationUnits: meta.customaryWaterRights?.allocationUnits,
          customaryLaw: meta.customaryWaterRights?.customaryLaw,
          tribalAllocation: meta.customaryWaterRights?.tribalAllocation,
          dischargeRate: meta.dischargeRate || meta.customaryWaterRights?.dischargeRate,
          depth: meta.depth || (meta.customaryWaterRights?.depthMeters ? `${meta.customaryWaterRights.depthMeters}m` : undefined)
        }
      };
    })
  };
}

// ============================================================================
// GeoServer Fallback Spatial Layer GeoJSON Datasets (Milestone 1)
// ============================================================================

export interface FloodExtentFeature {
  id: string;
  name: string;
  flood_date: string;
  water_depth_m: number;
  inundated_sqkm: number;
  severity_index: 'MODERATE' | 'SEVERE' | 'CRITICAL' | 'EXTREME';
  description: string;
  coordinates: [number, number][][];
}

export interface RiverBufferFeature {
  id: string;
  basin_name: string;
  buffer_dist_m: number;
  ecological_status: string;
  flow_rate_lps: number;
  description: string;
  coordinates: [number, number][][];
}

export interface ReconstructionSiteFeature {
  site_id: string;
  site_name: string;
  contractor: string;
  completion_pct: number;
  budget_pkr: number;
  status: 'in_progress' | 'completed';
  coordinates: [number, number];
}

export interface ParcelTenureFeature {
  parcel_id: string;
  name: string;
  customary_tribe: string;
  state_lease_code: string;
  usufruct_rights_type: 'customary_usufruct' | 'state_title' | 'private' | 'disputed';
  coordinates: [number, number][][];
}

export const FLOOD_EXTENTS_2022_DATA: FloodExtentFeature[] = [
  {
    id: 'flood_extents_2022_qta_01',
    name: 'Quetta Valley Inundation Extent (2022 Monsoon)',
    flood_date: '2022-08-18',
    water_depth_m: 2.5,
    inundated_sqkm: 128.4,
    severity_index: 'CRITICAL',
    description: 'Monsoon flash flood extent across Shaalkot basin alluvial plain submerged urban Karez outlets.',
    coordinates: [
      [
        [66.90, 30.12],
        [67.05, 30.12],
        [67.08, 30.24],
        [66.92, 30.24],
        [66.90, 30.12]
      ]
    ]
  },
  {
    id: 'flood_extents_2022_bol_02',
    name: 'Bolan Pass Inundation Corridor',
    flood_date: '2022-08-24',
    water_depth_m: 4.2,
    inundated_sqkm: 312.0,
    severity_index: 'EXTREME',
    description: 'Bolan River inundation surge overflowing historic transhumance pastoral migration paths.',
    coordinates: [
      [
        [67.45, 29.25],
        [67.75, 29.25],
        [67.80, 29.45],
        [67.50, 29.45],
        [67.45, 29.25]
      ]
    ]
  }
];

export const RIVER_BASIN_BUFFERS_DATA: RiverBufferFeature[] = [
  {
    id: 'river_basin_buffers_nari_01',
    basin_name: 'Nari River Active Basin Buffer Zone',
    buffer_dist_m: 500,
    ecological_status: 'Karez Recharge Protection Zone',
    flow_rate_lps: 920,
    description: 'Ecosystem protection corridor safeguarding sub-surface alluvial aquifers and ancestral gravity channels.',
    coordinates: [
      [
        [67.15, 29.70],
        [67.65, 29.70],
        [67.70, 30.10],
        [67.20, 30.10],
        [67.15, 29.70]
      ]
    ]
  },
  {
    id: 'river_basin_buffers_psn_02',
    basin_name: 'Pishin Lora Riparian Buffer Zone',
    buffer_dist_m: 350,
    ecological_status: 'Active Aquifer Restoration Buffer',
    flow_rate_lps: 580,
    description: 'Protected riparian zone mitigating over-pumping encroachment from unauthorized tubewell fields.',
    coordinates: [
      [
        [66.85, 30.45],
        [67.15, 30.45],
        [67.20, 30.70],
        [66.90, 30.70],
        [66.85, 30.45]
      ]
    ]
  }
];

export const RECONSTRUCTION_SITES_DATA: ReconstructionSiteFeature[] = [
  {
    site_id: 'REC-QTA-01',
    site_name: 'Karez-e-Aman Subterranean Shaft Restoration',
    contractor: 'Shaalkot Indigenous Water Trust',
    completion_pct: 75,
    budget_pkr: 4500000,
    status: 'in_progress',
    coordinates: [66.96, 30.19]
  },
  {
    site_id: 'REC-BOL-02',
    site_name: 'Mehrgarh Terraced Gabarbund Silt Dam Renewal',
    contractor: 'Bolan Tribal Hydrology Collective',
    completion_pct: 100,
    budget_pkr: 8900000,
    status: 'completed',
    coordinates: [67.62, 29.39]
  },
  {
    site_id: 'REC-PSN-03',
    site_name: 'Pishin Community Aquifer Monitoring Post',
    contractor: 'Tareen Lineage Eco-Council',
    completion_pct: 35,
    budget_pkr: 3200000,
    status: 'in_progress',
    coordinates: [67.02, 30.56]
  },
  {
    site_id: 'REC-MST-04',
    site_name: 'Mastung Karez Aqueduct Shielding',
    contractor: 'Sarawan Heritage Water Trust',
    completion_pct: 100,
    budget_pkr: 6100000,
    status: 'completed',
    coordinates: [66.85, 29.80]
  }
];

export const PARCEL_TENURE_STATUS_DATA: ParcelTenureFeature[] = [
  {
    parcel_id: 'PAR-QTA-01',
    name: 'Shaalkot Customary Tribal Commons Parcel',
    customary_tribe: 'Kasi-Pashtun & Durrani Confederation',
    state_lease_code: 'N/A (Tribal Title)',
    usufruct_rights_type: 'customary_usufruct',
    coordinates: [
      [
        [66.82, 30.08],
        [66.96, 30.08],
        [66.98, 30.22],
        [66.84, 30.22],
        [66.82, 30.08]
      ]
    ]
  },
  {
    parcel_id: 'PAR-QTA-02',
    name: 'Provincial Irrigation Dept Reserved Land',
    customary_tribe: 'None (State Control)',
    state_lease_code: 'GOV-BAL-L88',
    usufruct_rights_type: 'state_title',
    coordinates: [
      [
        [67.02, 30.20],
        [67.18, 30.20],
        [67.22, 30.35],
        [67.05, 30.35],
        [67.02, 30.20]
      ]
    ]
  },
  {
    parcel_id: 'PAR-PSN-03',
    name: 'Pishin Agricultural Private Orchard Holding',
    customary_tribe: 'Tareen Lineage Clan',
    state_lease_code: 'PVT-PSN-104',
    usufruct_rights_type: 'private',
    coordinates: [
      [
        [66.95, 30.48],
        [67.12, 30.48],
        [67.15, 30.62],
        [66.98, 30.62],
        [66.95, 30.48]
      ]
    ]
  },
  {
    parcel_id: 'PAR-MST-04',
    name: 'Mastung Aquifer Encroachment Disputed Zone',
    customary_tribe: 'Sarawan Water Assembly (Claimant)',
    state_lease_code: 'DISP-MST-099',
    usufruct_rights_type: 'disputed',
    coordinates: [
      [
        [66.75, 29.72],
        [66.92, 29.72],
        [66.95, 29.88],
        [66.78, 29.88],
        [66.75, 29.72]
      ]
    ]
  }
];

export function getFloodExtentsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: FLOOD_EXTENTS_2022_DATA.map((item) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: item.coordinates,
      },
      properties: {
        id: item.id,
        name: item.name,
        flood_date: item.flood_date,
        water_depth_m: item.water_depth_m,
        inundated_sqkm: item.inundated_sqkm,
        severity_index: item.severity_index,
        description: item.description,
      },
    })),
  };
}

export function getRiverBuffersGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: RIVER_BASIN_BUFFERS_DATA.map((item) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: item.coordinates,
      },
      properties: {
        id: item.id,
        basin_name: item.basin_name,
        name: item.basin_name,
        buffer_dist_m: item.buffer_dist_m,
        ecological_status: item.ecological_status,
        flow_rate_lps: item.flow_rate_lps,
        description: item.description,
      },
    })),
  };
}

export function getReconstructionSitesGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: RECONSTRUCTION_SITES_DATA.map((item) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: item.coordinates,
      },
      properties: {
        site_id: item.site_id,
        id: item.site_id,
        site_name: item.site_name,
        name: item.site_name,
        contractor: item.contractor,
        completion_pct: item.completion_pct,
        budget_pkr: item.budget_pkr,
        status: item.status,
      },
    })),
  };
}

export function getLandParcelsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: PARCEL_TENURE_STATUS_DATA.map((item) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: item.coordinates,
      },
      properties: {
        parcel_id: item.parcel_id,
        id: item.parcel_id,
        name: item.name,
        customary_tribe: item.customary_tribe,
        state_lease_code: item.state_lease_code,
        usufruct_rights_type: item.usufruct_rights_type,
      },
    })),
  };
}

