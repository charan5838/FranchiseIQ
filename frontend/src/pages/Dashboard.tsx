import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Shield, Zap, DollarSign, Clock, Award, 
  ArrowRight, Sparkles, Filter, CheckCircle2, AlertCircle, BarChart3, PieChart as PieIcon
} from 'lucide-react';
import { api } from '../services/api';
import { FranchiseSummary, Sector } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';
import { SectorProfitLeaders } from '../components/SectorProfitLeaders';
import { useInvestor } from '../context/InvestorContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Cell
} from 'recharts';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedFranchiseId: (id: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage, setSelectedFranchiseId }) => {
  const [franchises, setFranchises] = useState<FranchiseSummary[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const { toggleComparison, comparisonList } = useInvestor();

  useEffect(() => {
    Promise.all([
      api.getFranchises(),
      api.getSectors()
    ]).then(([fData, sData]) => {
      setFranchises(fData);
      setSectors(sData);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Top highlight franchises
  const bestRoi = [...franchises].sort((a, b) => b.roi_annual - a.roi_annual)[0];
  const lowestRisk = [...franchises].sort((a, b) => a.risk_score - b.risk_score)[0];
  const fastestPayback = [...franchises].sort((a, b) => a.payback_months - b.payback_months)[0];
  const lowestInvestment = [...franchises].sort((a, b) => a.total_investment - b.total_investment)[0];
  const highestGrowth = [...franchises].sort((a, b) => b.expansion_rate - a.expansion_rate)[0];
  const recommended = franchises[0]; // top ranked

  // Chart data: Top 8 by ROI
  const chartData = [...franchises]
    .sort((a, b) => b.roi_annual - a.roi_annual)
    .slice(0, 8)
    .map(f => ({
      name: f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name,
      fullName: f.name,
      roi: f.roi_annual,
      investment: Math.round(f.total_investment / 100000),
      payback: f.payback_months,
      profit: Math.round(f.monthly_profit / 1000)
    }));

  const filteredFranchises = selectedSector
    ? franchises.filter(f => f.sector_id === selectedSector)
    : franchises;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading financial intelligence dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Welcome & Positioning Banner - Minimal & Clean */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 sm:p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Financial Intelligence Active</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Which franchise is financially most suitable for you, and <span className="text-emerald-400">why?</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
            Eliminate promotional guesswork. Compare verified unit economics, forensic claim gaps, 5-year historical trends, and location catchment demand.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={() => setCurrentPage('advisor')}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage('calculator')}
              className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-all border border-slate-700/60 cursor-pointer"
            >
              Unit Economics Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Top Profitable Franchises Across Every Sector */}
      <SectorProfitLeaders 
        setCurrentPage={setCurrentPage} 
        setSelectedFranchiseId={setSelectedFranchiseId} 
      />

      {/* 6 Category Intelligence Cards (Section 23) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Category Leaders & Benchmark Cards</span>
          </h2>
          <span className="text-xs text-slate-400">Evaluated across 22 operational dimensions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Recommended Overall */}
          {recommended && (
            <div 
              onClick={() => {
                setSelectedFranchiseId(recommended.id);
                setCurrentPage('detail');
              }}
              className="bg-slate-900/30 border border-slate-800/60 hover:border-emerald-500/40 p-4 sm:p-5 rounded-xl transition-all cursor-pointer group shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1 border border-emerald-500/20 text-[11px]">
                  <Sparkles className="w-3 h-3" /> Recommended
                </span>
                <VerificationBadge sourceType={recommended.primary_data_source} confidence={recommended.data_confidence} size="sm" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{recommended.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{recommended.sub_sector}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Investment</span>
                  <span className="text-slate-200 font-bold">₹{(recommended.total_investment/100000).toFixed(1)}L</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Est. ROI</span>
                  <span className="text-emerald-400 font-bold">{recommended.roi_annual}% / yr</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payback</span>
                  <span className="text-slate-300 font-medium">{recommended.payback_months} mo</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Risk Tier</span>
                  <span className="text-emerald-400 font-medium">{recommended.risk_tier}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Best ROI */}
          {bestRoi && (
            <div 
              onClick={() => {
                setSelectedFranchiseId(bestRoi.id);
                setCurrentPage('detail');
              }}
              className="bg-slate-900/30 border border-slate-800/60 hover:border-indigo-500/40 p-4 sm:p-5 rounded-xl transition-all cursor-pointer group shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-semibold flex items-center gap-1 border border-indigo-500/20 text-[11px]">
                  <TrendingUp className="w-3 h-3" /> Best ROI
                </span>
                <VerificationBadge sourceType={bestRoi.primary_data_source} confidence={bestRoi.data_confidence} size="sm" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">{bestRoi.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{bestRoi.sub_sector}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Annual ROI</span>
                  <span className="text-indigo-400 font-bold">{bestRoi.roi_annual}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Monthly Profit</span>
                  <span className="text-slate-200 font-bold">₹{(bestRoi.monthly_profit/1000).toFixed(0)}k</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Investment</span>
                  <span className="text-slate-300 font-medium">₹{(bestRoi.total_investment/100000).toFixed(1)}L</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payback</span>
                  <span className="text-slate-300 font-medium">{bestRoi.payback_months} mo</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Lowest Risk */}
          {lowestRisk && (
            <div 
              onClick={() => {
                setSelectedFranchiseId(lowestRisk.id);
                setCurrentPage('detail');
              }}
              className="bg-slate-900/30 border border-slate-800/60 hover:border-emerald-500/40 p-4 sm:p-5 rounded-xl transition-all cursor-pointer group shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold flex items-center gap-1 border border-emerald-500/20 text-[11px]">
                  <Shield className="w-3 h-3" /> Lowest Risk
                </span>
                <span className="text-emerald-400 font-bold text-xs">{lowestRisk.risk_score}/100</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{lowestRisk.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{lowestRisk.sub_sector}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Risk Level</span>
                  <span className="text-emerald-400 font-bold">{lowestRisk.risk_tier}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Closure Rate</span>
                  <span className="text-slate-200 font-bold">{lowestRisk.closure_rate_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Outlets</span>
                  <span className="text-slate-300 font-medium">{lowestRisk.total_outlets}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Royalty</span>
                  <span className="text-slate-300 font-medium">{lowestRisk.royalty_pct}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Fastest Payback */}
          {fastestPayback && (
            <div 
              onClick={() => {
                setSelectedFranchiseId(fastestPayback.id);
                setCurrentPage('detail');
              }}
              className="bg-slate-900/30 border border-slate-800/60 hover:border-amber-500/40 p-4 sm:p-5 rounded-xl transition-all cursor-pointer group shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold flex items-center gap-1 border border-amber-500/20 text-[11px]">
                  <Clock className="w-3 h-3" /> Fastest Payback
                </span>
                <span className="text-amber-400 font-bold text-xs">{fastestPayback.payback_months} mo</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{fastestPayback.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{fastestPayback.sub_sector}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Payback Period</span>
                  <span className="text-amber-400 font-bold">{fastestPayback.payback_months} Months</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Annual ROI</span>
                  <span className="text-slate-200 font-bold">{fastestPayback.roi_annual}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Monthly Profit</span>
                  <span className="text-slate-300 font-medium">₹{(fastestPayback.monthly_profit/1000).toFixed(0)}k</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Investment</span>
                  <span className="text-slate-300 font-medium">₹{(fastestPayback.total_investment/100000).toFixed(1)}L</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Lowest Investment */}
          {lowestInvestment && (
            <div 
              onClick={() => {
                setSelectedFranchiseId(lowestInvestment.id);
                setCurrentPage('detail');
              }}
              className="bg-slate-900/30 border border-slate-800/60 hover:border-teal-500/40 p-4 sm:p-5 rounded-xl transition-all cursor-pointer group shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-semibold flex items-center gap-1 border border-teal-500/20 text-[11px]">
                  <DollarSign className="w-3 h-3" /> Entry Capital
                </span>
                <span className="text-teal-400 font-bold text-xs">₹{(lowestInvestment.total_investment/100000).toFixed(1)}L</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">{lowestInvestment.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{lowestInvestment.sub_sector}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Entry Capital</span>
                  <span className="text-teal-400 font-bold">₹{(lowestInvestment.total_investment/100000).toFixed(1)}L</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Franchise Fee</span>
                  <span className="text-slate-200 font-bold">₹{(lowestInvestment.franchise_fee/100000).toFixed(1)}L</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Est. ROI</span>
                  <span className="text-slate-300 font-medium">{lowestInvestment.roi_annual}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payback</span>
                  <span className="text-slate-300 font-medium">{lowestInvestment.payback_months} mo</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. Highest Growth */}
          {highestGrowth && (
            <div 
              onClick={() => {
                setSelectedFranchiseId(highestGrowth.id);
                setCurrentPage('detail');
              }}
              className="bg-slate-900/30 border border-slate-800/60 hover:border-purple-500/40 p-4 sm:p-5 rounded-xl transition-all cursor-pointer group shadow-sm backdrop-blur-sm"
            >
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-semibold flex items-center gap-1 border border-purple-500/20 text-[11px]">
                  <Zap className="w-3 h-3" /> Expansion
                </span>
                <span className="text-purple-400 font-bold text-xs">+{highestGrowth.expansion_rate}%/yr</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">{highestGrowth.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{highestGrowth.sub_sector}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Expansion</span>
                  <span className="text-purple-400 font-bold">+{highestGrowth.expansion_rate}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Outlets</span>
                  <span className="text-slate-200 font-bold">{highestGrowth.total_outlets}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ROI</span>
                  <span className="text-slate-300 font-medium">{highestGrowth.roi_annual}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Closure</span>
                  <span className="text-slate-300 font-medium">{highestGrowth.closure_rate_pct}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Analytics Chart: ROI & Investment Spread */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Comparative Yield & Capital Exposure Benchmark</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Annual ROI (%) vs Initial Investment (₹ Lakhs)</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Annual ROI %
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any, name?: any) => [
                  name === 'roi' ? `${val}% / year` : `₹${val} Lakhs`,
                  name === 'roi' ? 'Annual ROI' : 'Investment'
                ]}
              />
              <Bar dataKey="roi" fill="#10b981" radius={[6, 6, 0, 0]}>
                {chartData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Sector Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Browse by Sector ({sectors.length} sectors supported)
          </h3>
          {selectedSector && (
            <button 
              onClick={() => setSelectedSector(null)} 
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Clear Sector Filter
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedSector(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedSector === null 
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm' 
                : 'bg-slate-900/40 text-slate-300 border border-slate-800/60 hover:border-slate-700 hover:text-white'
            }`}
          >
            All Opportunities ({franchises.length})
          </button>
          {sectors.slice(0, 12).map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSector(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedSector === s.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-900/40 text-slate-300 border border-slate-800/60 hover:border-slate-700 hover:text-white'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table / Grid */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Active Franchise Database ({filteredFranchises.length})</h3>
          <button 
            onClick={() => setCurrentPage('explore')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1"
          >
            <span>Open Advanced Filters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 font-medium uppercase tracking-wider border-b border-slate-800/80 bg-slate-900/30">
              <tr>
                <th className="py-2.5 px-3">Franchise</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Investment</th>
                <th className="py-2.5 px-3">Monthly Profit</th>
                <th className="py-2.5 px-3">ROI</th>
                <th className="py-2.5 px-3">Payback</th>
                <th className="py-2.5 px-3">Risk Tier</th>
                <th className="py-2.5 px-3">Verification</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredFranchises.slice(0, 10).map((f) => {
                const isCompared = comparisonList.includes(f.id);
                return (
                  <tr key={f.id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <div 
                        onClick={() => {
                          setSelectedFranchiseId(f.id);
                          setCurrentPage('detail');
                        }}
                        className="cursor-pointer hover:text-emerald-400 transition-colors"
                      >
                        {f.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{f.headquarters} • {f.franchise_model}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{f.sector_name}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">₹{(f.total_investment/100000).toFixed(1)}L</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">₹{f.monthly_profit.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{f.roi_annual}%</td>
                    <td className="py-2.5 px-3 text-slate-300">{f.payback_months} mo</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[11px] font-medium ${
                        f.risk_tier === 'Low Risk' ? 'text-emerald-400' : f.risk_tier === 'Medium Risk' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {f.risk_tier}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <VerificationBadge sourceType={f.primary_data_source} confidence={f.data_confidence} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleComparison(f.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                            isCompared ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {isCompared ? 'Comparing' : '+ Compare'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFranchiseId(f.id);
                            setCurrentPage('detail');
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium transition-colors cursor-pointer"
                        >
                          View P&L
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
