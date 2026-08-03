'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { useAnimateIn } from '@/hooks/useAnimateIn';
import { MOCK_COMPENSATION_BUDGET } from '@/lib/me-analytics';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  DollarSign,
  Users,
  Building,
  Target,
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export interface Component3Kpi {
  id: string;
  indicator: string;
  category: 'Infrastructure' | 'Social Inclusion' | 'Fiduciary' | 'Gender & Safeguards';
  target: number;
  achieved: number;
  unit: string;
  baseline: number;
  wbMilestoneStatus: 'ON_TRACK' | 'EXCEEDED' | 'NEEDS_ACCELERATION';
}

export interface SenianMpiCapability {
  dimension: string;
  preInterventionScore: number; // 0-100 Deprivation Index (Higher = More Deprived)
  postInterventionScore: number;
  capabilityGainPercent: number;
  description: string;
}

const mockKpis: Component3Kpi[] = [
  {
    id: 'KPI-C3-01',
    indicator: 'Displaced Households Assisted',
    category: 'Social Inclusion',
    target: 1200,
    achieved: 940,
    unit: 'Households',
    baseline: 0,
    wbMilestoneStatus: 'ON_TRACK',
  },
  {
    id: 'KPI-C3-02',
    indicator: 'Karez Systems Rehabilitated',
    category: 'Infrastructure',
    target: 85,
    achieved: 68,
    unit: 'Karez Systems',
    baseline: 12,
    wbMilestoneStatus: 'ON_TRACK',
  },
  {
    id: 'KPI-C3-03',
    indicator: 'Water User Associations / Mirab Councils Formed',
    category: 'Social Inclusion',
    target: 120,
    achieved: 105,
    unit: 'Mirab Councils',
    baseline: 25,
    wbMilestoneStatus: 'EXCEEDED',
  },
  {
    id: 'KPI-C3-04',
    indicator: 'Land Usufruct Certificates Registered',
    category: 'Fiduciary',
    target: 2500,
    achieved: 2150,
    unit: 'Certificates',
    baseline: 150,
    wbMilestoneStatus: 'ON_TRACK',
  },
  {
    id: 'KPI-C3-05',
    indicator: 'Women\'s Water Allocation Access Rate',
    category: 'Gender & Safeguards',
    target: 40,
    achieved: 38,
    unit: '% Access Rate',
    baseline: 14,
    wbMilestoneStatus: 'ON_TRACK',
  },
];

const mockSenianCapabilities: SenianMpiCapability[] = [
  {
    dimension: 'Water Usufruct Deprivation Index',
    preInterventionScore: 68.5,
    postInterventionScore: 24.2,
    capabilityGainPercent: 64.7,
    description: 'Reduction in water share disputes and equitable access to customary Karez turns.',
  },
  {
    dimension: 'Household Climate Vulnerability Score',
    preInterventionScore: 74.0,
    postInterventionScore: 31.5,
    capabilityGainPercent: 57.4,
    description: 'Resilience against 2022-scale flood inundation and drought shocks.',
  },
  {
    dimension: 'Agricultural Income Capability',
    preInterventionScore: 59.2,
    postInterventionScore: 21.0,
    capabilityGainPercent: 64.5,
    description: 'Crop yield expansion and reduction in income poverty among tenant farmers.',
  },
  {
    dimension: 'Social Governance & Mirab Inclusion',
    preInterventionScore: 62.8,
    postInterventionScore: 18.4,
    capabilityGainPercent: 70.7,
    description: 'Inclusive participation of minority clans in Mirab water councils.',
  },
];

