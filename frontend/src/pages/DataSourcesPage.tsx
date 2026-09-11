import React, { useState, useEffect } from 'react';
import { 
  Globe, ExternalLink, RefreshCw, Shield, AlertTriangle, 
  CheckCircle2, Clock, Search, Filter, Database, FileText, X, ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FranchiseSourceItem, DataQualitySummary } from '../types';

interface DataSourcesPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedFranchiseId?: (id: number) => void;
}

export const DataSourcesPage: React.FC<DataSourcesPageProps> = ({ setCurrentPage, setSelectedFranchiseId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'host';

  const [sources, setSources] = useState<FranchiseSourceItem[]>([]);
  const [summary, setSummary] = useState<DataQualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Refresh state
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<{ id: number; text: string; type: 'success' | 'error' } | null>(null);

  // Modal for inspecting observation audit trail
  const [selectedAuditFranchise, setSelectedAuditFranchise] = useState<{ id: number; name: string } | null>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [srcData, sumData] = await Promise.all([
        api.getDataSources(),
        api.getDataQualitySummary().catch(() => null)
      ]);
      setSources(srcData);
      setSummary(sumData);
    } catch (err) {
      console.error('Failed to load data sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefreshSingle = async (franchiseId: number) => {
    if (refreshingId !== null) return;
    setRefreshingId(franchiseId);
    setRefreshMessage(null);
    try {
      const res = await api.refreshOfficialFranchiseData(franchiseId);
      const statusText = res.status === 'SUCCESS' 
        ? `Successfully fetched! ${res.fields_updated} fields updated from official website.`
        : `Fetch status: ${res.status}. ${res.error || res.message || 'Preserved previous stored values.'}`;
      
      setRefreshMessage({
        id: franchiseId,
        text: statusText,
        type: res.status === 'SUCCESS' ? 'success' : 'error'
      });
      // Reload sources to reflect update
      const updated = await api.getDataSources();
      setSources(updated);
      const sumUpdated = await api.getDataQualitySummary().catch(() => null);
      setSummary(sumUpdated);
    } catch (err: any) {
      setRefreshMessage({
        id: franchiseId,
        text: err.message || 'Refresh failed',
        type: 'error'
      });
    } finally {
      setRefreshingId(null);
    }
  };

  const handleOpenAuditModal = async (franchiseId: number, name: string) => {
    setSelectedAuditFranchise({ id: franchiseId, name });
    setLoadingAudit(true);
    try {
      const res = await api.getFranchiseObservations(franchiseId);
      setObservations(res.observations || []);
    } catch (err) {
      console.error('Failed to load observations:', err);
      setObservations([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const filteredSources = sources.filter(s => {
    const matchesSearch = s.franchise_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.sector_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.official_website.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'LIVE') return s.source_mode === 'LIVE';
    if (statusFilter === 'DEMO') return s.source_mode === 'DEMO';
    if (statusFilter === 'SUCCESS') return s.fetch_status === 'SUCCESS';
    if (statusFilter === 'ISSUES') return ['BLOCKED', 'UNAVAILABLE', 'TIMEOUT', 'NOT_FOUND'].includes(s.fetch_status);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Strict Official Website Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Official Data Sources & Provenance
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            FranchiseIQ strictly queries individual official company websites only. Financial earning representations are tagged as <strong className="text-amber-400 font-semibold">Marketing Claims</strong> to prevent misinformation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh View</span>
          </button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 font-medium">Total Franchises</span>
            <div className="text-xl font-bold text-white mt-1">{summary.total_franchises}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">12 Sectors</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 font-medium">Live Official Sources</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{summary.live_sources}</div>
            <span className="text-[10px] text-emerald-500/80 mt-0.5 block">Configured & active</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 font-medium">Successfully Fetched</span>
            <div className="text-xl font-bold text-cyan-400 mt-1">{summary.successfully_fetched}</div>
            <span className="text-[10px] text-cyan-500/80 mt-0.5 block">Live normalized data</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 font-medium">Marketing Claims</span>
            <div className="text-xl font-bold text-amber-400 mt-1">{summary.marketing_claims}</div>
            <span className="text-[10px] text-amber-500/80 mt-0.5 block">Classified claims</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 font-medium">Estimated / Demo</span>
            <div className="text-xl font-bold text-purple-400 mt-1">{summary.estimated_values}</div>
            <span className="text-[10px] text-purple-400/80 mt-0.5 block">Fallback benchmarks</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] text-slate-400 font-medium">Sync Schedule</span>
            <div className="text-sm font-bold text-slate-200 mt-2">Every {summary.refresh_interval_hours} Hours</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{summary.last_refresh}</span>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search franchise or official URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Sources' },
            { id: 'LIVE', label: '🟢 Live Official' },
            { id: 'SUCCESS', label: '✔ Verified Fetched' },
            { id: 'DEMO', label: '🟡 Demo Fallback' },
            { id: 'ISSUES', label: '⚠️ Unavailable' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sources Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Franchise</th>
                <th className="py-3.5 px-4">Official Source</th>
                <th className="py-3.5 px-4">Source Type</th>
                <th className="py-3.5 px-4">Information / Partner URL</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Status & Mode</th>
                <th className="py-3.5 px-4">Last Checked</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading official sources and provenance telemetry...</p>
                  </td>
                </tr>
              ) : filteredSources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No franchise sources matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSources.map((s) => {
                  const isRefreshingThis = refreshingId === s.franchise_id;
                  const isSuccess = s.fetch_status === 'SUCCESS';
                  const isLive = s.source_mode === 'LIVE';

                  return (
                    <tr key={s.franchise_id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Franchise Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <button
                            onClick={() => {
                              if (setSelectedFranchiseId) setSelectedFranchiseId(s.franchise_id);
                              setCurrentPage('detail');
                            }}
                            className="font-bold text-white hover:text-emerald-400 transition-colors text-left flex items-center gap-1 cursor-pointer"
                          >
                            <span>{s.franchise_name}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-60" />
                          </button>
                          <span className="text-[10px] text-slate-400">{s.sector_name}</span>
                        </div>
                      </td>

                      {/* Official Source */}
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {s.source_name}
                      </td>

                      {/* Source Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                          {s.source_type}
                        </span>
                      </td>

                      {/* Clickable URL */}
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <a
                          href={s.franchise_information_url || s.official_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5 font-mono text-[11px]"
                          title={s.franchise_information_url || s.official_website}
                        >
                          <span className="truncate">{s.franchise_information_url || s.official_website}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      {/* Classification */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          s.data_classification === 'MARKETING_CLAIM'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {s.data_classification}
                        </span>
                      </td>

                      {/* Status & Mode */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                            isSuccess 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : s.fetch_status === 'PARTIAL_SUCCESS'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : s.fetch_status === 'DEMO'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {isSuccess ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                            <span>{s.fetch_status}</span>
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                            Mode: {s.source_mode}
                          </span>
                        </div>
                      </td>

                      {/* Last Checked */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {s.last_updated}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAuditModal(s.franchise_id, s.franchise_name)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Inspect historical observations and values"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Audit Trail ({s.observations_count})</span>
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleRefreshSingle(s.franchise_id)}
                              disabled={isRefreshingThis}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                              title="Fetch live updates from official website"
                            >
                              <RefreshCw className={`w-3 h-3 ${isRefreshingThis ? 'animate-spin' : ''}`} />
                              <span>{isRefreshingThis ? 'Fetching...' : 'Refresh'}</span>
                            </button>
                          )}
                        </div>

                        {refreshMessage && refreshMessage.id === s.franchise_id && (
                          <div className={`mt-1.5 text-[10px] text-right font-medium ${
                            refreshMessage.type === 'success' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {refreshMessage.text}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Observation Audit Trail */}
      {selectedAuditFranchise && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1626] border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Data Observation History & Provenance</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Franchise: <strong className="text-white">{selectedAuditFranchise.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedAuditFranchise(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {loadingAudit ? (
                <div className="py-12 text-center text-slate-500">
                  <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs">Querying observation logs...</p>
                </div>
              ) : observations.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">
                  No historical observations recorded yet for this franchise.
                </div>
              ) : (
                <div className="space-y-3">
                  {observations.map((obs) => (
                    <div key={obs.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                          {obs.field_name.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            obs.data_classification === 'MARKETING_CLAIM'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {obs.data_classification}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {obs.fetched_at}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Raw Text As Extracted:</span>
                          <span className="text-slate-200 font-medium">{obs.original_value}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Normalized System Value:</span>
                          <span className="text-white font-mono font-bold">
                            {obs.normalized_value ? `₹${Number(obs.normalized_value).toLocaleString('en-IN')}` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60">
                        <span className="truncate max-w-sm">Source: {obs.source_url}</span>
                        <span className="text-slate-400 font-medium">Confidence: {obs.confidence_score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setSelectedAuditFranchise(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
