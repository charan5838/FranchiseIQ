import React, { useState, useEffect } from 'react';
import { 
  Calculator, DollarSign, TrendingUp, Clock, Scale, 
  HelpCircle, RefreshCw, BarChart2, PieChart
} from 'lucide-react';
import { api } from '../services/api';
import { CalculatorResult } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend, ReferenceLine 
} from 'recharts';

export const FinancialCalculator: React.FC = () => {
  // Input parameters
  const [customersDaily, setCustomersDaily] = useState<number>(140);
  const [ticketValue, setTicketValue] = useState<number>(320);
  const [operatingDays, setOperatingDays] = useState<number>(30);
  const [cogsPct, setCogsPct] = useState<number>(36);
  const [monthlyRent, setMonthlyRent] = useState<number>(65000);
  const [salaries, setSalaries] = useState<number>(60000);
  const [utilities, setUtilities] = useState<number>(22000);
  const [marketing, setMarketing] = useState<number>(15000);
  const [maintenance, setMaintenance] = useState<number>(10000);
  const [platformCommission, setPlatformCommission] = useState<number>(20000);
  const [techFees, setTechFees] = useState<number>(5000);
  const [otherExpenses, setOtherExpenses] = useState<number>(12000);
  const [royaltyPct, setRoyaltyPct] = useState<number>(5);
  const [totalInvestment, setTotalInvestment] = useState<number>(2500000);

  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [loading, setLoading] = useState(false);

  const recalculate = () => {
    setLoading(true);
    api.runCalculator({
      avg_customers_daily: customersDaily,
      avg_ticket_value: ticketValue,
      operating_days: operatingDays,
      cogs_pct: cogsPct,
      monthly_rent: monthlyRent,
      employee_salaries: salaries,
      utilities,
      marketing,
      maintenance,
      platform_commission: platformCommission,
      tech_fees: techFees,
      other_expenses: otherExpenses,
      royalty_pct: royaltyPct,
      total_investment: totalInvestment
    }).then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    recalculate();
  }, [
    customersDaily, ticketValue, operatingDays, cogsPct, monthlyRent,
    salaries, utilities, marketing, maintenance, platformCommission,
    techFees, otherExpenses, royaltyPct, totalInvestment
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Calculator className="w-3.5 h-3.5" /> Unit Economics Simulation Engine
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Franchise Financial Calculator</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Model monthly revenues, variable COGS, fixed rental drags, and platform commissions. Interactive break-even curve recalculates instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Pane (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                Revenue & Footfall Drivers
              </h2>
              <button 
                onClick={recalculate} 
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {/* Daily Customers */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Daily Paying Customers</span>
                <span className="font-bold text-emerald-400">{customersDaily} orders/day</span>
              </div>
              <input
                type="range"
                min={30}
                max={500}
                step={5}
                value={customersDaily}
                onChange={(e) => setCustomersDaily(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Ticket Value */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Average Transaction Value (ATV)</span>
                <span className="font-bold text-emerald-400">₹{ticketValue} / ticket</span>
              </div>
              <input
                type="range"
                min={50}
                max={2500}
                step={25}
                value={ticketValue}
                onChange={(e) => setTicketValue(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Total Investment */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Total Capital Outlay</span>
                <span className="font-bold text-white">₹{(totalInvestment / 100000).toFixed(1)} Lakhs</span>
              </div>
              <input
                type="range"
                min={500000}
                max={10000000}
                step={250000}
                value={totalInvestment}
                onChange={(e) => setTotalInvestment(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
              Operating Cost Assumptions
            </h2>

            {/* COGS % */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Raw Material / COGS %</span>
                <span className="font-bold text-rose-400">{cogsPct}% of Sales</span>
              </div>
              <input
                type="range"
                min={15}
                max={65}
                step={1}
                value={cogsPct}
                onChange={(e) => setCogsPct(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Rent */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Monthly Store Rent</span>
                <span className="font-bold text-white">₹{monthlyRent.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={20000}
                max={300000}
                step={5000}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Salaries */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Monthly Staff Salaries</span>
                <span className="font-bold text-white">₹{salaries.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={15000}
                max={250000}
                step={5000}
                value={salaries}
                onChange={(e) => setSalaries(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Royalty */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Franchise Royalty</span>
                <span className="font-bold text-amber-400">{royaltyPct}% of Gross</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.5}
                value={royaltyPct}
                onChange={(e) => setRoyaltyPct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Platform & Marketing */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Platform Delivery Comm.</label>
                <input
                  type="number"
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Local Marketing</label>
                <input
                  type="number"
                  value={marketing}
                  onChange={(e) => setMarketing(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Pane (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Primary KPIs Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[11px] text-slate-400 block">Monthly Revenue</span>
                  <span className="text-lg font-black text-white">₹{(result.revenue/100000).toFixed(1)}L</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">₹{result.revenue.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl shadow-sm">
                  <span className="text-[11px] text-emerald-400 block font-semibold">Monthly Net Profit</span>
                  <span className="text-lg font-black text-emerald-400">₹{(result.monthly_net_profit/100000).toFixed(2)}L</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Margin: {result.net_margin_pct}%</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[11px] text-indigo-400 block font-semibold">Annual ROI</span>
                  <span className="text-lg font-black text-white">{result.roi_annual}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Annualized yield</span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[11px] text-amber-400 block font-semibold">Payback Horizon</span>
                  <span className="text-lg font-black text-white">{result.payback_months} mo</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Capital recovery</span>
                </div>
              </div>

              {/* Visual Break-Even Curve Chart (Section 17) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-emerald-400" />
                      <span>Visual Break-Even Curve</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Intersection of Gross Sales line with Fixed + Variable Total Operating Costs
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Break-Even Monthly Sales</span>
                    <span className="text-sm font-bold text-amber-400">
                      ₹{Math.round(result.break_even_monthly_sales).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.break_even_chart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis 
                        dataKey="revenue" 
                        stroke="#64748b" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `₹${Math.round(v/1000)}k`} 
                      />
                      <YAxis 
                        stroke="#64748b" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `₹${Math.round(v/1000)}k`} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                        formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Total Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="total_costs" name="Total Costs (Fixed + Var)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="fixed_costs" name="Fixed Overhead" stroke="#64748b" strokeDasharray="3 3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Complete P&L Waterfall Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 text-xs">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  Simulated Unit Cash Flow Waterfall
                </h3>

                <div className="divide-y divide-slate-800/60">
                  <div className="py-2 flex justify-between font-bold text-white">
                    <span>Monthly Gross Revenue ({customersDaily} cust × ₹{ticketValue} × 30 days)</span>
                    <span>₹{result.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-rose-400">
                    <span>(-) Raw Materials & COGS ({cogsPct}%)</span>
                    <span>-₹{result.cogs_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between font-semibold text-slate-200 bg-slate-950/40 px-2 rounded">
                    <span>(=) Gross Profit ({result.gross_margin_pct}%)</span>
                    <span>₹{result.gross_profit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-400">
                    <span>Store Rent</span>
                    <span>-₹{monthlyRent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-400">
                    <span>Staff & Operator Salaries</span>
                    <span>-₹{salaries.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-400">
                    <span>Utilities, Tech, Maintenance</span>
                    <span>-₹{(utilities + techFees + maintenance).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-400">
                    <span>Marketing & Delivery Platform Fees</span>
                    <span>-₹{(marketing + platformCommission).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-amber-400">
                    <span>Franchisor Royalty ({royaltyPct}%)</span>
                    <span>-₹{result.royalty_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-sm font-black bg-emerald-950/40 border border-emerald-500/30 px-3 rounded-xl mt-1">
                    <span className="text-emerald-300">Simulated Net Monthly Cash Profit</span>
                    <span className="text-emerald-400">₹{result.monthly_net_profit.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <div>Fixed Overhead Base: <strong className="text-slate-200">₹{result.fixed_costs.toLocaleString('en-IN')}/mo</strong></div>
                  <div>Variable Cost Ratio: <strong className="text-slate-200">{(100 - result.contribution_margin_ratio*100).toFixed(1)}%</strong></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
