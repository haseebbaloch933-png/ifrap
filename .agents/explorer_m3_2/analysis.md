# Technical Analysis Report: Senian Multidimensional Poverty Index (MPI) Logic Engine (`lib/mpi.ts`)

**Author**: Explorer 2 (Milestone 3: Telemetry & Senian MPI Logic Engine)  
**Project**: Next.js WebGIS Portfolio & M&E Telemetry Dashboard  
**Target File**: `lib/mpi.ts`  
**Date**: 2026-07-23  

---

## 1. Executive Summary & Mission Scope

Milestone 3 of the Next.js WebGIS Portfolio project focuses on building the **Telemetry Dashboard** and the underlying **Senian Multidimensional Poverty Index (MPI) Logic Engine**. Grounded in Amartya Sen's *Capability Approach* and operationalized via the Oxford Poverty and Human Development Initiative (OPHI) Alkire-Foster (AF) methodology, this engine calculates capability deprivation metrics, multidimensional headcount ratios ($H$), intensity of poverty ($A$), adjusted headcount ratios ($MPI = H \times A$), dimensional/indicator contributions ($C_j$), and subgroup decompositions for Monitoring & Evaluation (M&E) telemetry data across Balochistan (specifically aligned with IFRAP Component 3 - Indus/Balochistan Water and Agriculture Development).

This document delivers:
1. Exact mathematical formulation of the Senian / Alkire-Foster Multidimensional Poverty Index.
2. A customized 6-domain capability reduction taxonomy for Balochistan water, land usufruct, governance, and living standards telemetry.
3. Complete TypeScript interface contracts, data structures, and functional implementation designs for `lib/mpi.ts`.
4. Visual progress bar data binding specs for IFRAP Component 3 telemetry.
5. Rigorous unit testing specifications covering edge cases, threshold boundary conditions, weight normalization, and mathematical additivity invariants.

---

## 2. Senian / Alkire-Foster Mathematical Framework

Amartya Sen's Capability Approach evaluates human well-being not merely by monetary income, but by individual *capabilities* (the freedoms to achieve valued states of being and doing, termed *functionings*). Deprivation is defined as a reduction or restriction of essential capabilities.

The Alkire-Foster (AF) method operationalizes Sen's framework through a dual-cutoff counting approach.

### 2.1 Raw Achievement Matrix & Deprivation Cutoffs

Let $n$ be the number of individuals/households in the sample population, and $d$ be the number of indicators across all capability dimensions.

- **Achievement Matrix**: $Y \in \mathbb{R}^{n \times d}$, where $y_{i,j} \ge 0$ represents the achievement of individual $i \in \{1, \dots, n\}$ in indicator $j \in \{1, \dots, d\}$.
- **Deprivation Cutoff Vector**: $z = (z_1, z_2, \dots, z_d)$, where $z_j > 0$ defines the minimum acceptable achievement threshold for indicator $j$.

### 2.2 Uncensored Deprivation Matrix ($G^0$)

For each individual $i$ and indicator $j$, the deprivation indicator $g_{i,j}^0$ is defined as:
$$g_{i,j}^0 = \begin{cases} 1 & \text{if } y_{i,j} < z_j \quad (\text{individual } i \text{ is deprived in indicator } j) \\ 0 & \text{if } y_{i,j} \ge z_j \quad (\text{individual } i \text{ is non-deprived}) \end{cases}$$

This forms the binary Uncensored Deprivation Matrix $G^0 \in \{0, 1\}^{n \times d}$.

### 2.3 Indicator Weights Vector ($w$)

Each indicator $j$ is assigned a weight $w_j > 0$ representing its relative normative importance in the overall capability measure.
- **Normalization Axiom**: The weights sum to 1:
  $$\sum_{j=1}^d w_j = 1.0$$
- **Nested Equal Weighting**: When there are $D$ dimensions and dimension $D_k$ contains $d_k$ indicators, nested equal weighting assigns weight $\frac{1}{D}$ to each dimension, yielding:
  $$w_j = \frac{1}{D \times d_k} \quad \text{for } j \in D_k$$

### 2.4 Individual Deprivation Score Vector ($c$)

For each individual $i$, the weighted deprivation score $c_i$ is the weighted sum of their deprivations:
$$c_i = \sum_{j=1}^d w_j g_{i,j}^0$$

