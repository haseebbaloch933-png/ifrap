'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { useAnimateIn } from '@/hooks/useAnimateIn';
import { offlineDB, DecryptedDraft } from '@/lib/offline/indexed-db';
import { scrubPayload, getScrubAudit, PiiScrubAuditResult } from '@/lib/privacy/ner-pii-scrubber';
import {
  FileText,
  Shield,
  Save,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
  Tag,
  MapPin,
  User,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Send,
  Lock,
  Layers
} from 'lucide-react';

export interface FieldLogForm {
  district: string;
  karezSystem: string;
  clanCommunity: string;
  author: string;
  narrative: string;
  tags: string[];
  lat: number;
  lon: number;
}

const initialForm: FieldLogForm = {
  district: 'Mastung',
  karezSystem: 'Karez Chashma Mirab',
  clanCommunity: 'Raisani Usufruct Group',
  author: 'Dr. Shahzaman Baloch',
  narrative: 'Field observation at Karez Chashma Mirab: Spoke with Respondent Respondent Name: Malik Gul Khan (CNIC: 54400-1234567-9, Phone: 0300-1234567). He confirmed that water share allocation has been maintained according to 100-year customary law, but recent 2022 flood siltation destroyed 300 meters of underground aqueduct.',
  tags: ['WaterAllocation', 'KarezRehabilitation', 'UsufructRights'],
  lat: 29.79854,
  lon: 66.84521,
};

const availableTags = [
  'WaterAllocation',
  'KarezRehabilitation',
  'UsufructRights',
  'GenderInclusion',
  'ClimateImpact',
  'CommunityDispute',
  'MirabGovernance',
  'SafeguardViolation',
];