export function MeResultsEngine() {
  const animated = useAnimateIn(100);
  const [kpis, setKpis] = useState<Component3Kpi[]>(mockKpis);
  const [capabilities, setCapabilities] = useState<SenianMpiCapability[]>(mockSenianCapabilities);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Financial Progress vs Physical Progress — sourced from the canonical
  // program budget (lib/me-analytics.ts) so this figure matches the
  // Telemetry dashboard's Financial Burn Rate widget instead of inventing
  // its own number.
  const totalAllocatedBudgetPKR = MOCK_COMPENSATION_BUDGET.totalAllocatedBudgetPKR;
  const totalDisbursedBudgetPKR = MOCK_COMPENSATION_BUDGET.disbursedAmountPKR;
  const burnRatePercentage = MOCK_COMPENSATION_BUDGET.burnRatePercentage;
  const overallPhysicalProgress = 78.5; // 78.5% physical completion (independent civil-works metric)
  const formatPKR = (amount: number) => `${(amount / 1000000).toFixed(1)}M PKR`;

  // Export CSV Handler
  const handleExportCsv = async () => {
    try {
      setExportMessage('Generating M&E Results CSV Dataset...');
      
      const csvHeader = 'KPI ID,Indicator Name,Category,Target,Achieved,Unit,Milestone Status,Completion %\n';
      const csvRows = kpis.map(k => {
        const pct = ((k.achieved / k.target) * 100).toFixed(1);
        return `"${k.id}","${k.indicator}","${k.category}",${k.target},${k.achieved},"${k.unit}","${k.wbMilestoneStatus}",${pct}%`;
      }).join('\n');

      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `WorldBank_Component3_ME_Results_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportMessage('CSV Dataset successfully exported.');
      setTimeout(() => setExportMessage(null), 4000);
    } catch (err: any) {
      setExportMessage(`CSV Export failed: ${err.message}`);
    }
  };

  // Export PDF Handler using jsPDF
  const handleExportPdf = async () => {
    try {
      setExportMessage('Generating World Bank Executive M&E Report (PDF)...');
      
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = new jsPDF();

      // Title & Header
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('World Bank IFRAP Component 3 - M&E Results Report', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleString()} | Senian Capability & ESF Safeguard Monitoring`, 14, 28);

      // Financial Summary Box
      doc.setFillColor(241, 245, 249);
      doc.rect(14, 34, 182, 24, 'F');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Component 3 Budget: ${formatPKR(totalAllocatedBudgetPKR)}`, 18, 42);
      doc.text(`Disbursed Burn Rate: ${formatPKR(totalDisbursedBudgetPKR)} (${burnRatePercentage.toFixed(1)}%)`, 18, 49);
      doc.text(`Physical Works Progress: ${overallPhysicalProgress}%`, 110, 42);

      // Table 1: Component 3 KPIs
      const tableData = kpis.map(k => [
        k.id,
        k.indicator,
        k.category,
        `${k.target} ${k.unit}`,
        `${k.achieved} ${k.unit}`,
        `${((k.achieved / k.target) * 100).toFixed(1)}%`,
        k.wbMilestoneStatus
      ]);

      autoTable(doc, {
        startY: 64,
        head: [['KPI ID', 'Indicator', 'Category', 'Target', 'Achieved', 'Progress %', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [14, 116, 144] },
        styles: { fontSize: 8 },
      });

      doc.save(`WorldBank_Component3_Executive_ME_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

      setExportMessage('PDF Executive Report successfully generated.');
      setTimeout(() => setExportMessage(null), 4000);
    } catch (err: any) {
      setExportMessage(`PDF Export error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-2 sm:px-0">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              WORLD BANK COMPONENT 3
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
              SENIAN CAPABILITY ENGINE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            M&E Results <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Engine</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitoring & Evaluation Engine: Senian MPI Capability Metrics, WB Target Indicators, and Budget Burn Rates
          </p>
        </div>

        {/* Report Export Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 rounded-xl transition-all shadow-md active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export M&E Data (CSV)</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Generate WB PDF Report</span>
          </button>
        </div>
      </header>

      {/* Export Message Banner */}
      {exportMessage && (
        <div className="p-4 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-200 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{exportMessage}</span>
          </div>
          <button onClick={() => setExportMessage(null)} className="text-cyan-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glowColor="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall KPI Progress</span>
            <Target className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">83.4%</span>
            <span className="text-xs font-semibold text-emerald-400">On Track</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Weighted completion across 5 WB targets</p>
        </GlassCard>

        <GlassCard glowColor="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Senian MPI Deprivation Gain</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">-64.3%</span>
            <span className="text-xs text-slate-400">Deprivation Reduction</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Amartya Sen Capability Expansion Index</p>
        </GlassCard>

        <GlassCard glowColor="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Financial Budget Burn</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{formatPKR(totalDisbursedBudgetPKR)}</span>
            <span className="text-xs text-slate-400">of {formatPKR(totalAllocatedBudgetPKR)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">{burnRatePercentage.toFixed(1)}% financial disbursement rate</p>
        </GlassCard>

        <GlassCard glowColor="violet">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Physical Civil Completion</span>
            <Building className="w-5 h-5 text-violet-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{overallPhysicalProgress}%</span>
            <span className="text-xs text-cyan-400">Aligned with Burn</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Karez channel lining & retention structures</p>
        </GlassCard>
      </div>

      {/* Section 1: Component 3 KPI Target Tracker */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              World Bank Component 3 Key Performance Indicator (KPI) Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live tracking of target vs actual achievements across infrastructure, social inclusion, and fiduciary milestones
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/40">
                <th className="py-3 px-4 font-semibold">KPI Code</th>
                <th className="py-3 px-4 font-semibold">Indicator Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Baseline</th>
                <th className="py-3 px-4 font-semibold">Target</th>
                <th className="py-3 px-4 font-semibold">Achieved</th>
                <th className="py-3 px-4 font-semibold">Target Completion %</th>
                <th className="py-3 px-4 font-semibold">WB Milestone Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-white/5 font-sans">
              {kpis.map((kpi) => {
                const completionPct = Math.min(100, (kpi.achieved / kpi.target) * 100);
                return (
                  <tr key={kpi.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{kpi.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{kpi.indicator}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px]">
                        {kpi.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{kpi.baseline}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      {kpi.target} {kpi.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {kpi.achieved} {kpi.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              completionPct >= 85 ? 'bg-emerald-400' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-white font-bold">{completionPct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          kpi.wbMilestoneStatus === 'EXCEEDED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : kpi.wbMilestoneStatus === 'ON_TRACK'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {kpi.wbMilestoneStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Section 2: Senian MPI Capability Reduction Metrics */}
      <GlassCard className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            Amartya Sen Capability Deprivation Index (Pre vs Post Intervention)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates capability expansion across water access, climate resilience, income, and governance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.dimension}
              className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{cap.dimension}</h3>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold">
                  +{cap.capabilityGainPercent}% Capability Gain
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{cap.description}</p>

              <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Pre-Intervention Deprivation: <strong className="text-rose-400">{cap.preInterventionScore} Index</strong></span>
                  <span>Post-Intervention Deprivation: <strong className="text-emerald-400">{cap.postInterventionScore} Index</strong></span>
                </div>

                {/* Comparative Progress Bar */}
                <div className="relative w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="absolute left-0 top-0 h-full bg-rose-500/40 rounded-full"
                    style={{ width: `${cap.preInterventionScore}%` }}
                  />
                  <div
                    className="absolute left-0 top-0 h-full bg-emerald-400 rounded-full"
                    style={{ width: `${cap.postInterventionScore}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Section 3: Budget Burn Rate vs Physical Progress */}
      <GlassCard className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Financial Burn Rate & Physical Works Progress Alignment
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fiduciary monitoring comparing monetary expenditure against physical civil engineering completion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200">Financial Disbursement Burn Rate</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">{formatPKR(totalDisbursedBudgetPKR)}</span>
              <span className="text-slate-400">Disbursed out of {formatPKR(totalAllocatedBudgetPKR)} Total Allocation</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${burnRatePercentage}%` }} />
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              Financial Disbursement Index: {burnRatePercentage.toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200">Physical Construction & Monitoring Completion</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-cyan-400">{overallPhysicalProgress}%</span>
              <span className="text-slate-400">Verified Physical Works</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${overallPhysicalProgress}%` }} />
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              Fiduciary Balance Variance: {(overallPhysicalProgress - burnRatePercentage >= 0 ? '+' : '')}
              {(overallPhysicalProgress - burnRatePercentage).toFixed(1)}%{' '}
              ({overallPhysicalProgress >= burnRatePercentage ? 'Physical ahead of expenditure' : 'Expenditure ahead of physical works'})
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