Since $\sum_{j=1}^d w_j = 1.0$ and $g_{i,j}^0 \in \{0, 1\}$, the score $c_i$ satisfies $0 \le c_i \le 1.0$.

### 2.5 Poverty Cutoff ($k$) & Identification Function

A poverty cutoff threshold $k \in (0, 1]$ (typically $k = 0.3333$ or $1/3$, meaning an individual must suffer at least 33.3% weighted deprivations) identifies multidimensionally poor individuals:
$$\rho_k(y_i, z) = \begin{cases} 1 & \text{if } c_i \ge k \quad (\text{individual } i \text{ is multidimensionally poor}) \\ 0 & \text{if } c_i < k \quad (\text{individual } i \text{ is non-poor}) \end{cases}$$

### 2.6 Censored Deprivation Score Vector ($c(k)$) & Censored Matrix ($G^0(k)$)

To satisfy the **Poverty Focus Axiom** (changes in achievements of non-poor individuals should not affect measured poverty), non-poor deprivation scores are censored to zero:
$$c_i(k) = \begin{cases} c_i & \text{if } c_i \ge k \\ 0 & \text{if } c_i < k \end{cases}$$

Similarly, the Censored Deprivation Matrix $G^0(k) \in \{0, 1\}^{n \times d}$ censors rows of non-poor individuals:
$$g_{i,j}^0(k) = \begin{cases} g_{i,j}^0 & \text{if } c_i \ge k \\ 0 & \text{if } c_i < k \end{cases}$$

### 2.7 Multidimensional Headcount Ratio ($H$)

The headcount ratio $H$ measures the incidence of multidimensional poverty (proportion of population identified as poor):
$$H = \frac{q}{n} = \frac{1}{n} \sum_{i=1}^n \mathbb{I}(c_i \ge k)$$
where $q = \sum_{i=1}^n \mathbb{I}(c_i \ge k)$ is the total count of multidimensionally poor individuals.

### 2.8 Intensity of Poverty ($A$)

The intensity of poverty $A$ measures the average proportion of weighted deprivations experienced among the poor:
$$A = \frac{\sum_{i=1}^n c_i(k)}{q \sum_{j=1}^d w_j} = \frac{\sum_{i=1}^n c_i(k)}{q} = \frac{\sum_{i: c_i \ge k} c_i}{q}$$

Since $\sum_{j=1}^d w_j = 1.0$, $A$ represents the average deprivation score of poor individuals. If $q = 0$, $A$ is conventionally defined as $0.0$.

### 2.9 Multidimensional Poverty Index ($MPI$ / $M_0$)

The Multidimensional Poverty Index ($MPI$), also known as the Adjusted Headcount Ratio ($M_0$), combines both incidence ($H$) and intensity ($A$):
$$MPI = H \times A = \left(\frac{q}{n}\right) \times \left(\frac{\sum_{i: c_i \ge k} c_i}{q}\right) = \frac{1}{n} \sum_{i=1}^n c_i(k)$$

Alternatively expressed in matrix notation:
$$MPI = \frac{1}{n} \sum_{i=1}^n \sum_{j=1}^d w_j g_{i,j}^0(k)$$

### 2.10 Indicator & Dimensional Contribution Breakdown ($C_j$)

The AF methodology allows exact additive decomposition by indicator and dimension.

- **Uncensored Headcount Ratio ($h_j$)**: Proportion of total population deprived in indicator $j$:
  $$h_j = \frac{1}{n} \sum_{i=1}^n g_{i,j}^0$$
- **Censored Headcount Ratio ($h_j(k)$)**: Proportion of total population that is both multidimensionally poor AND deprived in indicator $j$:
  $$h_j(k) = \frac{1}{n} \sum_{i=1}^n g_{i,j}^0(k)$$
- **Absolute Contribution of Indicator $j$ ($MPI_j$)**:
  $$MPI_j = w_j h_j(k) = \frac{w_j \sum_{i=1}^n g_{i,j}^0(k)}{n}$$
  Note that $\sum_{j=1}^d MPI_j = MPI$.
- **Relative Percentage Contribution of Indicator $j$ ($C_j$)**:
  $$C_j = \frac{MPI_j}{MPI} = \frac{w_j \sum_{i=1}^n g_{i,j}^0(k)}{n \times MPI} = \frac{w_j \sum_{i=1}^n g_{i,j}^0(k)}{\sum_{i=1}^n c_i(k)}$$
  **Invariant**: $\sum_{j=1}^d C_j = 1.0$ (or 100%).

