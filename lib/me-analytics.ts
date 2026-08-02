/**
 * Monitoring & Evaluation (M&E) Analytics Data & Utility Module
 * Balochistan IFRAP Component 3 Telemetry Engine
 */

export interface DisplacedDistrictBreakdown {
  districtId: string;
  districtName: string;
  displacedCount: number;
  assistedCount: number;
  completionPercentage: number;
}

export interface DisplacedHouseholdsWidgetData {
  totalDisplacedHouseholds: number;
  assistedHouseholdsCount: number;
  pendingAssistanceCount: number;
  transitionalHousingAllocated: number;
  vulnerableHouseholdsCount: number;
  assistanceTypeBreakdown: {
    resettlementGrant: number;
    livelihoodRestoration: number;
    temporaryShelter: number;
  };
  districtBreakdown: DisplacedDistrictBreakdown[];
}

export interface MonthlyBurnCurvePoint {
  month: string;
  quarter?: string;
  targetDisbursementPKR: number;
  actualDisbursementPKR: number;
}

export interface CompensationBudgetBurnData {
  totalAllocatedBudgetPKR: number;
  disbursedAmountPKR: number;
  encumberedBudgetPKR: number;
  remainingBudgetPKR: number;
  burnRatePercentage: number;
  monthlyBurnCurve: MonthlyBurnCurvePoint[];
  categoryBreakdown: {
    landAcquisitionPKR: number;
    cropLossCompensationPKR: number;
    customaryWaterRightsCompensationPKR: number;
    livelihoodRestorationPKR: number;
  };
}

export interface GRMCategoryItem {
  category: 'Usufruct_Dispute' | 'Water_Allocation' | 'Compensation_Delay' | 'Environmental_Damage' | string;
  total: number;
  resolved: number;
  pending: number;
}

export interface GRMTicketItem {
  ticketId: string;
  district: string;
  category: string;
  status: 'Pending' | 'In_Review' | 'Resolved';
  submittedAt: string;
  resolvedAt?: string;
}

export interface GRMSLABreakdown {
  withinSLA: number;
  escalated: number;
  breachedSLA: number;
  slaComplianceRatePercentage: number;
}

export interface GRMTicketAnalyticsData {
  totalTicketsCount: number;
  pendingTicketsCount: number;
  inReviewTicketsCount: number;
  resolvedTicketsCount: number;
  resolutionRatePercentage: number;
  avgResolutionDays: number;
  slaBreakdown: GRMSLABreakdown;
  categoryBreakdown: GRMCategoryItem[];
  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentTickets: GRMTicketItem[];
}

export interface MEAnalyticsData {
  displacedHouseholds: DisplacedHouseholdsWidgetData;
  compensationBudget: CompensationBudgetBurnData;
  grmTickets: GRMTicketAnalyticsData;
  lastUpdated: string;
}

export const MOCK_DISPLACED_HOUSEHOLDS: DisplacedHouseholdsWidgetData = {
  totalDisplacedHouseholds: 1250,
  assistedHouseholdsCount: 940,
  pendingAssistanceCount: 310,
  transitionalHousingAllocated: 480,
  vulnerableHouseholdsCount: 320,
  assistanceTypeBreakdown: {
    resettlementGrant: 420,
    livelihoodRestoration: 310,
    temporaryShelter: 210,
  },
  districtBreakdown: [
    { districtId: 'quetta', districtName: 'Quetta', displacedCount: 300, assistedCount: 250, completionPercentage: 83.3 },
    { districtId: 'pishin', districtName: 'Pishin', displacedCount: 280, assistedCount: 210, completionPercentage: 75.0 },
    { districtId: 'mastung', districtName: 'Mastung', displacedCount: 240, assistedCount: 180, completionPercentage: 75.0 },
    { districtId: 'kalat', districtName: 'Kalat', displacedCount: 200, assistedCount: 140, completionPercentage: 70.0 },
    { districtId: 'zhob', districtName: 'Zhob', displacedCount: 130, assistedCount: 90, completionPercentage: 69.2 },
    { districtId: 'ziarat', districtName: 'Ziarat', displacedCount: 100, assistedCount: 70, completionPercentage: 70.0 },
  ],
};

