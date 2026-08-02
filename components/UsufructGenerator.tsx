'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { RoleGate } from '@/lib/rbac-context';
import { useI18n } from '@/lib/i18n-context';
import {
  firestore,
  ledgerLogs,
  sanitizeHtml,
  sanitizeQueryParam,
} from '@/lib/firebase-sim';
import jsPDF from 'jspdf';

export interface UsufructFormData {
  clan: string;
  beneficiary: string;
  district: string;
  parcelId: string;
  areaHectares: number;
  customaryRightsType: 'INALIENABLE_USUFRUCT' | 'INALIENABLE_COMMUNAL_USUFRUCT';
}

export function UsufructGenerator() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<UsufructFormData>({
    clan: '',
    beneficiary: '',
    district: 'Quetta',
    parcelId: '',
    areaHectares: 10,
    customaryRightsType: 'INALIENABLE_USUFRUCT',
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [issuedCert, setIssuedCert] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState(ledgerLogs);

  const handleInputChange = (field: keyof UsufructFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const validateForm = (): { valid: boolean; error?: string } => {
    const beneficiaryName = (formData.beneficiary || formData.clan || '').trim();
    if (!beneficiaryName) {
      return { valid: false, error: 'BENEFICIARY_REQUIRED: Beneficiary or Clan name cannot be empty.' };
    }

    const area = Number(formData.areaHectares);
    if (isNaN(area) || area <= 0) {
      return { valid: false, error: 'INVALID_AREA: Parcel area must be greater than zero hectares.' };
    }

    if (area > 1000000) {
      return { valid: false, error: 'EXCEEDS_DISTRICT_MAX: Parcel area exceeds maximum allowed boundary (1,000,000 Hectares).' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = validateForm();
    if (!validation.valid) {
      setValidationError(validation.error || 'Validation error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Input sanitization against XSS and SQL/NoSQL injections
      const sanitizedBeneficiary = sanitizeHtml(formData.beneficiary || formData.clan);
      const sanitizedClan = sanitizeHtml(formData.clan || formData.beneficiary);
      const rawParcelId = formData.parcelId || `BAL-KAREZ-${Math.floor(100 + Math.random() * 900)}`;
      const sanitizedParcelId = sanitizeQueryParam(rawParcelId).replace(/[^a-zA-Z0-9_-]/g, '');

      const requestPayload = {
        clan: sanitizedClan,
        beneficiary: sanitizedBeneficiary,
        district: formData.district,
        parcelId: sanitizedParcelId,
        areaHectares: Number(formData.areaHectares),
        customaryRightsType: formData.customaryRightsType,
      };

      const res = await fetch('/api/fiduciary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Server error generating certificate');
      }

      setIssuedCert({ id: responseData.certificate.certNumber, ...responseData.certificate });
      setLogs([{
        docId: responseData.certificate.certNumber,
        timestamp: Date.now(),
        action: 'USUFRUCT_ISSUED',
        path: `usufruct_certificates/${responseData.certificate.certNumber}`,
        metadata: {
          actor: 'FPMU_SYSTEM',
          details: `Certificate issued for ${requestPayload.beneficiary} (${requestPayload.areaHectares} ha)`
        }
      }, ...ledgerLogs]);
    } catch (err: any) {
      setValidationError(`Submission failed: ${err.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = () => {
    if (!issuedCert) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('IFRAP Usufruct Rights Certificate', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('World Bank IFRAP Component 3 - Balochistan', 105, 30, { align: 'center' });
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(14);
    doc.text(`Certificate ID: ${issuedCert.id}`, 20, 50);
    doc.text(`Beneficiary: ${issuedCert.clan}`, 20, 60);
    doc.text(`District: ${issuedCert.district}`, 20, 70);
    doc.text(`Parcel ID: ${issuedCert.parcelId}`, 20, 80);
    doc.text(`Area (Hectares): ${issuedCert.areaHectares}`, 20, 90);
    doc.text(`Rights Type: ${issuedCert.customaryRightsType}`, 20, 100);
    doc.text(`Issued On: ${new Date(issuedCert.issuedAt).toLocaleDateString()}`, 20, 110);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`SHA-256 Fingerprint: ${issuedCert.hash || 'N/A'}`, 20, 130);
    
    doc.save(`usufruct_${issuedCert.id}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Usufruct Rights Certificate Generator Form */}
      <RoleGate 
        allowedRoles={['PROVINCIAL_PIU', 'FPMU_DIRECTOR']}
        fallback={
          <div className="bg-slate-900/60 backdrop-blur-md border border-rose-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.1)] flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[300px]">
            <svg className="w-12 h-12 text-rose-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Access Denied</h3>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                You need elevated privileges (PROVINCIAL_PIU or FPMU_DIRECTOR) to generate Usufruct Certificates.
              </p>
            </div>
          </div>
        }
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" aria-hidden="true" />
              {t.usufruct.badge}
            </div>
            <h2 className="text-2xl font-bold text-slate-100">
              {t.usufruct.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t.usufruct.subtitle}
            </p>
          </div>

          {validationError && (
            <div role="alert" aria-live="assertive" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs" aria-label={t.usufruct.title}>
            {/* Clan / Beneficiary Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="usufruct-beneficiary" className="text-slate-300 font-semibold block text-sm">
                {t.usufruct.beneficiaryLabel}
              </label>
              <input
                id="usufruct-beneficiary"
                type="text"
                required
                aria-required="true"
                value={formData.clan}
                onChange={(e) => {
                  handleInputChange('clan', e.target.value);
                  handleInputChange('beneficiary', e.target.value);
                }}
                placeholder={t.usufruct.beneficiaryPlaceholder}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* District Selection */}
              <div className="space-y-1.5">
                <label htmlFor="usufruct-district" className="text-slate-300 font-semibold block text-sm">
                  {t.usufruct.districtLabel}
                </label>
                <select
                  id="usufruct-district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                >
                  <option value="Quetta">Quetta</option>
                  <option value="Pishin">Pishin</option>
                  <option value="Mastung">Mastung</option>
                  <option value="Kalat">Kalat</option>
                  <option value="Zhob">Zhob</option>
                  <option value="Ziarat">Ziarat</option>
                </select>
              </div>

              {/* Parcel ID Input */}
              <div className="space-y-1.5">
                <label htmlFor="usufruct-parcel" className="text-slate-300 font-semibold block text-sm">
                  {t.usufruct.parcelIdLabel}
                </label>
                <input
                  id="usufruct-parcel"
                  type="text"
                  value={formData.parcelId}
                  onChange={(e) => handleInputChange('parcelId', e.target.value)}
                  placeholder={t.usufruct.parcelIdPlaceholder}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Parcel Area in Hectares */}
              <div className="space-y-1.5">
                <label htmlFor="usufruct-area" className="text-slate-300 font-semibold block text-sm">
                  {t.usufruct.areaLabel}
                </label>
                <input
                  id="usufruct-area"
                  type="number"
                  step="0.1"
                  required
                  aria-required="true"
                  value={formData.areaHectares}
                  onChange={(e) => handleInputChange('areaHectares', parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-mono transition-colors"
                />
              </div>

              {/* Customary Rights Type */}
              <div className="space-y-1.5">
                <label htmlFor="usufruct-rights-type" className="text-slate-300 font-semibold block text-sm">
                  {t.usufruct.rightsTypeLabel}
                </label>
                <select
                  id="usufruct-rights-type"
                  value={formData.customaryRightsType}
                  onChange={(e) => handleInputChange('customaryRightsType', e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/10 text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                >
                  <option value="INALIENABLE_USUFRUCT">INALIENABLE_USUFRUCT</option>
                  <option value="INALIENABLE_COMMUNAL_USUFRUCT">INALIENABLE_COMMUNAL_USUFRUCT</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {isSubmitting ? t.usufruct.generatingCertButton : t.usufruct.generateCertButton}
            </button>
          </form>
        </div>
      </RoleGate>

      {/* Certificate Display & Compliance Ledger Section */}
      <div className="space-y-6">
        {issuedCert && (
          <div className="bg-slate-900/80 backdrop-blur-md border-2 border-emerald-500/50 p-6 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3" aria-live="polite">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" aria-hidden="true" />
                <h3 className="font-bold text-slate-100 text-base">{t.usufruct.issuedTitle}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold tracking-widest">
                {issuedCert.status}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t.usufruct.docId}</span>
                <span className="text-cyan-400 font-bold">{issuedCert.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t.usufruct.beneficiary}</span>
                <span className="text-slate-200 font-sans font-semibold text-sm">{issuedCert.clan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t.usufruct.districtParcel}</span>
                <span className="text-slate-300">{issuedCert.district} ({issuedCert.parcelId})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t.usufruct.area}</span>
                <span className="text-slate-200 font-bold">{issuedCert.areaHectares} Hectares</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{t.usufruct.rightsType}</span>
                <span className="text-emerald-300">{issuedCert.customaryRightsType}</span>
              </div>
              {issuedCert.hash && (
                <div className="flex justify-between items-start pt-3 mt-3 border-t border-white/10">
                  <span className="text-slate-500 shrink-0">SHA-256</span>
                  <span className="text-slate-400 text-[10px] break-all max-w-[180px] text-right" title={issuedCert.hash}>
                    {issuedCert.hash.substring(0, 24)}...
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={generatePDF}
              className="w-full mt-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Official Certificate PDF
            </button>
          </div>
        )}

        {/* Digital Compliance Audit Ledger Log */}
        <RoleGate allowedRoles={['PROVINCIAL_PIU', 'FPMU_DIRECTOR']}>
          <GlassCard glowColor="none" className="bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">{t.usufruct.complianceLedger}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                {logs.length} {t.usufruct.entriesCount}
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1" aria-live="polite">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">{t.usufruct.noActivity}</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-white/5 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold uppercase">
                        {log.action}
                      </span>
                      <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono truncate">
                      Path: {log.path || 'usufruct_certificates'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </RoleGate>
      </div>
    </div>
  );
}
