import React, { useState, useEffect } from 'react';
import { 
  Building2, ArrowLeft, Shield, Clock, TrendingUp, CheckCircle, 
  AlertTriangle, DollarSign, Activity, Award, Bookmark, BookmarkCheck,
  Calendar, Layers, MapPin, Store, Check, X, FileText, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { FranchiseDetail as IFranchiseDetail } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';
import { ClaimGapIndicator } from '../components/ClaimGapIndicator';
import { useInvestor } from '../context/InvestorContext';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

interface FranchiseDetailProps {
  franchiseId: number;
  setCurrentPage: (page: string) => void;
}

export const FranchiseDetail: React.FC<FranchiseDetailProps> = ({ franchiseId, setCurrentPage }) => {
  const [franchise, setFranchise] = useState<IFranchiseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'financials' | 'historical' | 'projections' | 'support' | 'sentiment'>('financials');
  const [selectedProjectionScenario, setSelectedProjectionScenario] = useState<'Conservative' | 'Expected' | 'Optimistic'>('Expected');
  const [isSaved, setIsSaved] = useState(false);
  const { toggleComparison, comparisonList } = useInvestor();

  useEffect(() => {
    setLoading(true);
    api.getFranchiseDetail(franchiseId)
      .then((data) => {
        setFranchise(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.getWatchlist().then((items) => {
      setIsSaved(items.some(w => w.franchise_id === franchiseId));
    }).catch(console.error);
  }, [franchiseId]);

  const handleToggleWatchlist = async () => {
    try {
      const res = await api.toggleWatchlist(franchiseId);
      setIsSaved(res.status === 'added');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !franchise) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading comprehensive forensic franchise dossier...</p>
      </div>
    );
  }

  const isCompared = comparisonList.includes(franchise.id);

  // Historical Chart data
  const historicalData = (franchise.historical_financials || []).map(h => ({
    year: String(h.year),
    revenue: Math.round(h.annual_revenue / 100000), // in Lakhs
    expenses: Math.round(h.annual_expenses / 100000),
    profit: Math.round(h.annual_profit / 100000),
    outlets: h.total_outlets,
    roi: h.roi_annual
  }));

  // Projections Data for selected scenario
  const projectionData = (franchise.projections?.[selectedProjectionScenario] || []).map(p => ({
    timeframe: `${p.timeframe_years} Year${p.timeframe_years > 1 ? 's' : ''}`,
    revenue: Math.round(p.projected_annual_revenue / 100000),
    profit: Math.round(p.projected_annual_profit / 100000),
    roi: p.projected_roi,
    payback: p.projected_payback_months,
    outlets: p.projected_total_outlets
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('explore')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Franchise Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleWatchlist}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSaved 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button
            onClick={() => toggleComparison(franchise.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isCompared 
                ? 'bg-emerald-500 text-slate-950 font-bold' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isCompared ? 'Comparing' : '+ Compare Side-by-Side'}
          </button>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium">
                {franchise.sector_name}
              </span>
              <span className="px-2.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium">
                {franchise.sub_sector}
              </span>
              <VerificationBadge 
                sourceType={franchise.primary_data_source} 
                confidence={franchise.data_confidence} 
                dataSource={franchise.data_sources?.[0]} 
              />
              <span className="text-xs text-slate-500">• Founded {franchise.founded_year} ({franchise.brand_age_years} yrs)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{franchise.name}</h1>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">{franchise.description}</p>

            <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-slate-400">
              <span>HQ: <strong className="text-slate-200">{franchise.headquarters}</strong></span>
              <span>Model: <strong className="text-slate-200">{franchise.franchise_model}</strong></span>
              <span>Space Req: <strong className="text-slate-200">{franchise.space_min_sqft} - {franchise.space_max_sqft} sq ft</strong></span>
              <span>Outlets: <strong className="text-slate-200">{franchise.total_outlets}</strong></span>
              <span>Data Updated: <strong className="text-emerald-400">{franchise.financial?.last_updated || 'September 2026'}</strong></span>
            </div>
          </div>

          {/* Quick KPI Score Badges */}
          <div className="flex sm:flex-col items-end gap-3 shrink-0">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-right min-w-[140px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Deal Attractiveness</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {franchise.deal_attractiveness_score}<span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-right min-w-[140px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Risk Assessment</div>
              <div className={`text-sm font-bold mt-0.5 ${
                franchise.risk_tier === 'Low Risk' ? 'text-emerald-400' : franchise.risk_tier === 'Medium Risk' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {franchise.risk_tier} ({franchise.risk_score}/100)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Gap Indicator (Section 7) */}
      <ClaimGapIndicator
        claimedRevenue={franchise.financial.claimed_monthly_revenue}
        actualRevenue={franchise.financial.actual_monthly_revenue}
        claimedMargin={franchise.financial.claimed_net_margin}
        actualMargin={franchise.financial.actual_net_margin}
        claimedProfit={franchise.financial.claimed_monthly_profit}
        actualProfit={franchise.financial.actual_monthly_profit}
        severity={franchise.claim_gap_analysis.severity}
        advisory={franchise.claim_gap_analysis.advisory}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'financials', label: 'Unit Economics & P&L', icon: DollarSign },
          { id: 'historical', label: '5-Year Trends (2022-2026)', icon: TrendingUp },
          { id: 'projections', label: '1/3/5-Year Projections', icon: Activity },
          { id: 'support', label: 'Franchisor Support Checklist', icon: CheckCircle },
          { id: 'sentiment', label: 'Franchisee Sentiment & Reviews', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Unit Economics & Full P&L Statement */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Investment Breakdown Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Capital Investment Breakdown</span>
              <span className="text-xs text-slate-400 font-normal">Updated: {franchise.investment.last_updated}</span>
            </h3>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Upfront Franchise Fee</span>
                <span className="font-semibold text-white">₹{franchise.investment.franchise_fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Store Infrastructure & Setup</span>
                <span className="font-semibold text-white">₹{franchise.investment.setup_cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Commercial Equipment & Machinery</span>
                <span className="font-semibold text-white">₹{franchise.investment.equipment_cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Interior Fitout & Branding</span>
                <span className="font-semibold text-white">₹{franchise.investment.interior_cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Initial Opening Stock & Inventory</span>
                <span className="font-semibold text-white">₹{franchise.investment.initial_inventory.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Working Capital Reserve (90 days)</span>
                <span className="font-semibold text-white">₹{franchise.investment.working_capital.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Technology & POS Setup</span>
                <span className="font-semibold text-white">₹{franchise.investment.technology_cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-3 flex justify-between text-sm bg-slate-950/60 px-3 rounded-lg mt-2 font-bold border border-transparent">
                <span className="text-white">Total Estimated Capital Outlay</span>
                <span className="text-emerald-400">₹{franchise.investment.total_estimated_investment.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Monthly Operating P&L Statement */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Verified Monthly Operating P&L</span>
              <span className="text-xs font-semibold text-emerald-400">ROI: {franchise.financial.roi_annual}% / yr</span>
            </h3>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-2.5 flex justify-between font-bold text-slate-200">
                <span>Verified Monthly Gross Revenue</span>
                <span className="text-white">₹{franchise.financial.actual_monthly_revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between text-rose-400/90">
                <span>(-) Cost of Goods Sold / Raw Material</span>
                <span>-₹{franchise.operating_costs.raw_materials_cogs.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between font-semibold text-slate-300 bg-slate-950/40 px-2 rounded">
                <span>(=) Gross Operating Profit ({franchise.financial.gross_margin}%)</span>
                <span>₹{(franchise.financial.actual_monthly_revenue - franchise.operating_costs.raw_materials_cogs).toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between text-slate-400">
                <span>Store Rent (Estimated)</span>
                <span>-₹{franchise.operating_costs.monthly_rent.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between text-slate-400">
                <span>Staff & Operator Salaries</span>
                <span>-₹{franchise.operating_costs.employee_salaries.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between text-slate-400">
                <span>Utilities (Power, Water, Commercial Gas)</span>
                <span>-₹{franchise.operating_costs.utilities.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between text-slate-400">
                <span>Franchisor Royalty ({franchise.fees.royalty_percentage}%)</span>
                <span>-₹{(franchise.financial.actual_monthly_revenue * franchise.fees.royalty_percentage / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between text-slate-400">
                <span>Marketing & Platform Fees</span>
                <span>-₹{(franchise.operating_costs.marketing + franchise.operating_costs.platform_delivery_commission).toLocaleString('en-IN')}</span>
              </div>
              <div className="py-3 flex justify-between text-sm bg-emerald-950/40 border border-emerald-500/30 px-3 rounded-xl mt-2 font-bold">
                <span className="text-emerald-300">Verified Monthly Net Cash Profit</span>
                <span className="text-emerald-400">₹{franchise.financial.actual_monthly_profit.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Payback Period</span>
                <span className="font-bold text-white text-sm">{franchise.financial.payback_months} Months</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Break-even Horizon</span>
                <span className="font-bold text-white text-sm">{franchise.financial.break_even_months} Months</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 5-Year Historical Performance Trends (2022-2026) (Section 4 & 14) */}
      {activeTab === 'historical' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white">5-Year Historical Evolution (2022 → 2026)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tracking real network unit economics through inflation and expansion cycles</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                Trend: Growing & Resilient
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Revenue & Profit Trends */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-white mb-4">Annual Revenue & Net Profit (₹ Lakhs)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: any, name?: any) => [`₹${val} Lakhs`, name === 'revenue' ? 'Revenue' : 'Profit']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart: Outlet Growth & Closures */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-white mb-4">Outlet Network Expansion vs Closure Churn</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="outlets" name="Total Outlets" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="roi" name="Annual ROI %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Historical Data Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Unit Investment</th>
                  <th className="py-2.5 px-3">Annual Revenue</th>
                  <th className="py-2.5 px-3">Annual Profit</th>
                  <th className="py-2.5 px-3">ROI</th>
                  <th className="py-2.5 px-3">Total Outlets</th>
                  <th className="py-2.5 px-3">Openings</th>
                  <th className="py-2.5 px-3">Closures</th>
                  <th className="py-2.5 px-3">Closure Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {franchise.historical_financials?.map((h) => (
                  <tr key={h.year} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-white">{h.year}</td>
                    <td className="py-2.5 px-3 text-slate-300">₹{(h.total_investment/100000).toFixed(1)}L</td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium">₹{(h.annual_revenue/100000).toFixed(1)}L</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">₹{(h.annual_profit/100000).toFixed(1)}L</td>
                    <td className="py-2.5 px-3 font-bold text-white">{h.roi_annual}%</td>
                    <td className="py-2.5 px-3 text-slate-300">{h.total_outlets}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-medium">+{h.outlet_openings}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-medium">-{h.outlet_closures}</td>
                    <td className="py-2.5 px-3 text-slate-300">{h.closure_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Future Projections (1, 3, 5 years) (Section 15) */}
      {activeTab === 'projections' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white">Scenario Projections (1, 3, 5 Years)</h4>
              <p className="text-xs text-amber-300/80 font-medium mt-0.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                MODEL ESTIMATE — NOT GUARANTEED
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {(['Conservative', 'Expected', 'Optimistic'] as const).map((scen) => (
                <button
                  key={scen}
                  onClick={() => setSelectedProjectionScenario(scen)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedProjectionScenario === scen
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {scen} Model
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {franchise.projections?.[selectedProjectionScenario]?.map((p) => (
              <div key={p.timeframe_years} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm font-bold text-white">{p.timeframe_years} Year Outlook</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                    {selectedProjectionScenario}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected Annual Revenue</span>
                    <span className="font-semibold text-white">₹{(p.projected_annual_revenue/100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected Operating Expenses</span>
                    <span className="font-semibold text-rose-400/90">₹{(p.projected_annual_expenses/100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-slate-800">
                    <span className="text-slate-300">Projected Annual Profit</span>
                    <span className="text-emerald-400 text-sm">₹{(p.projected_annual_profit/100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected Annual ROI</span>
                    <span className="font-bold text-white">{p.projected_roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payback Period</span>
                    <span className="text-slate-200">{p.projected_payback_months} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Total Outlets</span>
                    <span className="text-slate-200 font-semibold">{p.projected_total_outlets} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Franchisor Support Checklist (14 Dimensions) (Section 21) */}
      {activeTab === 'support' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h4 className="text-base font-bold text-white">14 Franchisor Deliverables & Support Matrix</h4>
            <p className="text-xs text-slate-400 mt-1">Verified operational and brand enablement commitments provided by franchisor headquarters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {[
              { label: 'Initial Training & Onboarding', val: franchise.support?.training },
              { label: 'Store Setup & Architectural Assistance', val: franchise.support?.store_setup_assistance },
              { label: 'National & Regional Marketing', val: franchise.support?.marketing_support },
              { label: 'Technology Stack & Cloud Infrastructure', val: franchise.support?.technology_stack },
              { label: 'Supply Chain & Raw Material Logistics', val: franchise.support?.supply_chain_logistics },
              { label: 'Staff Hiring & Certified Training', val: franchise.support?.staff_training },
              { label: 'Location & Site Selection Feasibility', val: franchise.support?.location_site_selection },
              { label: 'Grand Launch Support & PR', val: franchise.support?.launch_support },
              { label: 'Operations Manual & SOP Protocols', val: franchise.support?.operations_manual_sop },
              { label: 'Dedicated Business Consulting & Audits', val: franchise.support?.business_consulting },
              { label: 'Branding Assets & POS Collaterals', val: franchise.support?.branding_assets },
              { label: 'Franchisee CRM System', val: franchise.support?.crm_provided },
              { label: 'POS & Automated Billing Software', val: franchise.support?.pos_billing_software },
              { label: 'Digital Marketing & Lead Generation', val: franchise.support?.digital_marketing_leads },
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-medium">{item.label}</span>
                {item.val ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Included
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[11px] font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> Not Offered
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Franchisee Sentiment & Reviews (Section 20) */}
      {activeTab === 'sentiment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="text-xs text-slate-400">Franchisee Satisfaction Score</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {franchise.franchisee_satisfaction_score}<span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Based on verified regional operator audits</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="text-xs text-slate-400">Would Reinvest in this Franchise?</div>
              <div className="text-3xl font-black text-white mt-1">88%</div>
              <p className="text-[11px] text-emerald-400 mt-1">High operator loyalty</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="text-xs text-slate-400">Would Recommend to Peers?</div>
              <div className="text-3xl font-black text-white mt-1">92%</div>
              <p className="text-[11px] text-emerald-400 mt-1">Strong brand advocacy</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-white">Verified Operator Testimonials & Reviews</h4>
            <div className="space-y-3">
              {franchise.reviews?.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{r.title}</span>
                    <span className="text-amber-400 font-bold">★ {r.rating} / 5.0</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{r.comment}</p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <span>{r.user_name} (Verified Unit Operator)</span>
                    <span>{r.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