export const MOCK_COMPENSATION_BUDGET: CompensationBudgetBurnData = {
  totalAllocatedBudgetPKR: 500000000, // 500M PKR
  disbursedAmountPKR: 365000000,      // 365M PKR
  encumberedBudgetPKR: 85000000,       // 85M PKR
  remainingBudgetPKR: 50000000,        // 50M PKR
  burnRatePercentage: 73.0,
  monthlyBurnCurve: [
    { month: 'Jan', targetDisbursementPKR: 30000000, actualDisbursementPKR: 28000000 },
    { month: 'Feb', targetDisbursementPKR: 60000000, actualDisbursementPKR: 58000000 },
    { month: 'Mar', targetDisbursementPKR: 100000000, actualDisbursementPKR: 95000000 },
    { month: 'Apr', targetDisbursementPKR: 150000000, actualDisbursementPKR: 142000000 },
    { month: 'May', targetDisbursementPKR: 220000000, actualDisbursementPKR: 210000000 },
    { month: 'Jun', targetDisbursementPKR: 300000000, actualDisbursementPKR: 290000000 },
    { month: 'Jul', targetDisbursementPKR: 400000000, actualDisbursementPKR: 365000000 },
  ],
  categoryBreakdown: {
    landAcquisitionPKR: 180000000,
    cropLossCompensationPKR: 95000000,
    customaryWaterRightsCompensationPKR: 55000000,
    livelihoodRestorationPKR: 35000000,
  },
};

export const MOCK_GRM_TICKETS: GRMTicketAnalyticsData = {
  totalTicketsCount: 184,
  pendingTicketsCount: 26,
  inReviewTicketsCount: 12,
  resolvedTicketsCount: 146,
  resolutionRatePercentage: 79.35,
  avgResolutionDays: 4.2,
  slaBreakdown: {
    withinSLA: 138,
    escalated: 6,
    breachedSLA: 2,
    slaComplianceRatePercentage: 75.0,
  },
  categoryBreakdown: [
    { category: 'Usufruct_Dispute', total: 62, resolved: 50, pending: 12 },
    { category: 'Water_Allocation', total: 54, resolved: 45, pending: 9 },
    { category: 'Compensation_Delay', total: 40, resolved: 32, pending: 8 },
    { category: 'Environmental_Damage', total: 28, resolved: 19, pending: 9 },
  ],
  severityBreakdown: {
    low: 68,
    medium: 72,
    high: 32,
    critical: 12,
  },
  recentTickets: [
    { ticketId: 'GRM-2026-089', district: 'Quetta', category: 'Usufruct Dispute', status: 'Resolved', submittedAt: '2026-07-28', resolvedAt: '2026-07-30' },
    { ticketId: 'GRM-2026-090', district: 'Pishin', category: 'Water Allocation', status: 'In_Review', submittedAt: '2026-07-29' },
    { ticketId: 'GRM-2026-091', district: 'Mastung', category: 'Compensation Delay', status: 'Pending', submittedAt: '2026-07-30' },
    { ticketId: 'GRM-2026-092', district: 'Kalat', category: 'Environmental Damage', status: 'Resolved', submittedAt: '2026-07-25', resolvedAt: '2026-07-27' },
    { ticketId: 'GRM-2026-093', district: 'Zhob', category: 'Usufruct Dispute', status: 'Pending', submittedAt: '2026-07-30' },
  ],
};

export const MOCK_ME_ANALYTICS: MEAnalyticsData = {
  displacedHouseholds: MOCK_DISPLACED_HOUSEHOLDS,
  compensationBudget: MOCK_COMPENSATION_BUDGET,
  grmTickets: MOCK_GRM_TICKETS,
  lastUpdated: new Date().toISOString(),
};

/**
 * Robust async data fetcher with offline fallback
 */
export async function fetchMEAnalyticsData(): Promise<{
  data: MEAnalyticsData;
  isOffline: boolean;
}> {
  try {
    if (typeof window === 'undefined') {
      return { data: MOCK_ME_ANALYTICS, isOffline: true };
    }

    const response = await fetch('/api/export?type=me_analytics', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const result = await response.json();
    if (result && result.displacedHouseholds) {
      return {
        data: {
          ...result,
          lastUpdated: new Date().toISOString(),
        },
        isOffline: false,
      };
    }

    return { data: MOCK_ME_ANALYTICS, isOffline: true };
  } catch (err) {
    console.warn('[M&E Analytics] Fetch error, using offline mock fallback:', err);
    return { data: MOCK_ME_ANALYTICS, isOffline: true };
  }
}