### 2.11 Subgroup Decomposability

For $G$ mutually exclusive and exhaustive population subgroups (e.g., districts in Balochistan such as Quetta, Pishin, Mastung, Zhob):
$$MPI_{\text{overall}} = \sum_{g=1}^G \frac{n_g}{n} MPI_g$$
where $n_g$ is the sample size of subgroup $g$, and $MPI_g$ is the MPI evaluated within subgroup $g$.

The relative contribution of subgroup $g$ to total MPI is:
$$S_g = \frac{n_g}{n} \times \frac{MPI_g}{MPI_{\text{overall}}}$$

---

## 3. IFRAP Component 3 Capability Indicator Taxonomy

For the Applied Anthropology Portfolio & M&E Telemetry Dashboard, the MPI engine must support 6 key capability domains tailored to IFRAP Component 3 (Indus/Balochistan Water and Agriculture Development):

| Dimension ID | Dimension Name | Weight ($W_D$) | Indicator ID | Indicator Name | Deprivation Threshold ($z_j$) | Weight ($w_j$) |
|--------------|----------------|----------------|--------------|----------------|-------------------------------|----------------|
| `health` | Health & Nutrition | $1/6 \approx 0.1667$ | `child_nutrition` | Child Nutrition & Growth | $< 0.80$ index score | $1/12 \approx 0.0833$ |
| | | | `drinking_water` | Safe Drinking Water Access | $< 1.0$ (0 = no access) | $1/12 \approx 0.0833$ |
| `education` | Education & Knowledge | $1/6 \approx 0.1667$ | `literacy` | Adult Schooling Years | $< 6.0$ years | $1/12 \approx 0.0833$ |
| | | | `itk_karez` | ITK Karez Maintenance Knowledge | $< 1.0$ (0 = unmaintained) | $1/12 \approx 0.0833$ |
| `living` | Living Standards | $1/6 \approx 0.1667$ | `electricity` | Renewable / Grid Energy Access | $< 1.0$ (0 = no power) | $1/18 \approx 0.0556$ |
| | | | `sanitation` | Improved Sanitation Facility | $< 1.0$ (0 = unimproved) | $1/18 \approx 0.0556$ |
| | | | `housing` | Flood-Resilient Housing | $< 1.0$ (0 = vulnerable) | $1/18 \approx 0.0556$ |
| `asset_income` | Asset & Income Capabilities | $1/6 \approx 0.1667$ | `land_usufruct` | Agricultural Land Usufruct Rights | $< 2.0$ hectares | $1/12 \approx 0.0833$ |
| | | | `livestock` | Livestock & Farming Assets | $< 1.0$ index score | $1/12 \approx 0.0833$ |
| `governance` | Customary Governance | $1/6 \approx 0.1667$ | `water_council` | Mirab Water Council Participation | $< 1.0$ (0 = excluded) | $1/12 \approx 0.0833$ |
| | | | `legal_shield` | Customary Legal Dispute Shield | $< 1.0$ (0 = unprotected)| $1/12 \approx 0.0833$ |
| `infrastructure` | Climate Resilience | $1/6 \approx 0.1667$ | `channel_integrity` | Karez Channel Structural Integrity| $< 0.70$ stability index | $1/12 \approx 0.0833$ |
| | | | `drought_prep` | Drought Storage Efficiency | $< 0.65$ efficiency index | $1/12 \approx 0.0833$ |

---

## 4. TypeScript Architecture & Code Specification for `lib/mpi.ts`

Below is the complete TypeScript architectural design for `lib/mpi.ts`.

