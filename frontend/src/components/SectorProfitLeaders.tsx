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
    <section className="space-y-6">
      {/* Personalized Greeting & Value Proposition Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/60 border border-emerald-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Highest Profitability Across All 12 Industry Sectors</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {user ? (
                <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{user.name}</span>!</>
              ) : (
                <>Sector Profitability Intelligence</>
              )}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Discover the top profit-generating franchise leaders across every sector. Compare verified monthly earnings, payback cycles, and audited operating margins before committing capital.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!user ? (
              <button
                onClick={() => setCurrentPage('login')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <span>Enter Your Investor Profile</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('advisor')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Run Personalized AI Matchmaker</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sector Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedSector('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedSector === 'all'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>All 12 Sectors ({sectorsData.length})</span>
        </button>

        {sectorsData.map(sec => (
          <button
            key={sec.sector_id}
            onClick={() => setSelectedSector(sec.sector_name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedSector.toLowerCase() === sec.sector_name.toLowerCase()
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <span>{sec.sector_name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-emerald-400">
              ₹{(sec.highest_monthly_profit / 100000).toFixed(1)}L/mo
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Sector Profit Leaders */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse p-6"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSectors.map((sec) => {
            const leader = sec.top_profit_leader;
            if (!leader) return null;

            return (
              <div
                key={sec.sector_id}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Sector & Verification Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {sec.sector_name} Leader
                    </span>
                    <VerificationBadge sourceType={leader.verification_tier} />
                  </div>

                  {/* Brand & Sub-Sector */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {leader.name}
                    </h3>
                    <p className="text-xs text-slate-400">{leader.sub_sector} • HQ {leader.headquarters}</p>
                  </div>

                  {/* Highlighted Net Monthly Profit Box */}
                  <div className="bg-gradient-to-br from-emerald-950/50 to-slate-950 border border-emerald-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Net Monthly Profit</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        {leader.net_margin_pct}% Net Margin
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      ₹{(leader.monthly_profit / 100000).toFixed(2)} Lakhs <span className="text-xs text-slate-400 font-normal">/ month</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Annual Profit: ₹{((leader.monthly_profit * 12) / 100000).toFixed(1)}L</span>
                      <span>Total Outlets: {leader.total_outlets}</span>
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Investment</span>
                      <span className="text-xs font-bold text-white mt-0.5 block">
                        ₹{(leader.total_investment / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Annual ROI</span>
                      <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                        {leader.roi_annual}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Payback</span>
                      <span className="text-xs font-bold text-amber-400 mt-0.5 block">
                        {leader.payback_months} mo
                      </span>
                    </div>
                  </div>

                  {/* Peer Leaders in this Sector */}
                  {sec.leaders && sec.leaders.length > 1 && (
                    <div className="space-y-1 mb-4">
                      <span className="text-[11px] font-semibold text-slate-400 block">Other High-Profit Peers in {sec.sector_name}:</span>
                      <div className="space-y-1">
                        {sec.leaders.slice(1, 3).map((peer: any) => (
                          <div
                            key={peer.id}
                            onClick={() => {
                              setSelectedFranchiseId(peer.id);
                              setCurrentPage('detail');
                            }}
                            className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer text-slate-300 transition-colors"
                          >
                            <span className="truncate pr-2">{peer.name}</span>
                            <span className="font-bold text-emerald-400 whitespace-nowrap">₹{(peer.monthly_profit / 100000).toFixed(2)}L/mo</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedFranchiseId(leader.id);
                      setCurrentPage('detail');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-semibold text-xs border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Full Financial Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFranchiseId(leader.id);
                      setCurrentPage('compare');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
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
