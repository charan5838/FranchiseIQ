import React, { useState, useEffect } from 'react';
import { 
  Scale, ArrowRight, CheckCircle2, Sparkles, X, 
  TrendingUp, Award, DollarSign, Clock, ShieldCheck, Plus
} from 'lucide-react';
import { api } from '../services/api';
import { useInvestor } from '../context/InvestorContext';
import { FranchiseSummary } from '../types';

interface FranchiseCompareProps {
  setCurrentPage: (page: string) => void;
  setSelectedFranchiseId: (id: number) => void;
}

export const FranchiseCompare: React.FC<FranchiseCompareProps> = ({ setCurrentPage, setSelectedFranchiseId }) => {
  const { comparisonList, toggleComparison, clearComparison } = useInvestor();
  const [comparedData, setComparedData] = useState<{ franchises: any[]; best_highlights: Record<string, number> } | null>(null);
  const [availableFranchises, setAvailableFranchises] = useState<FranchiseSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getFranchises().then(setAvailableFranchises).catch(console.error);
  }, []);

  useEffect(() => {
    if (comparisonList.length >= 2) {
      setLoading(true);
      api.compareFranchises(comparisonList)
        .then(setComparedData)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setComparedData(null);
    }
  }, [comparisonList]);

  if (comparisonList.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Compare Franchises Side-by-Side</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Please select at least 2 franchises (up to 5) to evaluate unit economics, payback horizons, royalties, and forensic risk matrices side-by-side.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              // Pre-select top 3 recommended
              [1, 2, 3].forEach(id => {
                if (!comparisonList.includes(id)) toggleComparison(id);
              });
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Compare Top 3 Benchmark Franchises
          </button>
          <button
            onClick={() => setCurrentPage('explore')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Browse Franchise Catalog
          </button>
        </div>
      </div>
    );
  }

  const { franchises = [], best_highlights = {} } = comparedData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5" /> Side-by-Side Comparison Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Multi-Franchise Forensic Matrix ({franchises.length} Selected)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearComparison}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Clear Selection
          </button>
          <button
            onClick={() => setCurrentPage('explore')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-blue-200 dark:border-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Franchise</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-xs">Generating comparative metrics...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-4 w-48 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  Metrics & Attributes
                </th>
                {franchises.map((f: any) => (
                  <th key={f.id} className="py-4 px-4 min-w-[200px] align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 
                          onClick={() => {
                            setSelectedFranchiseId(f.id);
                            setCurrentPage('detail');
                          }}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                        >
                          {f.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.sector} • {f.sub_sector}</p>
                      </div>
                      <button
                        onClick={() => toggleComparison(f.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Total Investment */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Total Capital Outlay</td>
                {franchises.map((f: any) => {
                  const isBest = best_highlights.lowest_investment_id === f.id;
                  return (
                    <td key={f.id} className="py-3 px-4">
                      <span className={`font-bold ${isBest ? 'text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        ₹{(f.total_investment / 100000).toFixed(1)} Lakhs
                      </span>
                      {isBest && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30">Lowest</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Franchise Fee */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Upfront Franchise Fee</td>
                {franchises.map((f: any) => (
                  <td key={f.id} className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    ₹{(f.franchise_fee / 100000).toFixed(1)} Lakhs
                  </td>
                ))}
              </tr>

              {/* Royalty % */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Royalty Burden</td>
                {franchises.map((f: any) => {
                  const isBest = best_highlights.lowest_royalty_id === f.id;
                  return (
                    <td key={f.id} className="py-3 px-4">
                      <span className={`font-semibold ${isBest ? 'text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {f.royalty_pct}% of Gross Sales
                      </span>
                      {isBest && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30">Best</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Monthly Revenue */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Verified Monthly Revenue</td>
                {franchises.map((f: any) => (
                  <td key={f.id} className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                    ₹{(f.monthly_revenue / 100000).toFixed(1)} Lakhs
                  </td>
                ))}
              </tr>

              {/* Monthly Net Profit */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Monthly Net Cash Profit</td>
                {franchises.map((f: any) => {
                  const isBest = best_highlights.highest_profit_id === f.id;
                  return (
                    <td key={f.id} className="py-3 px-4">
                      <span className={`font-bold ${isBest ? 'text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        ₹{f.monthly_profit.toLocaleString('en-IN')}
                      </span>
                      {isBest && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30">Highest</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Net Margin */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Net Profit Margin</td>
                {franchises.map((f: any) => (
                  <td key={f.id} className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {f.net_margin_pct}%
                  </td>
                ))}
              </tr>

              {/* Annual ROI */}
              <tr className="hover:bg-slate-800/30 bg-emerald-950/10">
                <td className="py-3.5 px-4 font-bold text-emerald-400">Annual ROI (%)</td>
                {franchises.map((f: any) => {
                  const isBest = best_highlights.highest_roi_id === f.id;
                  return (
                    <td key={f.id} className="py-3.5 px-4">
                      <span className={`font-black text-sm ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                        {f.roi_annual}% / yr
                      </span>
                      {isBest && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Top ROI</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Payback Months */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Payback Horizon</td>
                {franchises.map((f: any) => {
                  const isBest = best_highlights.fastest_payback_id === f.id;
                  return (
                    <td key={f.id} className="py-3 px-4">
                      <span className={`font-bold ${isBest ? 'text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {f.payback_months} Months
                      </span>
                      {isBest && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">Fastest</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Risk Assessment */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Risk Score</td>
                {franchises.map((f: any) => {
                  const isBest = best_highlights.lowest_risk_id === f.id;
                  return (
                    <td key={f.id} className="py-3 px-4">
                      <span className={`font-semibold ${
                        f.risk_tier === 'Low Risk' ? 'text-emerald-400' : f.risk_tier === 'Medium Risk' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {f.risk_tier} ({f.risk_score}/100)
                      </span>
                      {isBest && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30">Safest</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Location Score */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Location Score (Avg)</td>
                {franchises.map((f: any) => (
                  <td key={f.id} className="py-3 px-4 text-slate-300 font-semibold">
                    {f.location_score}/100
                  </td>
                ))}
              </tr>

              {/* Growth Score */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Growth Score</td>
                {franchises.map((f: any) => (
                  <td key={f.id} className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {f.growth_score}/100
                  </td>
                ))}
              </tr>

              {/* Total Outlets & Closure Rate */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Network Stability</td>
                {franchises.map((f: any) => (
                  <td key={f.id} className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {f.total_outlets} units ({f.closure_rate_pct}% closure)
                  </td>
                ))}
              </tr>

              {/* Franchisee Satisfaction */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Franchisee Satisfaction</td>
                {franchises.map((f: any) => {
                  const isBest = best_highlights.highest_satisfaction_id === f.id;
                  return (
                    <td key={f.id} className="py-3 px-4">
                      <span className={`font-bold ${isBest ? 'text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {f.franchisee_satisfaction}/100
                      </span>
                      {isBest && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30">Highest</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Actions */}
              <tr>
                <td className="py-4 px-4 font-semibold text-slate-400">Deep Dive</td>
                {franchises.map((f: any) => (
                  <td key={f.id} className="py-4 px-4">
                    <button
                      onClick={() => {
                        setSelectedFranchiseId(f.id);
                        setCurrentPage('detail');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full P&L</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