```typescript
/**
 * Senian Multidimensional Poverty Index (MPI) Logic Engine
 * Module: lib/mpi.ts
 * Operationalized via Alkire-Foster (AF) Method for IFRAP Component 3 Telemetry
 */

export interface IndicatorConfig {
  id: string;
  name: string;
  dimensionId: string;
  cutoff: number; // Threshold z_j below which individual is deprived
  isDeprivedIfLessThan: boolean; // True if y_ij < z_j implies deprivation
  weight: number; // Normalized weight w_j
}

export interface DimensionConfig {
  id: string;
  name: string;
  description: string;
  weight: number; // Dimensional weight W_D
  indicatorIds: string[];
}

export interface IndividualRecord {
  id: string;
  subgroupId?: string; // e.g. District name ('Quetta', 'Pishin', 'Mastung')
  achievements: Record<string, number>; // Maps indicatorId -> numerical achievement value y_ij
}

export interface DeprivationMatrix {
  individualIds: string[];
  indicatorIds: string[];
  matrix: number[][]; // Raw g_ij^0 binary values (n x d)
  scores: number[]; // Uncensored deprivation score vector c_i
  censoredScores: number[]; // Censored deprivation score vector c_i(k)
  isPoor: boolean[]; // Poverty identification indicator bool array
}

export interface MPIConfig {
  povertyCutoff: number; // Poverty cutoff k (default 0.3333 = 1/3)
  dimensions: DimensionConfig[];
  indicators: IndicatorConfig[];
}

export interface IndicatorContribution {
  indicatorId: string;
  indicatorName: string;
  dimensionId: string;
  uncensoredHeadcount: number; // h_j
  censoredHeadcount: number; // h_j(k)
  absoluteContribution: number; // MPI_j = w_j * h_j(k)
  relativeContribution: number; // C_j = MPI_j / MPI
}

export interface DimensionContribution {
  dimensionId: string;
  dimensionName: string;
  absoluteContribution: number;
  relativeContribution: number;
}

export interface SubgroupMPIResult {
  subgroupId: string;
  populationSize: number;
  populationShare: number; // n_g / n
  headcountRatio: number; // H_g
  intensity: number; // A_g
  mpi: number; // MPI_g
  relativeContribution: number; // S_g
}

export interface MPIResults {
  populationSize: number; // n
  poorCount: number; // q
  headcountRatio: number; // H = q / n
  intensity: number; // A = sum(c_i(k)) / q
  mpi: number; // MPI = H * A = (1/n) * sum(c_i(k))
  capabilityFreedomScore: number; // 1 - MPI (Senian aggregate capability score)
  deprivationMatrix: DeprivationMatrix;
  indicatorContributions: IndicatorContribution[];
  dimensionContributions: DimensionContribution[];
  config: MPIConfig;
}

export interface SubgroupDecomposition {
  overallResults: MPIResults;
  subgroups: Record<string, SubgroupMPIResult>;
  isAdditivelyConsistent: boolean;
}

export interface TelemetryProgressBinding {
  overallMPI: number;
  overallCapabilityScore: number; // Percentage formatted string or 0-100
  headcountPercent: string;
  intensityPercent: string;
  dimensionProgressBars: Array<{
    dimensionId: string;
    dimensionName: string;
    deprivationPercentage: number;
    capabilityPercentage: number;
    color: string;
  }>;
}

/**
 * Returns default IFRAP Component 3 MPI configuration with 6 dimensions and 13 indicators.
 */
export function createDefaultMPIConfig(): MPIConfig {
  const dimensions: DimensionConfig[] = [
    { id: 'health', name: 'Health & Nutrition', description: 'Child nutrition & safe water access', weight: 1/6, indicatorIds: ['child_nutrition', 'drinking_water'] },
    { id: 'education', name: 'Education & ITK', description: 'Schooling and Karez maintenance knowledge', weight: 1/6, indicatorIds: ['literacy', 'itk_karez'] },
    { id: 'living', name: 'Living Standards', description: 'Energy, sanitation, and housing resilience', weight: 1/6, indicatorIds: ['electricity', 'sanitation', 'housing'] },
    { id: 'asset_income', name: 'Asset & Usufruct Capabilities', description: 'Land usufruct rights and farming assets', weight: 1/6, indicatorIds: ['land_usufruct', 'livestock'] },
    { id: 'governance', name: 'Customary Governance', description: 'Mirab council participation and legal protection', weight: 1/6, indicatorIds: ['water_council', 'legal_shield'] },
    { id: 'infrastructure', name: 'Climate Resilience', description: 'Karez channel integrity and drought storage', weight: 1/6, indicatorIds: ['channel_integrity', 'drought_prep'] }
  ];

  const indicators: IndicatorConfig[] = [
    { id: 'child_nutrition', name: 'Child Nutrition Index', dimensionId: 'health', cutoff: 0.8, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'drinking_water', name: 'Safe Water Access', dimensionId: 'health', cutoff: 1.0, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'literacy', name: 'Adult Literacy Years', dimensionId: 'education', cutoff: 6.0, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'itk_karez', name: 'ITK Karez Skill', dimensionId: 'education', cutoff: 1.0, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'electricity', name: 'Power Access', dimensionId: 'living', cutoff: 1.0, isDeprivedIfLessThan: true, weight: 1/18 },
    { id: 'sanitation', name: 'Sanitation Access', dimensionId: 'living', cutoff: 1.0, isDeprivedIfLessThan: true, weight: 1/18 },
    { id: 'housing', name: 'Resilient Housing', dimensionId: 'living', cutoff: 1.0, isDeprivedIfLessThan: true, weight: 1/18 },
    { id: 'land_usufruct', name: 'Usufruct Land Area', dimensionId: 'asset_income', cutoff: 2.0, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'livestock', name: 'Livestock Capital', dimensionId: 'asset_income', cutoff: 1.0, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'water_council', name: 'Mirab Participation', dimensionId: 'governance', cutoff: 1.0, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'legal_shield', name: 'Customary Protection', dimensionId: 'governance', cutoff: 1.0, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'channel_integrity', name: 'Channel Integrity Index', dimensionId: 'infrastructure', cutoff: 0.7, isDeprivedIfLessThan: true, weight: 1/12 },
    { id: 'drought_prep', name: 'Drought Preparedness', dimensionId: 'infrastructure', cutoff: 0.65, isDeprivedIfLessThan: true, weight: 1/12 }
  ];

  return {
    povertyCutoff: 1/3, // k = 0.3333
    dimensions,
    indicators
  };
}

/**
 * Computes uncensored deprivation status for a single individual across configured indicators.
 */
export function calculateIndividualDeprivation(
  record: IndividualRecord,
  config: MPIConfig
): number[] {
  return config.indicators.map((ind) => {
    const val = record.achievements[ind.id] ?? 0;
    if (ind.isDeprivedIfLessThan) {
      return val < ind.cutoff ? 1 : 0;
    } else {
      return val > ind.cutoff ? 1 : 0;
    }
  });
}

/**
 * Builds the full Deprivation Matrix and calculates individual score vectors.
 */
export function buildDeprivationMatrix(
  records: IndividualRecord[],
  config: MPIConfig
): DeprivationMatrix {
  const n = records.length;
  const d = config.indicators.length;
  const k = config.povertyCutoff;

  const matrix: number[][] = [];
  const scores: number[] = [];
  const censoredScores: number[] = [];
  const isPoor: boolean[] = [];

  for (let i = 0; i < n; i++) {
    const row = calculateIndividualDeprivation(records[i], config);
    matrix.push(row);

    // Compute c_i = sum(w_j * g_ij^0)
    let ci = 0;
    for (let j = 0; j < d; j++) {
      ci += config.indicators[j].weight * row[j];
    }
    scores.push(ci);

    const poor = ci >= k;
    isPoor.push(poor);
    censoredScores.push(poor ? ci : 0);
  }

  return {
    individualIds: records.map((r) => r.id),
    indicatorIds: config.indicators.map((ind) => ind.id),
    matrix,
    scores,
    censoredScores,
    isPoor
  };
}

/**
 * Computes full Senian / Alkire-Foster MPI results for a population.
 */
export function calculateMPI(
  records: IndividualRecord[],
  configOverrides?: Partial<MPIConfig>
): MPIResults {
  const defaultConfig = createDefaultMPIConfig();
  const config: MPIConfig = {
    ...defaultConfig,
    ...configOverrides,
    dimensions: configOverrides?.dimensions ?? defaultConfig.dimensions,
    indicators: configOverrides?.indicators ?? defaultConfig.indicators
  };

  const n = records.length;
  if (n === 0) {
    return {
      populationSize: 0,
      poorCount: 0,
      headcountRatio: 0,
      intensity: 0,
      mpi: 0,
      capabilityFreedomScore: 1.0,
      deprivationMatrix: { individualIds: [], indicatorIds: [], matrix: [], scores: [], censoredScores: [], isPoor: [] },
      indicatorContributions: [],
      dimensionContributions: [],
      config
    };
  }

  const depMatrix = buildDeprivationMatrix(records, config);
  const q = depMatrix.isPoor.filter(Boolean).length;
  const headcountRatio = q / n;

  const sumCensoredScores = depMatrix.censoredScores.reduce((sum, val) => sum + val, 0);
  const intensity = q > 0 ? sumCensoredScores / q : 0;
  const mpi = sumCensoredScores / n; // MPI = H * A
  const capabilityFreedomScore = 1 - mpi;

  // Indicator contribution calculation
  const indicatorContributions: IndicatorContribution[] = config.indicators.map((ind, j) => {
    let uncensoredDeprivedCount = 0;
    let censoredDeprivedCount = 0;

    for (let i = 0; i < n; i++) {
      if (depMatrix.matrix[i][j] === 1) {
        uncensoredDeprivedCount++;
        if (depMatrix.isPoor[i]) {
          censoredDeprivedCount++;
        }
      }
    }

    const uncensoredHeadcount = uncensoredDeprivedCount / n;
    const censoredHeadcount = censoredDeprivedCount / n;
    const absoluteContribution = ind.weight * censoredHeadcount;
    const relativeContribution = mpi > 0 ? absoluteContribution / mpi : 0;

    return {
      indicatorId: ind.id,
      indicatorName: ind.name,
      dimensionId: ind.dimensionId,
      uncensoredHeadcount,
      censoredHeadcount,
      absoluteContribution,
      relativeContribution
    };
  });

  // Dimension contribution rollup
  const dimensionContributions: DimensionContribution[] = config.dimensions.map((dim) => {
    const dimIndicators = indicatorContributions.filter((ic) => ic.dimensionId === dim.id);
    const absoluteContribution = dimIndicators.reduce((sum, ic) => sum + ic.absoluteContribution, 0);
    const relativeContribution = mpi > 0 ? absoluteContribution / mpi : 0;

    return {
      dimensionId: dim.id,
      dimensionName: dim.name,
      absoluteContribution,
      relativeContribution
    };
  });

  return {
    populationSize: n,
    poorCount: q,
    headcountRatio,
    intensity,
    mpi,
    capabilityFreedomScore,
    deprivationMatrix: depMatrix,
    indicatorContributions,
    dimensionContributions,
    config
  };
}

/**
 * Computes subgroup decomposition across multiple regions or districts.
 */
export function calculateSubgroupDecomposition(
  groupRecordsMap: Record<string, IndividualRecord[]>,
  configOverrides?: Partial<MPIConfig>
): SubgroupDecomposition {
  const allRecords: IndividualRecord[] = [];
  Object.values(groupRecordsMap).forEach((groupRecords) => {
    allRecords.push(...groupRecords);
  });

  const overallResults = calculateMPI(allRecords, configOverrides);
  const n = overallResults.populationSize;

  const subgroups: Record<string, SubgroupMPIResult> = {};
  let weightedSumMPI = 0;

  Object.entries(groupRecordsMap).forEach(([groupId, groupRecords]) => {
    const ng = groupRecords.length;
    const groupResult = calculateMPI(groupRecords, configOverrides);
    const populationShare = n > 0 ? ng / n : 0;
    const relativeContribution = overallResults.mpi > 0 ? (populationShare * groupResult.mpi) / overallResults.mpi : 0;

    weightedSumMPI += populationShare * groupResult.mpi;

    subgroups[groupId] = {
      subgroupId: groupId,
      populationSize: ng,
      populationShare,
      headcountRatio: groupResult.headcountRatio,
      intensity: groupResult.intensity,
      mpi: groupResult.mpi,
      relativeContribution
    };
  });

  const isAdditivelyConsistent = Math.abs(weightedSumMPI - overallResults.mpi) < 1e-6;

  return {
    overallResults,
    subgroups,
    isAdditivelyConsistent
  };
}

/**
 * Real-time dynamic recalculation with state overrides (e.g. changing cutoff k or custom weights).
 */
export function reevaluateRealtimeMPI(
  records: IndividualRecord[],
  updatedWeightsOrThresholds: Partial<MPIConfig>
): MPIResults {
  return calculateMPI(records, updatedWeightsOrThresholds);
}

/**
 * Binds MPI output to UI progress bar contracts for IFRAP Component 3 Telemetry.
 */
export function bindIFRAPComponent3Data(results: MPIResults): TelemetryProgressBinding {
  const headcountPercent = `${(results.headcountRatio * 100).toFixed(1)}%`;
  const intensityPercent = `${(results.intensity * 100).toFixed(1)}%`;

  const colorPalette: Record<string, string> = {
    health: 'bg-red-500',
    education: 'bg-blue-500',
    living: 'bg-amber-500',
    asset_income: 'bg-emerald-500',
    governance: 'bg-purple-500',
    infrastructure: 'bg-cyan-500'
  };

  const dimensionProgressBars = results.dimensionContributions.map((dc) => {
    const depPercent = Number((dc.relativeContribution * 100).toFixed(1));
    return {
      dimensionId: dc.dimensionId,
      dimensionName: dc.dimensionName,
      deprivationPercentage: depPercent,
      capabilityPercentage: Number((100 - depPercent).toFixed(1)),
      color: colorPalette[dc.dimensionId] || 'bg-indigo-500'
    };
  });

  return {
    overallMPI: Number(results.mpi.toFixed(4)),
    overallCapabilityScore: Number((results.capabilityFreedomScore * 100).toFixed(1)),
    headcountPercent,
    intensityPercent,
    dimensionProgressBars
  };
}
```

