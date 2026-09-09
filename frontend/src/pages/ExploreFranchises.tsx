import React, { useState, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Building2, 
  Scale, ArrowRight, ShieldCheck, Check, AlertCircle, X
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

  const { toggleComparison, comparisonList } = useInvestor();

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
    api.getSectors().then(setSectors).catch(console.error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Description */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Explore Franchise Opportunities</h1>
        <p className="text-slate-400 text-sm mt-1">
          Screen the full verified franchise catalog using multi-attribute filters across investment bounds, required space, royalties, and forensic risk tiers.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand name, sub-sector, or headquarters..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <select
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value ? Number(e.target.value) : '')}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none"
          >
            <option value="">All Sectors ({sectors.length})</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={riskTier}
            onChange={(e) => setRiskTier(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none"
          >
            <option value="">All Risk Tiers</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none"
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
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {franchises.map((f) => {
          const isCompared = comparisonList.includes(f.id);

          return (
            <div
              key={f.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-slate-950"
            >
              <div>
                {/* Badges Bar */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
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
                  className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {f.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{f.sub_sector}</p>

                {/* Financial Summary Box */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs mt-4">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Investment</span>
                    <span className="text-slate-200 font-bold">₹{(f.total_investment/100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Annual ROI</span>
                    <span className="text-emerald-400 font-bold">{f.roi_annual}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Monthly Net Profit</span>
                    <span className="text-slate-200 font-semibold">₹{(f.monthly_profit/1000).toFixed(0)}k</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Est. Payback</span>
                    <span className="text-slate-200 font-semibold">{f.payback_months} Months</span>
                  </div>
                </div>

                {/* Secondary details */}
                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
                  <span>Outlets: <strong className="text-slate-300">{f.total_outlets}</strong> ({f.closure_rate_pct}% closure)</span>
                  <span className={`font-semibold ${
                    f.risk_tier === 'Low Risk' ? 'text-emerald-400' : f.risk_tier === 'Medium Risk' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {f.risk_tier}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => toggleComparison(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    isCompared 
                      ? 'bg-emerald-500 text-slate-950 font-bold' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCompared ? 'Compared' : '+ Compare'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedFranchiseId(f.id);
                    setCurrentPage('detail');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Detailed Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
