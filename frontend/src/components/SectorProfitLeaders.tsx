import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvestor } from '../context/InvestorContext';
import { api } from '../services/api';
import { VerificationBadge } from './VerificationBadge';
import {
  TrendingUp, Award, DollarSign, Clock, ArrowRight,
  ShieldCheck, CheckCircle2, ChevronRight, Zap, Filter
} from 'lucide-react';

interface SectorProfitLeadersProps {
  setCurrentPage: (page: string) => void;
  setSelectedFranchiseId: (id: number) => void;
}

export const SectorProfitLeaders: React.FC<SectorProfitLeadersProps> = ({
  setCurrentPage,
  setSelectedFranchiseId
}) => {
  const { user } = useAuth();
  const { preferences } = useInvestor();
  const [sectorsData, setSectorsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    api.getSectorProfitLeaders(preferences?.budget)
      .then(data => setSectorsData(data))
      .catch(err => console.error("Error loading sector profit leaders:", err))
      .finally(() => setLoading(false));
  }, [preferences?.budget]);

  const filteredSectors = selectedSector === 'all'
    ? sectorsData
    : sectorsData.filter(s => s.sector_name.toLowerCase() === selectedSector.toLowerCase());

  return (
    <section className="space-y-5">
      {/* Value Proposition Header - Minimal & Attractive */}
      <div className="rounded-2xl bg-slate-900/30 border border-slate-800/60 p-5 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <Award className="w-3 h-3" />
              <span>Profit Leaders Across All 12 Sectors</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {user ? (
                <>Welcome back, <span className="text-emerald-400">{user.name}</span></>
              ) : (
                <>Sector Profitability Intelligence</>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Top profit-generating franchise leaders across every sector. Compare verified monthly earnings, payback cycles, and operating margins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {!user ? (
              <button
                onClick={() => setCurrentPage('login')}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Enter Investor Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('advisor')}
                className="px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Run Advisor Matchmaker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sector Category Filter Tabs - Minimal */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedSector('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedSector === 'all'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800/50'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>All 12 Sectors ({sectorsData.length})</span>
        </button>

        {sectorsData.map(sec => (
          <button
            key={sec.sector_id}
            onClick={() => setSelectedSector(sec.sector_name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSector.toLowerCase() === sec.sector_name.toLowerCase()
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800/50'
            }`}
          >
            <span>{sec.sector_name}</span>
            <span className="text-[10px] text-emerald-400 font-semibold">
              ₹{(sec.highest_monthly_profit / 100000).toFixed(1)}L
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Sector Profit Leaders - Minimal & Attractive */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-60 rounded-xl bg-slate-900/30 border border-slate-800/50 animate-pulse p-5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSectors.map((sec) => {
            const leader = sec.top_profit_leader;
            if (!leader) return null;

            return (
              <div
                key={sec.sector_id}
                className="bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between group backdrop-blur-sm"
              >
                <div>
                  {/* Top Sector & Verification Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {sec.sector_name}
                    </span>
                    <VerificationBadge sourceType={leader.verification_tier} size="sm" />
                  </div>

                  {/* Brand & Sub-Sector */}
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {leader.name}
                    </h3>
                    <p className="text-xs text-slate-400">{leader.sub_sector} • {leader.headquarters}</p>
                  </div>

                  {/* Net Monthly Profit Box - Minimal */}
                  <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Net Monthly Profit</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                        {leader.net_margin_pct}% Margin
                      </span>
                    </div>
                    <div className="text-xl font-black text-emerald-400 mt-1">
                      ₹{(leader.monthly_profit / 100000).toFixed(2)} Lakhs <span className="text-xs text-slate-400 font-normal">/ mo</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Annual: ₹{((leader.monthly_profit * 12) / 100000).toFixed(1)}L</span>
                      <span>{leader.total_outlets} Outlets</span>
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/40 text-center mb-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Investment</span>
                      <span className="font-bold text-white mt-0.5 block">
                        ₹{(leader.total_investment / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Annual ROI</span>
                      <span className="font-bold text-emerald-400 mt-0.5 block">
                        {leader.roi_annual}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Payback</span>
                      <span className="font-bold text-slate-200 mt-0.5 block">
                        {leader.payback_months} mo
                      </span>
                    </div>
                  </div>

                  {/* Peer Leaders in this Sector */}
                  {sec.leaders && sec.leaders.length > 1 && (
                    <div className="space-y-1 mb-3">
                      <span className="text-[10px] font-semibold text-slate-400 block">Other Sector Leaders:</span>
                      <div className="space-y-1">
                        {sec.leaders.slice(1, 3).map((peer: any) => (
                          <div
                            key={peer.id}
                            onClick={() => {
                              setSelectedFranchiseId(peer.id);
                              setCurrentPage('detail');
                            }}
                            className="flex items-center justify-between text-xs p-1.5 rounded-md bg-slate-950/30 hover:bg-slate-800/40 cursor-pointer text-slate-300 transition-colors border border-slate-800/30"
                          >
                            <span className="truncate pr-2">{peer.name}</span>
                            <span className="font-semibold text-emerald-400 whitespace-nowrap text-[11px]">₹{(peer.monthly_profit / 100000).toFixed(1)}L/mo</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2.5 border-t border-slate-800/60 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedFranchiseId(leader.id);
                      setCurrentPage('detail');
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/25 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Audit Report</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFranchiseId(leader.id);
                      setCurrentPage('compare');
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition-all cursor-pointer"
                    title="Compare in Matrix"
                  >
                    Compare
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