---

## 5. Unit Testing Specification & Edge Case Coverage

To ensure 100% test pass rate across native Node test runners (`tests/run-tests.js`), the unit tests for `lib/mpi.ts` must validate the following 7 test scenarios:

### Scenario 1: Zero Deprivation Baseline ($H=0, A=0, MPI=0$)
- **Input**: 5 individual records, all achievements strictly above cutoff ($y_{i,j} \ge z_j$).
- **Expected Outcome**:
  - $q = 0$, $H = 0.0$, $A = 0.0$, $MPI = 0.0$.
  - Capability freedom score = $1.0$ (100%).
  - All indicator relative contributions $C_j = 0.0$.

### Scenario 2: Universal Maximum Deprivation ($H=1.0, A=1.0, MPI=1.0$)
- **Input**: 5 individual records, all achievements set to $0$ ($y_{i,j} < z_j$).
- **Expected Outcome**:
  - $q = 5$, $H = 1.0$, $A = 1.0$, $MPI = 1.0$.
  - Capability freedom score = $0.0$.
  - Each indicator $j$ relative contribution $C_j = w_j$. Sum of $C_j = 1.0$.

### Scenario 3: Poverty Cutoff Boundary Threshold ($k = 0.3333$)
- **Input**:
  - Person A has weighted deprivation score $c_A = 0.3300$ ($c_A < k$).
  - Person B has weighted deprivation score $c_B = 0.3334$ ($c_B \ge k$).
