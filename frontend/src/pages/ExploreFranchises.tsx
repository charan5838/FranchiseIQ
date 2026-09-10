import React, { useState, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Building2, 
  Scale, ArrowRight, ShieldCheck, Check, AlertCircle, X,
  Plus, BookmarkCheck, Sparkles, CheckCircle2, DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { FranchiseSummary, Sector } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';
import { useInvestor } from '../context/InvestorContext';

interface ExploreFranchisesProps {
  setCurrentPage: (page: string) => void;
  setSelectedFranchiseId: (id: number) => void;
}

export const ExploreFranchises: React.FC<ExploreFranchisesProps> = ({ setCurrentPage, setSelectedFranchiseId }) => {
  const [franchises, setFranchises] = useState<FranchiseSummary[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [sectorId, setSectorId] = useState<number | ''>('');
  const [maxInvestment, setMaxInvestment] = useState<number>(100); // in Lakhs
  const [minRoi, setMinRoi] = useState<number>(30); // in %
  const [maxPayback, setMaxPayback] = useState<number>(36); // in months
  const [riskTier, setRiskTier] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('roi_desc');

  // List Your Franchise Modal State
  const [showListModal, setShowListModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [listingSuccess, setListingSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sector_id: 1,
    sub_sector: '',
    headquarters: 'Hyderabad',
    total_investment_lakhs: 25,
    franchise_fee_lakhs: 5,
    monthly_revenue: 500000,
    monthly_profit: 90000,
    franchise_model: 'FOFO',
    space_min_sqft: 400,
    space_max_sqft: 800,
    description: '',
    contact_email: '',
    contact_phone: ''
  });

  const { toggleComparison, comparisonList, toggleWatchlist, isWatched } = useInvestor();

  const fetchFranchises = () => {
    setLoading(true);
    api.getFranchises({
      search: search || undefined,
      sector_id: sectorId || undefined,
      max_investment: maxInvestment ? maxInvestment * 100000 : undefined,
      min_roi: minRoi || undefined,
      max_payback: maxPayback || undefined,
      risk_level: riskTier || undefined,
      sort_by: sortBy
    }).then(setFranchises)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getSectors().then(s => {
      setSectors(s);
      if (s.length > 0 && formData.sector_id === 1) {
        setFormData(prev => ({ ...prev, sector_id: s[0].id }));
      }
    }).catch(console.error);
    fetchFranchises();
  }, [sectorId, maxInvestment, minRoi, maxPayback, riskTier, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFranchises();
  };

  const resetFilters = () => {
    setSearch('');
    setSectorId('');
    setMaxInvestment(100);
    setMinRoi(30);
    setMaxPayback(36);
    setRiskTier('');
    setSortBy('roi_desc');
  };

  const handleSubmitFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sub_sector.trim()) {
      alert('Please enter Brand Name and Category.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitFranchise({
        name: formData.name.trim(),
        sector_id: Number(formData.sector_id),
        sub_sector: formData.sub_sector.trim(),
        description: formData.description.trim() || `${formData.name} is an active franchise opportunity with attractive unit economics.`,
        headquarters: formData.headquarters.trim(),
        franchise_model: formData.franchise_model,
        total_investment: Number(formData.total_investment_lakhs) * 100000,
        franchise_fee: Number(formData.franchise_fee_lakhs) * 100000,
        monthly_revenue: Number(formData.monthly_revenue),
        monthly_profit: Number(formData.monthly_profit),
        space_min_sqft: Number(formData.space_min_sqft),
        space_max_sqft: Number(formData.space_max_sqft),
        contact_email: formData.contact_email.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined
      });

      setListingSuccess(`"${formData.name}" listed successfully! Added with REPORTED status to catalog.`);
      setShowListModal(false);
      setFormData({
        name: '',
        sector_id: sectors[0]?.id || 1,
        sub_sector: '',
        headquarters: 'Hyderabad',
        total_investment_lakhs: 25,
        franchise_fee_lakhs: 5,
        monthly_revenue: 500000,
        monthly_profit: 90000,
        franchise_model: 'FOFO',
        space_min_sqft: 400,
        space_max_sqft: 800,
        description: '',
        contact_email: '',
        contact_phone: ''
      });
      fetchFranchises();
      setTimeout(() => setListingSuccess(''), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit franchise listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Explore Franchise Opportunities</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Screen the verified catalog using investment bounds, required space, royalties, and forensic risk tiers.
          </p>
        </div>

        {/* List Your Franchise Action Button */}
        <button
          onClick={() => setShowListModal(true)}
          className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>List Your Franchise</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {listingSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 rounded-xl p-3.5 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{listingSuccess}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand name, sub-sector, or headquarters..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <select
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value ? Number(e.target.value) : '')}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 outline-none"
          >
            <option value="">All Sectors ({sectors.length})</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={riskTier}
            onChange={(e) => setRiskTier(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 outline-none"
          >
            <option value="">All Risk Tiers</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 outline-none"
          >
            <option value="roi_desc">Sort: Highest ROI</option>
            <option value="roi_asc">Sort: Lowest ROI</option>
            <option value="investment_asc">Sort: Lowest Investment</option>
            <option value="investment_desc">Sort: Highest Investment</option>
            <option value="payback_asc">Sort: Fastest Payback</option>
            <option value="risk_asc">Sort: Lowest Risk Score</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            Reset
          </button>
        </form>

        {/* Sliders Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 border-t border-slate-800/80 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Max Investment:</span>
              <span className="text-emerald-400 font-bold">₹{maxInvestment} Lakhs</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={maxInvestment}
              onChange={(e) => setMaxInvestment(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Min Annual ROI:</span>
              <span className="text-indigo-400 font-bold">{minRoi}% / year</span>
            </div>
            <input
              type="range"
              min={15}
              max={80}
              step={5}
              value={minRoi}
              onChange={(e) => setMinRoi(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Max Payback Period:</span>
              <span className="text-amber-400 font-bold">{maxPayback} Months</span>
            </div>
            <input
              type="range"
              min={12}
              max={48}
              step={3}
              value={maxPayback}
              onChange={(e) => setMaxPayback(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing <strong className="text-white">{franchises.length}</strong> matching franchise investments</span>
        {comparisonList.length > 0 && (
          <button
            onClick={() => setCurrentPage('compare')}
            className="text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Compare {comparisonList.length} Selected Franchises</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Franchises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {franchises.map((f) => {
          const isCompared = comparisonList.includes(f.id);
          const watched = isWatched(f.id);

          return (
            <div
              key={f.id}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                {/* Badges Bar */}
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-semibold">
                    {f.sector_name}
                  </span>
                  <VerificationBadge sourceType={f.primary_data_source} confidence={f.data_confidence} size="sm" />
                </div>

                {/* Name & Sub-sector */}
                <h3 
                  onClick={() => {
                    setSelectedFranchiseId(f.id);
                    setCurrentPage('detail');
                  }}
                  className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {f.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{f.sub_sector} • {f.headquarters}</p>

                {/* Financial Summary Box */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/70 text-xs mt-3.5">
                  <div>
                    <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Total Investment</span>
                    <span className="text-slate-900 dark:text-slate-200 font-bold">₹{(f.total_investment/100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Annual ROI</span>
                    <span className="text-indigo-400 font-bold">{f.roi_annual}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Monthly Net Profit</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{(f.monthly_profit/1000).toFixed(0)}k</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-500 block text-[10px]">Est. Payback</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{f.payback_months} Months</span>
                  </div>
                </div>

                {/* Secondary details */}
                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2.5 border-t border-slate-800/60">
                  <span>Outlets: <strong className="text-slate-300">{f.total_outlets}</strong> ({f.closure_rate_pct}% churn)</span>
                  <span className={`font-semibold ${
                    f.risk_tier === 'Low Risk' ? 'text-emerald-600 dark:text-emerald-400' : f.risk_tier === 'Medium Risk' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {f.risk_tier}
                  </span>
                </div>
              </div>

              {/* Actions Footer: Compare, Watchlist, Deep Dive */}
              <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-slate-800/70">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleComparison(f.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      isCompared 
                        ? 'bg-emerald-500 text-slate-950 font-bold' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'Compared' : 'Compare'}</span>
                  </button>

                  <button
                    onClick={() => toggleWatchlist(f.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      watched
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                    title={watched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <BookmarkCheck className={`w-3.5 h-3.5 ${watched ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                    <span>{watched ? 'Saved' : 'Watch'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedFranchiseId(f.id);
                    setCurrentPage('detail');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIST YOUR FRANCHISE MODAL */}
      {showListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">List Your Franchise Opportunity</h3>
                  <p className="text-xs text-slate-400">Add your brand to the verified investor directory with REPORTED status</p>
                </div>
              </div>
              <button 
                onClick={() => setShowListModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFranchise} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Franchise Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Roastery Coffee Bar"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Sector *</label>
                  <select
                    value={formData.sector_id}
                    onChange={(e) => setFormData({ ...formData, sector_id: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Sub-sector / Concept *</label>
                  <input
                    type="text"
                    required
                    value={formData.sub_sector}
                    onChange={(e) => setFormData({ ...formData, sub_sector: e.target.value })}
                    placeholder="e.g. Specialty Artisanal Cafe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Headquarters City *</label>
                  <input
                    type="text"
                    required
                    value={formData.headquarters}
                    onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Total Investment (₹ L)</label>
                  <input
                    type="number"
                    min={2}
                    value={formData.total_investment_lakhs}
                    onChange={(e) => setFormData({ ...formData, total_investment_lakhs: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Franchise Fee (₹ L)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.franchise_fee_lakhs}
                    onChange={(e) => setFormData({ ...formData, franchise_fee_lakhs: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Monthly Rev (₹)</label>
                  <input
                    type="number"
                    min={10000}
                    value={formData.monthly_revenue}
                    onChange={(e) => setFormData({ ...formData, monthly_revenue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Monthly Profit (₹)</label>
                  <input
                    type="number"
                    min={5000}
                    value={formData.monthly_profit}
                    onChange={(e) => setFormData({ ...formData, monthly_profit: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Franchise Model</label>
                  <select
                    value={formData.franchise_model}
                    onChange={(e) => setFormData({ ...formData, franchise_model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  >
                    <option value="FOFO">FOFO (Franchise Owned, Franchise Operated)</option>
                    <option value="FOCO">FOCO (Franchise Owned, Company Operated)</option>
                    <option value="FICO">FICO (Franchise Invested, Company Operated)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Min Area (sq ft)</label>
                  <input
                    type="number"
                    value={formData.space_min_sqft}
                    onChange={(e) => setFormData({ ...formData, space_min_sqft: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Max Area (sq ft)</label>
                  <input
                    type="number"
                    value={formData.space_max_sqft}
                    onChange={(e) => setFormData({ ...formData, space_max_sqft: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Brand Pitch & Overview</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline key customer appeal, supply chain support, typical break-even horizon, and why an investor should partner with your brand."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="franchising@brand.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowListModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Publish Franchise Listing</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
