'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { useAnimateIn } from '@/hooks/useAnimateIn';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Activity,
  Info,
  ChevronRight,
  RefreshCw,
  Sliders,
  AlertCircle
} from 'lucide-react';

export interface EssStandard {
  id: string;
  code: string;
  name: string;
  category: 'Environmental' | 'Social' | 'Governance' | 'Stakeholder';
  status: 'COMPLIANT' | 'UNDER_REVIEW' | 'NEEDS_ATTENTION' | 'NON_COMPLIANT';
  riskLevel: 'LOW' | 'MODERATE' | 'SUBSTANTIAL' | 'HIGH';
  complianceScore: number;
  description: string;
  keyMitigation: string;
  lastAudited: string;
  responsibleUnit: string;
}

export interface SafeguardAuditLog {
  id: string;
  timestamp: string;
  essCode: string;
  district: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventDescription: string;
  auditor: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CORRECTIVE_ACTION_REQUIRED';
}

const mockEssStandards: EssStandard[] = [
  {
    id: 'ess-1',
    code: 'ESS1',
    name: 'Assessment and Management of Environmental and Social Risks',
    category: 'Governance',
    status: 'COMPLIANT',
    riskLevel: 'MODERATE',
    complianceScore: 94.5,
    description: 'Overall E&S risk screening and management framework across all Karez rehabilitation sites.',
    keyMitigation: 'Mandatory ESMP screening for every civil works contract in Pishin & Quetta.',
    lastAudited: '2026-07-28',
    responsibleUnit: 'FPMU Environmental Safeguard Cell',
  },
  {
    id: 'ess-2',
    code: 'ESS2',
    name: 'Labor and Working Conditions',
    category: 'Social',
    status: 'COMPLIANT',
    riskLevel: 'LOW',
    complianceScore: 98.0,
    description: 'Ensuring fair wages, local labor recruitment, and PPE protocols for civil engineering teams.',
    keyMitigation: 'Quarterly labor audits and zero child/forced labor enforcement.',
    lastAudited: '2026-07-30',
    responsibleUnit: 'Provincial PIU Labor Compliance Specialist',
  },
  {
    id: 'ess-3',
    code: 'ESS3',
    name: 'Resource Efficiency and Pollution Prevention',
    category: 'Environmental',
    status: 'COMPLIANT',
    riskLevel: 'MODERATE',
    complianceScore: 91.2,
    description: 'Sustainable water abstraction and preventing silt runoff into Karez underground channels.',
    keyMitigation: 'Sedimentation traps installed at 45 Karez headwork intakes.',
    lastAudited: '2026-07-25',
    responsibleUnit: 'Water Resources Technical Directorate',
  },
  {
    id: 'ess-4',
    code: 'ESS4',
    name: 'Community Health and Safety',
    category: 'Social',
    status: 'NEEDS_ATTENTION',
    riskLevel: 'SUBSTANTIAL',
    complianceScore: 82.4,
    description: 'Protecting rural communities near heavy machinery operations and flood retention structures.',
    keyMitigation: 'Speed limiters and perimeter safety fencing required at Mastung site 04.',
    lastAudited: '2026-08-01',
    responsibleUnit: 'Community Safety Field Inspection Unit',
  },
  {
    id: 'ess-5',
    code: 'ESS5',
    name: 'Land Acquisition, Restrictions on Land Use and Involuntary Resettlement',
    category: 'Social',
    status: 'UNDER_REVIEW',
    riskLevel: 'HIGH',
    complianceScore: 86.8,
    description: 'Safeguarding customary usufruct rights and avoiding involuntary land displacement.',
    keyMitigation: 'Usufruct Digital Ledger registration for all customary shareholding families.',
    lastAudited: '2026-07-29',
    responsibleUnit: 'Anthropological Land Tenure Task Force',
  },
  {
    id: 'ess-6',
    code: 'ESS6',
    name: 'Biodiversity Conservation & Living Natural Resources',
    category: 'Environmental',
    status: 'COMPLIANT',
    riskLevel: 'LOW',
    complianceScore: 95.0,
    description: 'Protecting downstream riparian habitats and endemic flora along Nari River Basin.',
    keyMitigation: 'Buffer zones established 500m around critical wetland ecosystems.',
    lastAudited: '2026-07-20',
    responsibleUnit: 'Provincial Ecology & Wildlife Desk',
  },
  {
    id: 'ess-7',
    code: 'ESS7',
    name: 'Indigenous Peoples & Sub-Saharan Historically Underserved Communities',
    category: 'Social',
    status: 'COMPLIANT',
    riskLevel: 'MODERATE',
    complianceScore: 96.5,
    description: 'Incorporating Indigenous Technical Knowledge (ITK) and tribal Mirab water masters.',
    keyMitigation: 'Free, Prior, and Informed Consent (FPIC) documented across 120 tribal councils.',
    lastAudited: '2026-07-31',
    responsibleUnit: 'Decolonial Applied Anthropology Unit',
  },
  {
    id: 'ess-8',
    code: 'ESS8',
    name: 'Cultural Heritage Preservation',
    category: 'Governance',
    status: 'COMPLIANT',
    riskLevel: 'LOW',
    complianceScore: 99.1,
    description: 'Preserving 500+ year old historic Karez stone masonry architecture and chance-find procedures.',
    keyMitigation: 'Cultural Heritage Chance Find protocol active on all excavation sites.',
    lastAudited: '2026-07-27',
    responsibleUnit: 'Heritage Conservation & Archaeology Board',
  },
  {
    id: 'ess-9',
    code: 'ESS9',
    name: 'Financial Intermediaries & Micro-Grant Fiduciary Governance',
    category: 'Governance',
    status: 'COMPLIANT',
    riskLevel: 'LOW',
    complianceScore: 93.8,
    description: 'Monitoring community grant disbursements and Mirab Council transparent bank accounts.',
    keyMitigation: 'Dual-signatory verification and public bulletin board financial posting.',
    lastAudited: '2026-07-26',
    responsibleUnit: 'World Bank Fiduciary Oversight Desk',
  },
  {
    id: 'ess-10',
    code: 'ESS10',
    name: 'Stakeholder Engagement and Information Disclosure',
    category: 'Stakeholder',
    status: 'COMPLIANT',
    riskLevel: 'MODERATE',
    complianceScore: 90.0,
    description: 'Ensuring 72-hour GRM complaint resolution and inclusive public consultation rounds.',
    keyMitigation: '72-hour SLA mandatory escalation workflow integrated with mobile SMS alerts.',
    lastAudited: '2026-08-01',
    responsibleUnit: 'GRM & Stakeholder Outreach Cell',
  },
];

