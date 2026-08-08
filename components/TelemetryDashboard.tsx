'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/GlassCard';
import { FinancialBurnRateWidget } from '@/components/FinancialBurnRateWidget';
import { useI18n } from '@/lib/i18n-context';
import {
  calculateDistrictMPI,
  calculateSenianMPI,
  CAPABILITY_DIMENSIONS,
  CapabilityDimensionKey,
} from '@/lib/mpi';
import { IFRAPDistrictData } from '@/lib/ifrap-data';
import { MOCK_COMPENSATION_BUDGET } from '@/lib/me-analytics';
import { MEAnalyticsWidgets } from '@/components/MEAnalyticsWidgets';
import { useAnimateIn } from '@/hooks/useAnimateIn';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Isolated in its own component (and wrapped in Suspense below) because
// useSearchParams() requires a Suspense boundary for static prerendering —
// without it, `next build` fails to prerender this page entirely.
function ForbiddenNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get('error') === 'Forbidden') {
      setShow(true);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start sm:items-center justify-between gap-3"
    >
      <span>You don't have permission to access that page. Redirected here instead.</span>
      <button
        onClick={() => {
          setShow(false);
          router.replace('/telemetry');
        }}
        className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}

export function TelemetryDashboard() {
  const { t } = useI18n();
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('quetta');
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const [districts, setDistricts] = useState<IFRAPDistrictData[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/telemetry')
      .then(res => res.json())
      .then(data => {
        setDistricts(data.districts);
        setSummaryStats(data.summaryStats);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch telemetry data', err);
        setIsLoading(false);
      });
  }, []);

  const animated = useAnimateIn(100);

  if (isLoading || districts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const currentDistrict: IFRAPDistrictData =
    districts.find(d => d.id === selectedDistrictId) || districts[0];

  const mpiResult = calculateDistrictMPI(currentDistrict);

  const filteredProgressBars =
    selectedDimension === 'all'
      ? currentDistrict.progressBars
      : currentDistrict.progressBars.filter((pb) => pb.dimension === selectedDimension);


  const handleExportData = () => {
    if (downloadFormat === 'csv') {
      const header = 'District,Province,Component,Population,KarezCount,HeadcountRatio_H,Intensity_A,Senian_MPI,MirabStatus\n';
      const rows = districts.map(
        (d) =>
          `"${d.districtName}","${d.province}",${d.component},${d.population},${d.karezSystemsCount},${d.headcountRatio},${d.povertyIntensity},${calculateSenianMPI(d.headcountRatio, d.povertyIntensity)},"${d.mirabCouncilStatus}"`
      ).join('\n');
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ifrap_c3_telemetry_${selectedDistrictId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportNotice(`Exported ${currentDistrict.districtName} telemetry report as CSV`);
    } else if (downloadFormat === 'json') {
      const dataStr = JSON.stringify(districts, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ifrap_c3_telemetry.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportNotice(`Exported all districts telemetry data as JSON`);
    } else if (downloadFormat === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('MIRAB: IFRAP Programme Telemetry Report', 14, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
      
      const tableData = districts.map(d => [
        d.districtName,
        d.componentName,
        d.karezSystemsCount.toString(),
        calculateSenianMPI(d.headcountRatio, d.povertyIntensity).toFixed(3),
        d.mirabCouncilStatus
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['District', 'Component', 'Active Karez', 'Senian MPI', 'Mirab Council']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [8, 145, 178] }, // Cyan-600
        styles: { fontSize: 9 }
      });

      doc.save('ifrap_c3_telemetry_report.pdf');
      setExportNotice(`Exported telemetry report as PDF`);
    }

    setTimeout(() => setExportNotice(null), 3000);
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'Low Deprivation':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Moderate Deprivation':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'High Deprivation':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Severe Deprivation':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getBarColorClass = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 to-teal-400';
      case 'violet':
        return 'bg-gradient-to-r from-violet-500 to-purple-400';
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400';
      case 'cyan':
      default:
        return 'bg-gradient-to-r from-cyan-500 to-blue-400';
    }
  };

  return (
    <div className="space-y-8">

      <Suspense fallback={null}>
        <ForbiddenNotice />
      </Suspense>

      {/* Header & Title Banner */}
      <section aria-label="Telemetry Header" className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          {t.telemetry.badge}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          {t.telemetry.title}{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent">
            {t.telemetry.titleAccent}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
          {t.telemetry.subtitle}
        </p>
      </section>

      {/* Aggregate Overview Stats Strip */}
      <section aria-label="Aggregate Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glowColor="cyan" animate delay={0.1} hoverEffect={false}>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.telemetry.totalPopulation}</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400">
              {summaryStats.totalPopulation.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">{t.telemetry.populationSub}</p>
          </div>
        </GlassCard>

        <GlassCard glowColor="emerald" animate delay={0.15} hoverEffect={false}>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.telemetry.activeKarez}</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
              {summaryStats.totalRehabilitated} / {summaryStats.totalKarez}
            </div>
            <p className="text-[11px] text-slate-400">{t.telemetry.rehabilitatedSub}</p>
          </div>
        </GlassCard>

        <GlassCard glowColor="violet" animate delay={0.2} hoverEffect={false}>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.telemetry.avgMPI}</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-violet-400">
              {summaryStats.avgMPI.toFixed(3)}
            </div>
            <p className="text-[11px] text-slate-400">{t.telemetry.mpiFormulaSub}</p>
          </div>
        </GlassCard>

        <GlassCard glowColor="amber" animate delay={0.25} hoverEffect={false}>
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.telemetry.beneficiaryHH}</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
              {summaryStats.totalBeneficiaryHH.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">{t.telemetry.waterAllocSub}</p>
          </div>
        </GlassCard>
      </section>

      {/* Role-Gated Financial Compensation Burn Rate Widget */}
      <section aria-label="Financial Burn Rate Section">
        {(() => {
          const districtBudget = MOCK_COMPENSATION_BUDGET.districtBreakdown.find(
            (d) => d.districtId === currentDistrict.id
          );
          return (
            <FinancialBurnRateWidget
              districtName={currentDistrict.districtName}
              totalAllocatedPKR={districtBudget?.allocatedPKR ?? 0}
              disbursedPKR={districtBudget?.disbursedPKR ?? 0}
            />
          );
        })()}
      </section>

      {/* District Selector Tabs */}
      <section aria-label="District Selector" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{t.telemetry.selectDistrict}</h2>
            <p className="text-xs text-slate-400">{t.telemetry.selectDistrictSub}</p>
          </div>

          {/* Export Action Bar */}
          <div className="flex items-center gap-2">
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as 'csv' | 'json' | 'pdf')}
              aria-label="Export Format Option"
              className="px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
            >
              <option value="csv">{t.telemetry.exportCSV}</option>
              <option value="json">{t.telemetry.exportJSON}</option>
              <option value="pdf">Export PDF</option>
            </select>
            <button
              onClick={handleExportData}
              aria-label={`${t.telemetry.downloadReport} (${downloadFormat.toUpperCase()})`}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs transition-all duration-300 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t.telemetry.downloadReport}
            </button>
          </div>
        </div>

        {exportNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
            className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between"
          >
            <span>{exportNotice}</span>
            <span className="font-mono text-[10px] text-cyan-400 uppercase">Success</span>
          </motion.div>
        )}

        <div role="tablist" aria-label={t.telemetry.selectDistrict} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {districts.map((district) => {
            const isSelected = district.id === selectedDistrictId;
            const distMpi = calculateSenianMPI(district.headcountRatio, district.povertyIntensity);

            return (
              <button
                key={district.id}
                role="tab"
                aria-selected={isSelected}
                aria-controls="district-telemetry-panel"
                onClick={() => setSelectedDistrictId(district.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isSelected
                    ? 'bg-slate-900/80 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {district.districtName}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    C3
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-400">{t.telemetry.mpiScore}</span>
                  <span className={`text-xs font-bold font-mono ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {distMpi.toFixed(3)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Analysis Section: Senian MPI Scorecard + Breakdown */}
      <section id="district-telemetry-panel" aria-label="District Analysis" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Senian MPI Primary Scorecard */}
        <GlassCard glowColor="cyan" className="lg:col-span-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.telemetry.deprivationIndex}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(
                  mpiResult.deprivationStatus
                )}`}
              >
                {mpiResult.deprivationStatus}
              </span>
            </div>

            <div className="py-2 space-y-1">
              <div className="text-xs text-slate-400">District: <span className="text-slate-100 font-semibold">{currentDistrict.districtName}</span></div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-300">
                  {mpiResult.mpiScore.toFixed(3)}
                </span>
                <span className="text-sm font-mono text-slate-400">MPI = H × A</span>
              </div>
            </div>

            {/* Formula Components Box */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-1 border-b border-white/5">
                <span className="text-slate-400">{t.telemetry.headcountRatio}:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {(mpiResult.headcountRatio * 100).toFixed(1)}% ({mpiResult.headcountRatio})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t.telemetry.povertyIntensity}:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {(mpiResult.povertyIntensity * 100).toFixed(1)}% ({mpiResult.povertyIntensity})
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 leading-normal">
                {t.telemetry.formulaExplanation}
              </p>
            </div>
          </div>

          {/* Quick Context Footnote */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>{t.telemetry.mirabCouncil}:</span>
            <span className="font-semibold text-emerald-300">{currentDistrict.mirabCouncilStatus}</span>
          </div>
        </GlassCard>

        {/* 4 Dimension Capability Breakdown Bar Chart */}
        <GlassCard glowColor="emerald" className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{t.telemetry.capabilityBreakdown}</h3>
            <p className="text-xs text-slate-400">
              {t.telemetry.capabilityBreakdownSub}
            </p>
          </div>

          <div className="space-y-4">
            {(Object.keys(CAPABILITY_DIMENSIONS) as CapabilityDimensionKey[]).map((dimKey) => {
              const dimInfo = CAPABILITY_DIMENSIONS[dimKey];
              const dimData = mpiResult.dimensionBreakdown[dimKey];
              const score = dimData ? dimData.capabilityScorePercentage : 50;

              return (
                <div key={dimKey} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{dimInfo.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">
                        {t.telemetry.deprivation}: <span className="font-mono text-slate-300">{(dimData.deprivationRatio * 100).toFixed(1)}%</span>
                      </span>
                      <span className="font-mono font-bold text-cyan-300">{score}%</span>
                    </div>
                  </div>

                  <div className="h-3 rounded-full bg-slate-950/80 border border-white/5 overflow-hidden p-0.5 relative">
                    <div
                      style={{
                        width: animated ? `${score}%` : '0%',
                        transition: 'width 1s ease-out'
                      }}
                      className={`h-full rounded-full ${getBarColorClass(dimInfo.color)}`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">{dimInfo.description}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>

      </section>

      {/* Real-time Animated Progress Bars bound to IFRAP programme capability metrics */}
      <section aria-label="Programme Metrics" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {t.telemetry.ifrapMetrics} ({currentDistrict.districtName})
            </h2>
            <p className="text-xs text-slate-400">
              {t.telemetry.ifrapMetricsSub}
            </p>
          </div>

          {/* Dimension Filter Controls */}
          <div role="tablist" aria-label={t.telemetry.ifrapMetrics} className="flex flex-wrap gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button
              role="tab"
              aria-selected={selectedDimension === 'all'}
              onClick={() => setSelectedDimension('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                selectedDimension === 'all' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.telemetry.filterAll}
            </button>
            {(Object.keys(CAPABILITY_DIMENSIONS) as CapabilityDimensionKey[]).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={selectedDimension === key}
                onClick={() => setSelectedDimension(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  selectedDimension === key ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {CAPABILITY_DIMENSIONS[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {filteredProgressBars.map((bar, idx) => (
              <motion.div
                key={bar.id + currentDistrict.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <GlassCard glowColor={bar.color} hoverEffect={false} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400">
                        {CAPABILITY_DIMENSIONS[bar.dimension].label}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 mt-1">{bar.label}</h4>
                    </div>
                    <span className="text-lg font-extrabold font-mono text-cyan-400">
                      {bar.value}{bar.unit}
                    </span>
                  </div>

                  {/* Visual Animated Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>0{bar.unit}</span>
                      <span>{t.telemetry.target}: {bar.target}{bar.unit}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-950 border border-white/10 overflow-hidden p-0.5">
                      <div
                        style={{
                          width: animated ? `${Math.min((bar.value / bar.target) * 100, 100)}%` : '0%',
                          transition: 'width 1s ease-out'
                        }}
                        className={`h-full rounded-full ${getBarColorClass(bar.color)}`}
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Real-time M&E Analytics Widgets Section */}
      <section aria-label="M&E Analytics Widgets" className="space-y-4">
        <MEAnalyticsWidgets />
      </section>

      {/* Anthropological & Customary Water Governance Context */}
      <section aria-label="Anthropological Field Observations">
        <GlassCard glowColor="none" className="bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {t.telemetry.fieldObservations} ({currentDistrict.districtName})
              </h3>
              <p className="text-xs text-slate-400">{t.telemetry.fieldObsSub}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {currentDistrict.anthropologicalNote}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400">{t.telemetry.districtCoordinates}</span>
              <div className="font-mono text-cyan-300">{currentDistrict.coordinates[1]}° N, {currentDistrict.coordinates[0]}° E</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400">{t.telemetry.beneficiaryPopulation}</span>
              <div className="font-mono text-emerald-300">{currentDistrict.beneficiaryHouseholds.toLocaleString()} Households</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400">{t.telemetry.waterMasterCouncil}</span>
              <div className="font-mono text-violet-300">{currentDistrict.mirabCouncilStatus}</div>
            </div>
          </div>
        </GlassCard>
      </section>

    </div>
  );
}
