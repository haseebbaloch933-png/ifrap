/**
 * Server-side GRM ticket type + seed data. Kept separate from the client
 * component so the API and the UI agree on shape without a circular import.
 * The store seeds `grm.json` from GRM_SEED on first access.
 */

export interface GrmTicketRecord {
  id: string;
  district: string;
  category: 'Water Allocation' | 'Infrastructure' | 'Compensation' | 'Social Inclusion' | 'Environmental' | 'Land Tenure';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  submittedAt: string;
  resolvedAt?: string;
  submitterName: string;
  description: string;
  resolutionNotes?: string;
  slaCompliant: boolean;
  hoursRemaining: number;
}

export const GRM_SEED: GrmTicketRecord[] = [
  {
    id: 'GRM-2026-001',
    district: 'Quetta',
    category: 'Water Allocation',
    status: 'RESOLVED',
    priority: 'HIGH',
    submittedAt: '2026-07-28 09:30',
    resolvedAt: '2026-07-29 14:15',
    submitterName: 'Mir Jan Raisani',
    description: 'Dispute over customary water share allocation at Karez XYZ following channel mainlining.',
    resolutionNotes: 'Mirab Council convened; customary 12-hour turn restored.',
    slaCompliant: true,
    hoursRemaining: 0,
  },
  {
    id: 'GRM-2026-002',
    district: 'Mastung',
    category: 'Infrastructure',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    submittedAt: '2026-08-01 11:00',
    submitterName: 'Anonymous Community Member',
    description: 'Rehabilitation work causing temporary water blockage to downstream farmlands.',
    resolutionNotes: 'Field engineer deployed temporary bypass pipe.',
    slaCompliant: true,
    hoursRemaining: 32,
  },
  {
    id: 'GRM-2026-003',
    district: 'Pishin',
    category: 'Compensation',
    status: 'ESCALATED',
    priority: 'URGENT',
    submittedAt: '2026-07-15 14:20',
    submitterName: 'Sardar Gul Tarain',
    description: 'Delayed payment for land usufruct rights temporary easement during flood wall construction.',
    resolutionNotes: 'Escalated to World Bank ESS10 Fiduciary Oversight Lead.',
    slaCompliant: false,
    hoursRemaining: -120,
  },
  {
    id: 'GRM-2026-004',
    district: 'Ziarat',
    category: 'Social Inclusion',
    status: 'OPEN',
    priority: 'MEDIUM',
    submittedAt: '2026-08-02 08:10',
    submitterName: 'Bibi Bakhtawar',
    description: 'Minority clan representation excluded from local Mirab Water User Association council election.',
    resolutionNotes: '',
    slaCompliant: true,
    hoursRemaining: 68,
  },
  {
    id: 'GRM-2026-005',
    district: 'Killa Abdullah',
    category: 'Land Tenure',
    status: 'OPEN',
    priority: 'HIGH',
    submittedAt: '2026-08-01 16:45',
    submitterName: 'Malik Dost Muhammad',
    description: 'Boundary overlapping claim between customary tribal lands and new retentive dam buffer.',
    resolutionNotes: '',
    slaCompliant: true,
    hoursRemaining: 54,
  },
];

const CATEGORIES = ['Water Allocation', 'Infrastructure', 'Compensation', 'Social Inclusion', 'Environmental', 'Land Tenure'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];

/** Coerce arbitrary request input into a valid new ticket (server assigns id/timestamps). */
export function buildNewTicket(input: any, existing: GrmTicketRecord[]): GrmTicketRecord {
  const nextNum = existing.length + 1;
  const category = CATEGORIES.includes(input?.category) ? input.category : 'Water Allocation';
  const priority = PRIORITIES.includes(input?.priority) ? input.priority : 'MEDIUM';
  return {
    id: `GRM-2026-${String(nextNum).padStart(3, '0')}`,
    district: typeof input?.district === 'string' && input.district.trim() ? input.district : 'Unknown',
    category: category as GrmTicketRecord['category'],
    status: 'OPEN',
    priority: priority as GrmTicketRecord['priority'],
    submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    submitterName: typeof input?.submitterName === 'string' && input.submitterName.trim() ? input.submitterName : 'Anonymous Submitter',
    description: String(input?.description ?? '').slice(0, 2000),
    resolutionNotes: '',
    slaCompliant: true,
    hoursRemaining: 72,
  };
}

export function isValidStatus(s: any): s is GrmTicketRecord['status'] {
  return STATUSES.includes(s);
}