const mockAuditLogs: SafeguardAuditLog[] = [
  {
    id: 'LOG-2026-089',
    timestamp: '2026-08-01 14:32:00',
    essCode: 'ESS5',
    district: 'Mastung',
    severity: 'HIGH',
    eventDescription: 'Usufruct boundary dispute reported during Karez channel expansion near Pringabad.',
    auditor: 'Dr. Shahzaman Baloch',
    status: 'INVESTIGATING',
  },
  {
    id: 'LOG-2026-088',
    timestamp: '2026-08-01 11:15:20',
    essCode: 'ESS4',
    district: 'Pishin',
    severity: 'MEDIUM',
    eventDescription: 'Fencing missing around retention pond excavation site near Yaro village.',
    auditor: 'Engr. Tariq Kakar',
    status: 'CORRECTIVE_ACTION_REQUIRED',
  },
  {
    id: 'LOG-2026-087',
    timestamp: '2026-07-31 16:45:00',
    essCode: 'ESS7',
    district: 'Ziarat',
    severity: 'LOW',
    eventDescription: 'Mirab Council FPIC documentation verified for Kawas Karez rehabilitation.',
    auditor: 'Fatima Mengal (Anthropologist)',
    status: 'RESOLVED',
  },
  {
    id: 'LOG-2026-086',
    timestamp: '2026-07-30 09:20:10',
    essCode: 'ESS2',
    district: 'Quetta',
    severity: 'LOW',
    eventDescription: 'Routine PPE and labor welfare inspection completed at Kuchlak site.',
    auditor: 'Naimatullah Khan',
    status: 'RESOLVED',
  },
  {
    id: 'LOG-2026-085',
    timestamp: '2026-07-29 15:10:45',
    essCode: 'ESS10',
    district: 'Killa Abdullah',
    severity: 'MEDIUM',
    eventDescription: 'GRM complaint escalated due to 48-hour delay in water channel clearing response.',
    auditor: 'Saba Raisani',
    status: 'OPEN',
  },
];