- **Expected Outcome**:
  - Person A: identified as poor = `false`, censored score $c_A(k) = 0$.
  - Person B: identified as poor = `true`, censored score $c_B(k) = 0.3334$.
  - Person A's deprivations do not contribute to $H$, $A$, or $MPI$ (Poverty Focus Axiom verified).

### Scenario 4: Unequal Weighting & Weight Normalization Invariant
- **Input**: Custom weights assigned to dimensions (e.g. Health 0.40, Living 0.60).
- **Expected Outcome**:
  - Engine validates $\sum w_j = 1.0$.
  - Deprivation score vector $c_i$ respects exact custom weights.

### Scenario 5: Edge Case Protection & Empty Dataset Handling
- **Input**: `records = []` ($n = 0$).
- **Expected Outcome**:
  - Returns structured `MPIResults` object without divide-by-zero or NaN exceptions.
  - $n=0, q=0, H=0, A=0, MPI=0$.

### Scenario 6: Subgroup Additive Consistency Verification
- **Input**: Subgroups 'Quetta' ($n_1=10, MPI_1=0.25$) and 'Pishin' ($n_2=10, MPI_2=0.45$).
- **Expected Outcome**:
  - Total population $n = 20$.
  - Overall $MPI_{\text{total}} = \frac{10}{20}(0.25) + \frac{10}{20}(0.45) = 0.35$.
  - `isAdditivelyConsistent` returns `true`.

### Scenario 7: Real-time Re-evaluation & IFRAP Telemetry UI Binding
- **Input**: Telemetry progress binding call `bindIFRAPComponent3Data(results)`.
- **Expected Outcome**:
  - Generates progress bar contracts with percentage values and Tailwind glassmorphism color bindings (`bg-red-500`, `bg-cyan-500`, etc.).

---

## 6. Recommendations for Implementer

1. Write `lib/mpi.ts` following the TypeScript implementation spec in Section 4.
2. Verify imports and compatibility with `app/telemetry/page.tsx` and `components/TelemetryDashboard.tsx`.
3. Add unit test suite to `tests/e2e/tier3_telemetry.test.js` or a dedicated test file to guarantee 100% compliance.
