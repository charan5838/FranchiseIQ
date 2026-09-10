import React, { useState, useEffect } from 'react';
import { 
  BookmarkCheck, Bell, TrendingUp, TrendingDown, 
  Trash2, ArrowRight, ShieldCheck, DollarSign, Clock, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { WatchlistItem, NotificationItem } from '../types';
import { useInvestor } from '../context/InvestorContext';

interface WatchlistPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedFranchiseId: (id: number) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({ setCurrentPage, setSelectedFranchiseId }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { watchlist: contextWatchlistIds, toggleWatchlist } = useInvestor();

  const loadData = async () => {
    setLoading(true);
    try {
      const [wList, nList] = await Promise.all([
        api.getWatchlist().catch(() => [] as WatchlistItem[]),
        api.getNotifications().catch(() => [] as NotificationItem[])
      ]);

      // If backend returns items, use them; if user added local watchlist items not yet in API:
      let combined = [...wList];
      const existingIds = new Set(combined.map(c => c.franchise_id));
      const missingIds = contextWatchlistIds.filter(id => !existingIds.has(id));

      if (missingIds.length > 0) {
        const allFranchises = await api.getFranchises().catch(() => []);
        missingIds.forEach(mId => {
          const f = allFranchises.find(item => item.id === mId);
          if (f) {
            combined.push({
              watchlist_id: mId * 1000,
              franchise_id: f.id,
              name: f.name,
              slug: f.slug,
              logo_url: f.logo_url,
              sector: f.sector_name,
              added_date: 'Today',
              added_investment: f.total_investment,
              current_investment: f.total_investment,
              investment_delta: 0,
              added_roi: f.roi_annual,
              current_roi: f.roi_annual,
              roi_delta: 0,
              added_risk: f.risk_tier,
              current_risk: f.risk_tier,
              risk_score: f.risk_score,
              payback_months: f.payback_months,
              monthly_profit: f.monthly_profit
            });
          }
        });
      }

      setWatchlist(combined);
      setNotifications(nList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contextWatchlistIds]);

  const handleRemove = async (franchiseId: number) => {
    await toggleWatchlist(franchiseId);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <BookmarkCheck className="w-3.5 h-3.5" /> Capital Tracking & Alerts
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">My Monitored Franchise Watchlist</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Track unit economics drift, fee adjustments, and network growth over time for candidate franchises before executing contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Watchlist Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>Watched Opportunities ({watchlist.length})</span>
              </h2>
              <span className="text-xs text-slate-500">Auto-refreshed daily</span>
            </div>

            {watchlist.length === 0 && !loading ? (
              <div className="text-center py-12">
                <BookmarkCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Your watchlist is currently empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto mb-4">
                  Browse the directory or run the Investor Advisor to save franchises and monitor their fee or ROI updates.
                </p>
                <button
                  onClick={() => setCurrentPage('explore')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Explore Opportunities
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {watchlist.map((item) => (
                  <div
                    key={item.watchlist_id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-700 transition-all flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 
                          onClick={() => {
                            setSelectedFranchiseId(item.franchise_id);
                            setCurrentPage('detail');
                          }}
                          className="text-base font-bold text-slate-900 dark:text-white hover:text-emerald-400 cursor-pointer transition-colors"
                        >
                          {item.name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.sector}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Added on {item.added_date}</p>
                    </div>

                    {/* Historical Changes Tracking Strip (Section 28) */}
                    <div className="flex flex-wrap items-center gap-6 text-xs">
                      {/* Investment Change */}
                      <div>
                        <span className="text-slate-400 block text-[11px]">Investment Track</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <span className="text-slate-400">₹{(item.added_investment/100000).toFixed(1)}L</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="text-white">₹{(item.current_investment/100000).toFixed(1)}L</span>
                        </div>
                      </div>

                      {/* ROI Movement */}
                      <div>
                        <span className="text-slate-400 block text-[11px]">Annual ROI Drift</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <span className="text-slate-400">{item.added_roi}%</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="text-emerald-400">{item.current_roi}%</span>
                        </div>
                      </div>

                      {/* Risk Score */}
                      <div>
                        <span className="text-slate-400 block text-[11px]">Risk Category</span>
                        <span className={`font-semibold ${
                          item.current_risk === 'Low Risk' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {item.current_risk}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedFranchiseId(item.franchise_id);
                          setCurrentPage('detail');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Deep Dive
                      </button>
                      <button
                        onClick={() => handleRemove(item.franchise_id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Notification Stream (4 cols) (Section 27) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Investment Alert Stream</span>
            </h3>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No new notifications.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.date}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