export function EsfTelemetryPortal() {
  const animated = useAnimateIn(100);
  const [standards, setStandards] = useState<EssStandard[]>(mockEssStandards);
  const [auditLogs, setAuditLogs] = useState<SafeguardAuditLog[]>(mockAuditLogs);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<EssStandard | null>(null);

  // Derived metrics
  const avgComplianceScore = (
    standards.reduce((acc, curr) => acc + curr.complianceScore, 0) / standards.length
  ).toFixed(1);

  const highRiskCount = standards.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'SUBSTANTIAL').length;
  const compliantCount = standards.filter(s => s.status === 'COMPLIANT').length;
  const totalAuditEvents = auditLogs.length;

  const filteredStandards = standards.filter(std => {
    const matchesCategory = categoryFilter === 'ALL' || std.category === categoryFilter || (categoryFilter === 'HIGH_RISK' && (std.riskLevel === 'HIGH' || std.riskLevel === 'SUBSTANTIAL'));
    const matchesSearch = std.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          std.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: EssStandard['status']) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'UNDER_REVIEW':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'NEEDS_ATTENTION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'NON_COMPLIANT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const getRiskBadge = (risk: EssStandard['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'MODERATE':
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
      case 'SUBSTANTIAL':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'HIGH':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
    }
  };

  const getSeverityBadge = (severity: SafeguardAuditLog['severity']) => {
    switch (severity) {
      case 'LOW': return 'text-emerald-400 bg-emerald-900/40 border-emerald-700/50';
      case 'MEDIUM': return 'text-amber-400 bg-amber-900/40 border-amber-700/50';
      case 'HIGH': return 'text-orange-400 bg-orange-900/40 border-orange-700/50';
      case 'CRITICAL': return 'text-rose-400 bg-rose-900/40 border-rose-700/50';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-2 sm:px-0">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
              WORLD BANK ESF PROTOCOL
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              TELEMETRY LIVE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            ESF Safeguard <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Telemetry Portal</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            World Bank Environmental & Social Framework (ESS1-ESS10) Real-Time Compliance Matrix & Audit Logs
          </p>
        </div>

        <button
          onClick={() => {
            setStandards([...mockEssStandards]);
            setAuditLogs([...mockAuditLogs]);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 rounded-xl transition-all shadow-md active:scale-95 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Refresh Telemetry</span>
        </button>
      </header>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glowColor="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Safeguard Index</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgComplianceScore}%</span>
            <span className="text-xs font-semibold text-emerald-400">High Compliance</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Aggregated score across 10 WB ESS standards</p>
        </GlassCard>

        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Compliant Standards</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{compliantCount} / 10</span>
            <span className="text-xs text-slate-400">Verified</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Standards meeting full WB safeguard protocol</p>
        </GlassCard>

        <GlassCard glowColor="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Risk Watchlist</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{highRiskCount}</span>
            <span className="text-xs text-amber-300 font-mono">ESS4 & ESS5</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Standards with active mitigation controls</p>
        </GlassCard>

        <GlassCard glowColor="blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Audit Log Events</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalAuditEvents}</span>
            <span className="text-xs text-cyan-400">Events Logged</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Live field telemetry & inspection records</p>
        </GlassCard>
      </div>

      {/* Main Content Area: ESS1-ESS10 Matrix & Filters */}
      <div className="space-y-6">
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                World Bank ESS1-ESS10 Compliance Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any standard row to view field mitigation notes and institutional audit trails.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search standards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-40 sm:w-56"
                />
              </div>

              <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                {['ALL', 'Environmental', 'Social', 'Governance', 'HIGH_RISK'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      categoryFilter === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'HIGH_RISK' ? 'High Risk' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/40">
                  <th className="py-3 px-4 font-semibold">Standard Code</th>
                  <th className="py-3 px-4 font-semibold">Standard Title</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Compliance Status</th>
                  <th className="py-3 px-4 font-semibold">Risk Rating</th>
                  <th className="py-3 px-4 font-semibold">Score %</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-white/5">
                {filteredStandards.map((std) => (
                  <tr
                    key={std.id}
                    onClick={() => setSelectedStandard(std)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                      {std.code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs truncate">
                      {std.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px]">
                        {std.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border tracking-wider ${getStatusBadge(std.status)}`}>
                        {std.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getRiskBadge(std.riskLevel)}`}>
                        {std.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              std.complianceScore >= 90
                                ? 'bg-emerald-400'
                                : std.complianceScore >= 80
                                ? 'bg-cyan-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${std.complianceScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-white font-semibold">{std.complianceScore}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 inline-block transition-transform group-hover:translate-x-1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Selected Standard Details Drawer / Card */}
        {selectedStandard && (
          <GlassCard className="border-cyan-500/40 bg-slate-900/90 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-xs">
                    {selectedStandard.code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getStatusBadge(selectedStandard.status)}`}>
                    {selectedStandard.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{selectedStandard.name}</h3>
              </div>
              <button
                onClick={() => setSelectedStandard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Standard Description & Objective:</span>
                  <p className="bg-slate-950/60 p-3 rounded-lg border border-white/5 text-slate-200">
                    {selectedStandard.description}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Key Safeguard Mitigation Control:</span>
                  <p className="bg-slate-950/60 p-3 rounded-lg border border-emerald-500/20 text-emerald-300 font-medium">
                    {selectedStandard.keyMitigation}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Responsible Institutional Unit:</span>
                  <span className="font-semibold text-white">{selectedStandard.responsibleUnit}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Risk Assessment Rating:</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getRiskBadge(selectedStandard.riskLevel)}`}>
                    {selectedStandard.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Last Institutional Audit:</span>
                  <span className="font-mono text-cyan-300">{selectedStandard.lastAudited}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Compliance Index Score:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">{selectedStandard.complianceScore}%</span>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Live Telemetry Audit Stream */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Live Telemetry Audit Logs & Field Event Stream
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time incident reporting and safeguard inspection log from Balochistan district monitoring units
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-full border border-slate-700">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/40">
                  <th className="py-3 px-4 font-semibold">Log ID</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">ESS Standard</th>
                  <th className="py-3 px-4 font-semibold">District</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Event Description</th>
                  <th className="py-3 px-4 font-semibold">Auditor</th>
                  <th className="py-3 px-4 font-semibold">Resolution Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-white/5 font-sans">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">{log.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">{log.essCode}</td>
                    <td className="py-3 px-4 text-slate-200 font-medium">{log.district}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm">{log.eventDescription}</td>
                    <td className="py-3 px-4 text-slate-400">{log.auditor}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        log.status === 'RESOLVED'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : log.status === 'INVESTIGATING'
                          ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800'
                          : log.status === 'CORRECTIVE_ACTION_REQUIRED'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                          : 'bg-rose-950/60 text-rose-400 border-rose-800'
                      }`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
