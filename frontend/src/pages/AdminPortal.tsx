import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Upload, CheckCircle2, FileText, 
  History, AlertCircle, RefreshCw, FolderPlus, Layers,
  Globe, Database, ExternalLink, Play, Check, AlertTriangle, Filter,
  LifeBuoy, Star, MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { Sector, FranchiseSummary, DataQualitySummary, FranchiseSourceItem, SupportRequest, FeedbackItem } from '../types';

export const AdminPortal: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'franchises' | 'sources' | 'verify' | 'sectors' | 'documents' | 'audit' | 'support' | 'feedback'>('sources');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [franchises, setFranchises] = useState<FranchiseSummary[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [qualitySummary, setQualitySummary] = useState<DataQualitySummary | null>(null);
  const [sourcesList, setSourcesList] = useState<FranchiseSourceItem[]>([]);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<{ id: number; msg: string; success: boolean } | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Customer Support & Feedback State
  const [supportTickets, setSupportTickets] = useState<SupportRequest[]>([]);
  const [ticketFilter, setTicketFilter] = useState<string>('ALL');
  const [updatingTicketId, setUpdatingTicketId] = useState<number | null>(null);
  const [ticketAdminNote, setTicketAdminNote] = useState<string>('');

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [feedbackCatFilter, setFeedbackCatFilter] = useState<string>('ALL');

  // Form: Create Franchise
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newSectorId, setNewSectorId] = useState<number>(1);
  const [newSubSector, setNewSubSector] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFounded, setNewFounded] = useState(2018);
  const [newHq, setNewHq] = useState('Hyderabad');
  const [newInvestment, setNewInvestment] = useState(2500000);
  const [newFee, setNewFee] = useState(400000);
  const [newRev, setNewRev] = useState(600000);
  const [newProfit, setNewProfit] = useState(110000);
  const [newRoi, setNewRoi] = useState(52.8);
  const [newPayback, setNewPayback] = useState(22.7);

  // Form: Verify Data Source
  const [sourceId, setSourceId] = useState<number>(1);
  const [sourceType, setSourceType] = useState<string>('VERIFIED');
  const [confLevel, setConfLevel] = useState<number>(95);
  const [sourceName, setSourceName] = useState('Audited Unit Operations Filing FY25');
  const [methodology, setMethodology] = useState('Certified forensic audit of P&L disclosures corroborated by bank reconciliation statements.');

  // Form: Add Sector
  const [sectorName, setSectorName] = useState('');
  const [sectorCategory, setSectorCategory] = useState('Services');
  const [sectorDesc, setSectorDesc] = useState('');

  // Document Upload State
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Franchise Disclosure Document (FDD)');
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.getSectors(),
      api.getFranchises(),
      api.getAuditLogs().catch(() => []),
      api.getDataQualitySummary().catch(() => null),
      api.getDataSources().catch(() => []),
      api.getAdminSupportRequests().catch(() => []),
      api.getAdminFeedback().catch(() => [])
    ]).then(([sData, fData, aData, qData, srcData, supData, fbData]) => {
      setSectors(sData);
      setFranchises(fData);
      setAuditLogs(aData);
      if (qData) setQualitySummary(qData);
      if (srcData) setSourcesList(srcData);
      if (supData) setSupportTickets(supData);
      if (fbData) setFeedbackList(fbData);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRefreshSource = async (franchiseId: number, name: string) => {
    setRefreshingId(franchiseId);
    setRefreshMsg(null);
    try {
      const res = await api.refreshOfficialFranchiseData(franchiseId);
      setRefreshMsg({
        id: franchiseId,
        msg: `Successfully fetched official website. ${res.observations_count} data observations logged. Mode: ${res.mode}`,
        success: true
      });
      loadAll();
    } catch (err: any) {
      setRefreshMsg({
        id: franchiseId,
        msg: `Fetch issue: ${err.message || 'Unable to connect to official website'}. Fallback data preserved.`,
        success: false
      });
    } finally {
      setRefreshingId(null);
    }
  };

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    try {
      const res = await api.refreshAllOfficialSources();
      alert(`Ingestion job queued: ${res.total_franchises} official sources queued for background refresh.`);
      loadAll();
    } catch (err: any) {
      alert(`Error queueing refresh: ${err.message}`);
    } finally {
      setRefreshingAll(false);
    }
  };

  const handleCreateFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFranchise({
        name: newName,
        slug: newSlug || newName.toLowerCase().replace(/\s+/g, '-'),
        sector_id: newSectorId,
        sub_sector: newSubSector,
        description: newDesc,
        founded_year: newFounded,
        headquarters: newHq,
        franchise_model: 'FOFO',
        min_investment: newInvestment * 0.8,
        max_investment: newInvestment * 1.2,
        total_investment: newInvestment,
        franchise_fee: newFee,
        monthly_revenue: newRev,
        monthly_profit: newProfit,
        roi_annual: newRoi,
        payback_months: newPayback,
        royalty_percentage: 5.0
      });
      alert('Franchise created and audit log created!');
      loadAll();
      setNewName('');
      setNewSubSector('');
      setNewDesc('');
    } catch (err: any) {
      alert(err.message || 'Error creating franchise');
    }
  };

  const handleUpdateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateVerification({
        data_source_id: sourceId,
        source_type: sourceType,
        confidence_level: confLevel,
        methodology,
        source_name: sourceName
      });
      alert('Data verification status updated!');
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Error updating verification');
    }
  };

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addSector({
        name: sectorName,
        category: sectorCategory,
        description: sectorDesc,
        icon: 'Briefcase'
      });
      alert(`Sector '${sectorName}' successfully added!`);
      loadAll();
      setSectorName('');
      setSectorDesc('');
    } catch (err: any) {
      alert(err.message || 'Error adding sector');
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      alert('Please select a document file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('document_type', docType);

    try {
      const res = await api.uploadDocument(formData);
      setExtractedData(res);
      setUploadSuccess(true);
      loadAll();
    } catch (err: any) {
      alert(err.message || 'Upload error');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: number, newStatus: string, note?: string) => {
    setUpdatingTicketId(ticketId);
    try {
      await api.updateSupportRequestStatus(ticketId, newStatus, note);
      const updated = await api.getAdminSupportRequests();
      setSupportTickets(updated);
      setTicketAdminNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    } finally {
      setUpdatingTicketId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" /> Secured Administrative Suite
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Admin & Forensic Governance Portal</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Ingest franchises, verify metric provenance (Verified, Reported, Estimated, Marketing Claim), upload disclosure documents, and maintain audit integrity.
        </p>
      </div>

      {/* Top Telemetry: Live Data Pipeline Quality Summary */}
      {qualitySummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 font-medium">Official Sources Whitelisted</div>
            <div className="text-2xl font-black text-white mt-1">
              {qualitySummary.total_franchises} <span className="text-xs text-slate-500 font-normal">/ {franchises.length} Brands</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <Check className="w-3 h-3" /> 100% Whitelisted Domains
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 font-medium">Live Website Mode</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {qualitySummary.live_sources}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {qualitySummary.total_franchises - qualitySummary.live_sources} on benchmark fallback
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 font-medium">Total Historical Observations</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {qualitySummary.total_observations}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Field-level values preserved
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 font-medium">Classification Breakdown</div>
            <div className="text-xs font-semibold text-amber-400 mt-2">
              Claims: {qualitySummary.marketing_claims || 0}
            </div>
            <div className="text-xs font-semibold text-emerald-400">
              Disclosures: {qualitySummary.factual_disclosures || 0}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'sources', label: 'Official Sources Pipeline', icon: Globe },
          { id: 'support', label: 'Customer Support', icon: LifeBuoy },
          { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
          { id: 'franchises', label: 'Create Franchise', icon: Plus },
          { id: 'verify', label: 'Verify Data Badges', icon: CheckCircle2 },
          { id: 'sectors', label: 'Manage Sectors', icon: FolderPlus },
          { id: 'documents', label: 'Document Parser', icon: Upload },
          { id: 'audit', label: 'System Audit Logs', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 0: Official Sources Pipeline */}
      {activeAdminTab === 'sources' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>Official Brand Websites Live Ingestion Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Franchise information is collected and updated strictly from individual official brand portals. Rate limiting (1.5s/domain) and anti-SSRF protections are actively enforced.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshAll}
                disabled={refreshingAll}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingAll ? 'animate-spin' : ''}`} />
                <span>{refreshingAll ? 'Ingesting Sources...' : 'Refresh All 60+ Sources'}</span>
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {refreshMsg && (
            <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
              refreshMsg.success
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {refreshMsg.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                <span>{refreshMsg.msg}</span>
              </div>
              <button onClick={() => setRefreshMsg(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Filter Sources:</span>
            {['ALL', 'LIVE', 'SUCCESS', 'FAILED'].map((f) => (
              <button
                key={f}
                onClick={() => setSourceFilter(f)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  sourceFilter === f
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sources Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Franchise Brand</th>
                  <th className="p-3">Official Website</th>
                  <th className="p-3">Ingestion Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Checked</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {sourcesList
                  .filter((s) => {
                    if (sourceFilter === 'ALL') return true;
                    if (sourceFilter === 'LIVE') return s.source_mode === 'LIVE';
                    if (sourceFilter === 'SUCCESS') return s.fetch_status === 'SUCCESS';
                    if (sourceFilter === 'FAILED') return s.fetch_status === 'FAILED';
                    return true;
                  })
                  .map((src) => {
                    const isRefreshing = refreshingId === src.franchise_id;
                    return (
                      <tr key={src.franchise_id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-white font-sans">
                          {src.franchise_name}
                        </td>
                        <td className="p-3 max-w-[220px] truncate">
                          <a
                            href={src.official_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline flex items-center gap-1.5"
                          >
                            <span>{src.official_website.replace('https://', '').replace('http://', '').split('/')[0]}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            src.source_mode === 'LIVE'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          }`}>
                            {src.source_mode === 'LIVE' ? 'LIVE' : 'FALLBACK'}
                          </span>
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            src.fetch_status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : src.fetch_status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {src.fetch_status || 'INITIALIZED'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 whitespace-nowrap font-mono text-[10px]">
                          {src.last_updated
                            ? new Date(src.last_updated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : '11 Sep 2026, 05:30'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRefreshSource(src.franchise_id, src.franchise_name)}
                            disabled={isRefreshing}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-sans font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>{isRefreshing ? 'Fetching...' : 'Fetch Official Page'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 1: Create Franchise */}
      {activeAdminTab === 'franchises' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Add New Franchise Opportunity
          </h3>

          <form onSubmit={handleCreateFranchise} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Franchise Brand Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Blue Tokai Coffee Roasters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Sector</label>
                <select
                  value={newSectorId}
                  onChange={(e) => setNewSectorId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Sub-sector / Format</label>
                <input
                  type="text"
                  required
                  value={newSubSector}
                  onChange={(e) => setNewSubSector(e.target.value)}
                  placeholder="e.g. Artisanal Cafe & Bakery"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Headquarters City</label>
                <input
                  type="text"
                  required
                  value={newHq}
                  onChange={(e) => setNewHq(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Founded Year</label>
                <input
                  type="number"
                  required
                  value={newFounded}
                  onChange={(e) => setNewFounded(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Brand & Operational Description</label>
              <textarea
                required
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Comprehensive overview of unit economics, supply chain and consumer demographic focus..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Financial Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Total Investment (₹)</label>
                <input
                  type="number"
                  required
                  value={newInvestment}
                  onChange={(e) => setNewInvestment(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Franchise Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={newFee}
                  onChange={(e) => setNewFee(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Monthly Revenue (₹)</label>
                <input
                  type="number"
                  required
                  value={newRev}
                  onChange={(e) => setNewRev(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Monthly Profit (₹)</label>
                <input
                  type="number"
                  required
                  value={newProfit}
                  onChange={(e) => setNewProfit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Annual ROI (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newRoi}
                  onChange={(e) => setNewRoi(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Payback (Months)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newPayback}
                  onChange={(e) => setNewPayback(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Publish Franchise Record
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Verify Data Sources (Section 6) */}
      {activeAdminTab === 'verify' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Certify & Audit Verification Badges
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Update data points across the 4 forensic tiers: <strong>🟢 Verified</strong> (Official audited filings), <strong>🔵 Reported</strong> (Franchisee field survey), <strong>🟡 Estimated</strong> (Platform algorithm), or <strong>🔴 Marketing Claim</strong> (Franchisor promotional advertisement).
          </p>

          <form onSubmit={handleUpdateVerification} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Data Source Record ID</label>
              <input
                type="number"
                value={sourceId}
                onChange={(e) => setSourceId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Verification Level</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
              >
                <option value="VERIFIED">🟢 VERIFIED (Official audited & certified)</option>
                <option value="REPORTED">🔵 REPORTED (Provided by active franchisees)</option>
                <option value="ESTIMATED">🟡 ESTIMATED (Platform algorithmically derived)</option>
                <option value="MARKETING_CLAIM">🔴 MARKETING CLAIM (Promotional franchisor advertisement)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Confidence Score (0 - 100%)</label>
              <input
                type="number"
                min={20}
                max={100}
                value={confLevel}
                onChange={(e) => setConfLevel(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Source Name / Filing Reference</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Forensic Methodology Description</label>
              <textarea
                rows={3}
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Update Verification Audit & Generate Log
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Manage Sectors (Section 2) */}
      {activeAdminTab === 'sectors' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">Manage & Add Sectors</h3>
            <span className="text-xs text-slate-400">{sectors.length} Active Sectors</span>
          </div>

          <form onSubmit={handleAddSector} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Sector Name</label>
              <input
                type="text"
                required
                value={sectorName}
                onChange={(e) => setSectorName(e.target.value)}
                placeholder="e.g. Space Tech Franchises or Micro-Breweries"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Category Group</label>
              <select
                value={sectorCategory}
                onChange={(e) => setSectorCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="F&B">Food & Beverage (F&B)</option>
                <option value="Health">Healthcare & Diagnostics</option>
                <option value="Education">Education & Coaching</option>
                <option value="Wellness">Wellness & Fitness</option>
                <option value="Retail">Retail & Consumer Goods</option>
                <option value="Logistics">Logistics & Supply Chain</option>
                <option value="Services">Professional Services</option>
                <option value="CleanTech">CleanTech & EV</option>
                <option value="Industrial">Manufacturing & Distribution</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Scope & Description</label>
              <input
                type="text"
                value={sectorDesc}
                onChange={(e) => setSectorDesc(e.target.value)}
                placeholder="Brief description of business models in this sector..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Add New Sector to Platform
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Document Upload & Extraction (Section 26) */}
      {activeAdminTab === 'documents' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Document Ingestion & Automated Clause Parser</h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload franchise brochures, Franchise Disclosure Documents (FDDs), audited P&Ls, or investment agreements.
              <em> Note: As per Section 26, extracted figures are treated as REPORTED/ESTIMATED, not automatically verified without auditor stamp.</em>
            </p>
          </div>

          <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Document Classification</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="Franchise Disclosure Document (FDD)">Franchise Disclosure Document (FDD)</option>
                <option value="Audited Unit P&L Statement">Audited Unit P&L Statement</option>
                <option value="Franchise Agreement Contract">Franchise Agreement Contract</option>
                <option value="Promotional Marketing Brochure">Promotional Marketing Brochure</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Upload File (PDF / DOCX / TXT / Images)</label>
              <input
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Parse & Extract Key Financial Clauses</span>
            </button>
          </form>

          {/* Parsed Results Banner */}
          {extractedData && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Parsing Complete ({extractedData.filename})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {extractedData.extraction_status}
                </span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl space-y-2 font-mono">
                {Object.entries(extractedData.extracted_fields || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                    <span className="text-white font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                <strong>Governance Rule Applied:</strong> {extractedData.audit_note}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Live Audit Logs (Section 25 & 32) */}
      {activeAdminTab === 'audit' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Immutable Regulatory Audit Trail</span>
            </h3>
            <button 
              onClick={loadAll} 
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Entity ID</th>
                  <th className="py-2.5 px-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{l.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.action === 'CREATE' ? 'bg-emerald-500/20 text-emerald-300' :
                        l.action === 'VERIFY' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-300">{l.entity_type}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">#{l.entity_id}</td>
                    <td className="py-2.5 px-3 text-slate-300">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Customer Support Tickets */}
      {activeAdminTab === 'support' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-emerald-400" />
                <span>Customer Support Tickets & Escalation Queue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Review, respond, and update ticket lifecycle status for investor inquiries and franchise discrepancies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="ALL">All Statuses ({supportTickets.length})</option>
                <option value="OPEN">Open Only</option>
                <option value="IN_PROGRESS">In Progress Only</option>
                <option value="RESOLVED">Resolved Only</option>
                <option value="CLOSED">Closed Only</option>
              </select>

              <button
                onClick={loadAll}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tickets List */}
          {supportTickets.filter(t => ticketFilter === 'ALL' || t.status === ticketFilter).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No support tickets found matching the selected status filter.
            </div>
          ) : (
            <div className="space-y-3">
              {supportTickets
                .filter(t => ticketFilter === 'ALL' || t.status === ticketFilter)
                .map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-bold">#{ticket.id}</span>
                        <span className="font-bold text-white text-sm">{ticket.subject}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-medium">
                          {ticket.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ticket.status === 'OPEN' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {ticket.status}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(ticket.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
                      <div className="text-slate-400">
                        <span className="block text-slate-500 text-[10px] uppercase font-semibold">User</span>
                        <span className="text-white font-medium">{ticket.name || 'Investor'}</span>
                        <span className="block text-slate-400 text-[10px]">{ticket.email || 'No email provided'}</span>
                      </div>

                      <div className="md:col-span-3 text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                        <span className="block text-slate-500 text-[10px] uppercase font-semibold mb-1">Message Content</span>
                        {ticket.message}
                      </div>
                    </div>

                    {ticket.admin_notes && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300">
                        <strong>Previous Admin Note:</strong> {ticket.admin_notes}
                      </div>
                    )}

                    {/* Status Update Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                      <div className="flex-1 min-w-[240px]">
                        <input
                          type="text"
                          placeholder="Add internal resolution note (optional)..."
                          value={updatingTicketId === ticket.id ? ticketAdminNote : ''}
                          onChange={(e) => {
                            setUpdatingTicketId(ticket.id);
                            setTicketAdminNote(e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-[11px] outline-none placeholder-slate-600 focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS', ticketAdminNote)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Mark In-Progress
                        </button>
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'RESOLVED', ticketAdminNote)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'OPEN', ticketAdminNote)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] transition-colors cursor-pointer"
                        >
                          Reopen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: User Feedback */}
      {activeAdminTab === 'feedback' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <span>Investor Community Feedback & Ratings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Direct ratings, feature requests, and suggestions submitted by investors and platform users.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={feedbackCatFilter}
                onChange={(e) => setFeedbackCatFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="ALL">All Categories ({feedbackList.length})</option>
                <option value="Website/UI">Website/UI</option>
                <option value="Franchise Data">Franchise Data</option>
                <option value="Recommendations">Recommendations</option>
                <option value="Calculator">Calculator</option>
                <option value="Chatbot">Chatbot</option>
                <option value="General Experience">General Experience</option>
              </select>

              <button
                onClick={loadAll}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Feedback Cards */}
          {feedbackList.filter(f => feedbackCatFilter === 'ALL' || f.category === feedbackCatFilter).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No feedback entries found matching the selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackList
                .filter(f => feedbackCatFilter === 'ALL' || f.category === feedbackCatFilter)
                .map((fb) => (
                  <div key={fb.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                          />
                        ))}
                        <span className="font-bold text-white text-xs ml-1.5">{fb.rating}/5</span>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-medium">
                        {fb.category}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-xs">{fb.message}</p>

                    {fb.suggestion && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-emerald-300">
                        <strong className="text-slate-400 block text-[10px] uppercase font-semibold">User Suggestion</strong>
                        {fb.suggestion}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                      <span>By: <strong className="text-slate-400">{fb.name || 'Investor'}</strong> ({fb.email || 'Anonymous'})</span>
                      <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
