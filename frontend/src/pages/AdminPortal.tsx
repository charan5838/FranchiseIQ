import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Upload, CheckCircle2, FileText, 
  History, AlertCircle, RefreshCw, FolderPlus, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { Sector, FranchiseSummary } from '../types';

export const AdminPortal: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'franchises' | 'verify' | 'sectors' | 'documents' | 'audit'>('franchises');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [franchises, setFranchises] = useState<FranchiseSummary[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
      api.getAuditLogs().catch(() => [])
    ]).then(([sData, fData, aData]) => {
      setSectors(sData);
      setFranchises(fData);
      setAuditLogs(aData);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

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

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'franchises', label: 'Create Franchise', icon: Plus },
          { id: 'verify', label: 'Verify Data Sources', icon: CheckCircle2 },
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

      {/* Tab 1: Create Franchise */}
      {activeAdminTab === 'franchises' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm max-w-4xl space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Sector</label>
                <select
                  value={newSectorId}
                  onChange={(e) => setNewSectorId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Headquarters City</label>
                <input
                  type="text"
                  required
                  value={newHq}
                  onChange={(e) => setNewHq(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Founded Year</label>
                <input
                  type="number"
                  required
                  value={newFounded}
                  onChange={(e) => setNewFounded(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Franchise Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={newFee}
                  onChange={(e) => setNewFee(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Monthly Revenue (₹)</label>
                <input
                  type="number"
                  required
                  value={newRev}
                  onChange={(e) => setNewRev(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Monthly Profit (₹)</label>
                <input
                  type="number"
                  required
                  value={newProfit}
                  onChange={(e) => setNewProfit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Verification Level</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-semibold"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Source Name / Filing Reference</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Forensic Methodology Description</label>
              <textarea
                rows={3}
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white"
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Category Group</label>
              <select
                value={sectorCategory}
                onChange={(e) => setSectorCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
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
                  <div key={k} className="flex justify-between border-b border-slate-800 pb-1">
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
    </div>
  );
};