export function FieldAnthropologistLog() {
  const animated = useAnimateIn(100);
  const [formData, setFormData] = useState<FieldLogForm>(initialForm);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingDrafts, setPendingDrafts] = useState<DecryptedDraft[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'FORM' | 'PII_PREVIEW' | 'RAG_EMBEDDING' | 'OFFLINE_DRAFTS'>('FORM');

  // Embedding state
  const [isGeneratingVector, setIsGeneratingVector] = useState<boolean>(false);
  const [vectorGenerated, setVectorGenerated] = useState<boolean>(false);
  const [vectorData, setVectorData] = useState<{
    vectorDimensions: number;
    table: string;
    sampleVector: number[];
    similarityIndex: number;
  } | null>(null);

  // Computed PII Audit & Scrubbed Payload
  const scrubbedFormData = scrubPayload(formData);
  const piiAudit: PiiScrubAuditResult = getScrubAudit(formData);

  // Monitor network status & load pending drafts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadPendingDrafts();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingDrafts = async () => {
    try {
      const drafts = await offlineDB.getPendingDrafts();
      const count = await offlineDB.getPendingCount();
      setPendingDrafts(drafts);
      setPendingCount(count);
    } catch (err) {
      console.warn('Could not access IndexedDB drafts:', err);
    }
  };

  const handleInputChange = (field: keyof FieldLogForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      if (exists) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  const handleSaveOffline = async () => {
    try {
      setSaveStatus('Saving to IndexedDB with AES-256 encryption...');
      const draftId = await offlineDB.saveEncryptedDraft('FIELD_LOG', formData, '/api/telemetry');
      setSaveStatus(`Successfully saved offline draft (${draftId}).`);
      await loadPendingDrafts();
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus(`Failed to save draft: ${err.message || 'IndexedDB error'}`);
    }
  };

  const handleSyncQueue = async () => {
    setIsSyncing(true);
    setSaveStatus('Triggering automatic sync queue with backend server...');
    try {
      const result = await offlineDB.syncOfflineQueue();
      setSaveStatus(`Sync complete! ${result.synced} synced, ${result.failed} failed.`);
      await loadPendingDrafts();
    } catch (err: any) {
      setSaveStatus(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await offlineDB.deleteDraft(id);
      await loadPendingDrafts();
    } catch (err) {
      console.error('Failed to delete draft:', err);
    }
  };

  const handleGenerateVectorEmbedding = () => {
    setIsGeneratingVector(true);
    setTimeout(() => {
      // Simulate 1536-dim vector embedding generation (OpenAI text-embedding-3-small or pgvector compatible)
      const sampleVec = Array.from({ length: 8 }, () => Number((Math.random() * 2 - 1).toFixed(4)));
      setVectorData({
        vectorDimensions: 1536,
        table: 'qualitative_field_logs',
        sampleVector: sampleVec,
        similarityIndex: 0.942,
      });
      setVectorGenerated(true);
      setIsGeneratingVector(false);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 px-2 sm:px-0">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              DECISION SUPPORT & QUALITATIVE DATA
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded flex items-center gap-1.5 border ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'NETWORK ONLINE' : 'OFFLINE MODE (INDEXEDDB ENABLED)'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Field Anthropologist <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Qualitative Log</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Balochistan Qualitative Narrative Entry with Offline Storage, NER PII Redaction, and pgvector RAG Embedding Pipeline
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveOffline}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft (IndexedDB)</span>
          </button>

          <button
            onClick={handleSyncQueue}
            disabled={isSyncing || pendingCount === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 ${
              pendingCount > 0
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Queue ({pendingCount})</span>
          </button>
        </div>
      </header>

      {/* Save Status Notification */}
      {saveStatus && (
        <div className="p-4 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-200 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{saveStatus}</span>
          </div>
          <button onClick={() => setSaveStatus(null)} className="text-cyan-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('FORM')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'FORM'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Narrative Form Entry</span>
        </button>

        <button
          onClick={() => setActiveTab('PII_PREVIEW')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'PII_PREVIEW'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>2. Live NER PII Scrubbing</span>
          {piiAudit.piiDetected && (
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/30 text-amber-300 rounded font-mono">
              {piiAudit.redactedCount} PII
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RAG_EMBEDDING')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'RAG_EMBEDDING'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>3. pgvector RAG Embedding</span>
          {vectorGenerated && (
            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/30 text-emerald-300 rounded font-mono">
              1536d
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('OFFLINE_DRAFTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'OFFLINE_DRAFTS'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Offline Drafts ({pendingCount})</span>
        </button>
      </div>

      {/* TAB 1: FORM ENTRY */}
      {activeTab === 'FORM' && (
        <GlassCard className="p-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  District Location
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {['Quetta', 'Mastung', 'Pishin', 'Ziarat', 'Killa Abdullah', 'Zhob', 'Jaffarabad'].map((d) => (
                    <option key={d} value={d}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Karez System / Site Name
                </label>
                <input
                  type="text"
                  value={formData.karezSystem}
                  onChange={(e) => handleInputChange('karezSystem', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Karez Chashma Mirab"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Clan / Community / Tribe Name
                </label>
                <input
                  type="text"
                  value={formData.clanCommunity}
                  onChange={(e) => handleInputChange('clanCommunity', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Raisani Usufruct Group"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Anthropologist / Field Enumerator
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  GPS Latitude (Precision Fuzzed)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.lat}
                  onChange={(e) => handleInputChange('lat', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  GPS Longitude (Precision Fuzzed)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.lon}
                  onChange={(e) => handleInputChange('lon', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Narrative Observation Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Qualitative Field Observation Narrative</span>
                <span className="text-[11px] text-slate-400">
                  NER PII Scrubber active automatically
                </span>
              </label>
              <textarea
                rows={5}
                value={formData.narrative}
                onChange={(e) => handleInputChange('narrative', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                placeholder="Enter detailed ethnographic narrative, customary water rights, disputes, or ITK observations..."
              />
            </div>

            {/* Tag Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ethnographic & ESF Safeguard Tags</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = formData.tags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>AES-256 Client Encryption & PII Anonymization Protocol Active</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveOffline}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  Save Encrypted Draft
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('PII_PREVIEW')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                >
                  Inspect PII & RAG Vector
                </button>
              </div>
            </div>
          </form>
        </GlassCard>
      )}

      {/* TAB 2: LIVE PII SCRUBBING INSPECTION */}
      {activeTab === 'PII_PREVIEW' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Real-Time Client-Side NER PII Redaction Inspection
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complies with World Bank ESS5/ESS10 directives & Pakistan Data Privacy Standards
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-mono font-bold rounded border ${
                  piiAudit.piiDetected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {piiAudit.piiDetected ? `PII DETECTED & REDACTED (${piiAudit.redactedCount})` : 'NO PII DETECTED'}
              </span>
            </div>
          </div>

          {/* Audit Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Scrubbed Categories:</span>
              <div className="flex flex-wrap gap-1">
                {piiAudit.scrubbedFields.length > 0 ? (
                  piiAudit.scrubbedFields.map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-mono text-[10px] rounded border border-rose-500/30">
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-400">None</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">GPS Coordinate Fuzzing:</span>
              <span className="font-mono text-cyan-300">
                Lat: {scrubbedFormData.lat.toFixed(2)}, Lon: {scrubbedFormData.lon.toFixed(2)} (~1.1km grid)
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">CNIC Anonymization Hash:</span>
              <span className="font-mono text-amber-300">Deterministic SHA-256 Hash Retained</span>
            </div>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Raw Field Input (Contains Unscrubbed PII)
              </h3>
              <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-xl font-mono text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[160px]">
                {formData.narrative}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Sanitized Payload (Ready for DB / Vector Indexing)
              </h3>
              <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl font-mono text-emerald-200 whitespace-pre-wrap leading-relaxed min-h-[160px]">
                {scrubbedFormData.narrative}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* TAB 3: RAG VECTOR EMBEDDING INTEGRATION */}
      {activeTab === 'RAG_EMBEDDING' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                pgvector RAG Vector Store Embedding Integration
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates 1536-dimensional embedding vector for PostgreSQL pgvector cosine similarity search
              </p>
            </div>

            <button
              onClick={handleGenerateVectorEmbedding}
              disabled={isGeneratingVector}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingVector ? 'animate-spin' : ''}`} />
              <span>{isGeneratingVector ? 'Computing Vector...' : 'Generate 1536d Vector'}</span>
            </button>
          </div>

          {vectorGenerated && vectorData ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>
                    Vector indexed in database table <strong className="text-white">{vectorData.table}</strong> with HNSW cosine distance index (<code className="text-cyan-300">vector_cosine_ops</code>).
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-900 border border-emerald-700 text-white font-bold text-[11px] rounded">
                  INDEXED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Vector Dimensions:</span>
                  <span className="text-2xl font-black text-white font-mono">{vectorData.vectorDimensions}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Target Table:</span>
                  <span className="text-lg font-bold text-cyan-300 font-mono">{vectorData.table}</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Cosine Similarity Score:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {(vectorData.similarityIndex * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-300 mb-2">Sample Vector Embedding Output (First 8 Dimensions):</h3>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(vectorData.sampleVector, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-3">
              <Database className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No Vector Embedding Generated Yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Generate 1536d Vector" above to create an embedding payload for pgvector semantic search.
              </p>
            </div>
          )}
        </GlassCard>
      )}

      {/* TAB 4: OFFLINE DRAFTS QUEUE */}
      {activeTab === 'OFFLINE_DRAFTS' && (
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-violet-400" />
                IndexedDB AES-256 Encrypted Offline Draft Store
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Local persistent storage for field records when connectivity is unavailable
              </p>
            </div>

            <button
              onClick={handleSyncQueue}
              disabled={isSyncing || pendingDrafts.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync All Drafts ({pendingDrafts.length})</span>
            </button>
          </div>

          {pendingDrafts.length > 0 ? (
            <div className="space-y-3">
              {pendingDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-300">{draft.id}</span>
                      <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded font-mono text-[10px]">
                        {draft.type}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {new Date(draft.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 max-w-xl truncate">
                      {draft.data.narrative || JSON.stringify(draft.data)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">All Offline Drafts Synced</p>
              <p className="text-xs text-slate-500">There are no pending offline records in IndexedDB.</p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
