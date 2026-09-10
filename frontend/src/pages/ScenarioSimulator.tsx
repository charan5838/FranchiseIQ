import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, TrendingDown, TrendingUp, 
  ShieldCheck, RefreshCw, Sliders, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { FranchiseSummary, ScenarioSimResult } from '../types';

export const ScenarioSimulator: React.FC = () => {
  const [franchises, setFranchises] = useState<FranchiseSummary[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(1);
  
  // Stress Test Shock Parameters
  const [salesDelta, setSalesDelta] = useState<number>(-20); // -20%
  const [rentDelta, setRentDelta] = useState<number>(15);    // +15%
  const [salariesDelta, setSalariesDelta] = useState<number>(10); // +10%
  const [cogsDelta, setCogsDelta] = useState<number>(12);   // +12%
  const [demandDelta, setDemandDelta] = useState<number>(0);

  const [simResult, setSimResult] = useState<ScenarioSimResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getFranchises().then((list) => {
      setFranchises(list);
      if (list.length > 0) setSelectedFranchiseId(list[0].id);
    }).catch(console.error);
  }, []);

  const runSimulation = () => {
    if (!selectedFranchiseId) return;
    setLoading(true);
    api.simulateScenario({
      franchise_id: selectedFranchiseId,
      sales_delta_pct: salesDelta,
      rent_delta_pct: rentDelta,
      salaries_delta_pct: salariesDelta,
      cogs_delta_pct: cogsDelta,
      demand_delta_pct: demandDelta
    }).then(setSimResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runSimulation();
  }, [selectedFranchiseId, salesDelta, rentDelta, salariesDelta, cogsDelta, demandDelta]);

  // Preset Scenario Presets
  const applyPreset = (preset: 'downturn' | 'inflation' | 'boom' | 'stagflation') => {
    if (preset === 'downturn') {
      setSalesDelta(-25);
      setRentDelta(0);
      setSalariesDelta(0);
      setCogsDelta(0);
      setDemandDelta(0);
    } else if (preset === 'inflation') {
      setSalesDelta(0);
      setRentDelta(15);
      setSalariesDelta(12);
      setCogsDelta(15);
      setDemandDelta(0);
    } else if (preset === 'boom') {
      setSalesDelta(25);
      setRentDelta(5);
      setSalariesDelta(5);
      setCogsDelta(2);
      setDemandDelta(10);
    } else if (preset === 'stagflation') {
      setSalesDelta(-20);
      setRentDelta(15);
      setSalariesDelta(10);
      setCogsDelta(12);
      setDemandDelta(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Activity className="w-3.5 h-3.5" /> Macro Shock Stress-Testing
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Scenario Stress Simulator</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Test unit resilience against economic shocks: <em>"What happens if sales fall by 20%? What if rent jumps 15%?"</em> Observe instant cash flow contractions and extended payback horizons.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Shock Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Select Franchise Candidate</label>
              <select
                value={selectedFranchiseId}
                onChange={(e) => setSelectedFranchiseId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              >
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} (₹{(f.total_investment/100000).toFixed(1)}L • {f.roi_annual}% ROI)</option>
                ))}
              </select>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-2">
                Quick Stress-Test Presets
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => applyPreset('stagflation')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer text-left"
                >
                  ⚡ Stagflation (-20% Sales, +12% Costs)
                </button>
                <button
                  onClick={() => applyPreset('downturn')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer text-left"
                >
                  📉 Demand Slump (-25% Sales)
                </button>
                <button
                  onClick={() => applyPreset('inflation')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer text-left"
                >
                  🔥 Raw Material Spike (+15% COGS)
                </button>
                <button
                  onClick={() => applyPreset('boom')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition-colors cursor-pointer text-left"
                >
                  🚀 Festive Boom (+25% Volume)
                </button>
              </div>
            </div>

            {/* Shocks */}
            <div className="pt-2 border-t border-slate-800 space-y-4">
              {/* Sales Delta */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Customer Sales Delta (%)</span>
                  <span className={`font-bold ${salesDelta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {salesDelta > 0 ? `+${salesDelta}%` : `${salesDelta}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={5}
                  value={salesDelta}
                  onChange={(e) => setSalesDelta(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Rent Delta */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Store Rent Escalation (%)</span>
                  <span className="font-bold text-amber-400">+{rentDelta}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={rentDelta}
                  onChange={(e) => setRentDelta(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Salaries Delta */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Labor & Staff Wage Hike (%)</span>
                  <span className="font-bold text-amber-400">+{salariesDelta}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={2}
                  value={salariesDelta}
                  onChange={(e) => setSalariesDelta(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* COGS Delta */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Raw Material / Supply Inflation (%)</span>
                  <span className="font-bold text-rose-400">+{cogsDelta}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={2}
                  value={cogsDelta}
                  onChange={(e) => setCogsDelta(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Stress-Test Impact (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {simResult && (
            <>
              {/* Stress Rating Banner */}
              <div className={`p-6 rounded-2xl border transition-all ${
                simResult.stress_test_rating === 'Resilient' 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                  : simResult.stress_test_rating === 'Moderate Impact' 
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300' 
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Unit Fragility Index</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-700">
                    {simResult.stress_test_rating}
                  </span>
                </div>
                <p className="text-sm font-medium text-white leading-relaxed">{simResult.risk_assessment}</p>
              </div>

              {/* Comparative Before vs After Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly Profit Delta */}
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-medium block">Monthly Cash Profit</span>
                  <div className="flex items-baseline justify-between text-xs text-slate-400">
                    <span>Baseline:</span>
                    <span className="font-semibold text-slate-200">₹{simResult.base_profit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-sm font-bold">
                    <span>Stressed:</span>
                    <span className={simResult.simulated_profit < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      ₹{simResult.simulated_profit.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-xs flex justify-between">
                    <span className="text-slate-400">Net Contraction:</span>
                    <span className={`font-bold ${simResult.profit_delta_pct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {simResult.profit_delta_pct > 0 ? `+${simResult.profit_delta_pct}%` : `${simResult.profit_delta_pct}%`}
                    </span>
                  </div>
                </div>

                {/* ROI & Payback Impact */}
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-xs text-slate-400 font-medium block">Annual ROI & Payback</span>
                  <div className="flex items-baseline justify-between text-xs text-slate-400">
                    <span>Baseline ROI:</span>
                    <span className="font-semibold text-slate-200">{simResult.base_roi}%</span>
                  </div>
                  <div className="flex items-baseline justify-between text-sm font-bold">
                    <span>Stressed ROI:</span>
                    <span className="text-white">{simResult.simulated_roi}%</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-xs flex justify-between">
                    <span className="text-slate-400">Payback Horizon:</span>
                    <span className="text-amber-400 font-bold">
                      {simResult.base_payback} mo → {simResult.simulated_payback > 100 ? 'Negative' : `${simResult.simulated_payback} mo`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stress Comparison Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Stress-Test Revenue vs Expense Breakdown
                </h4>
                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Gross Monthly Revenue</span>
                    <div className="text-right">
                      <span className="text-slate-400 mr-3">₹{simResult.base_revenue.toLocaleString('en-IN')}</span>
                      <span className="font-bold text-white">₹{simResult.simulated_revenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Total Operating Expenses</span>
                    <div className="text-right">
                      <span className="text-slate-400 mr-3">₹{simResult.base_expenses.toLocaleString('en-IN')}</span>
                      <span className="font-bold text-rose-400">₹{simResult.simulated_expenses.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="py-3 flex justify-between font-bold text-sm bg-slate-950/60 px-3 rounded-xl mt-2">
                    <span className="text-white">Operating Buffer (Cash Profit)</span>
                    <span className={simResult.simulated_profit < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      ₹{simResult.simulated_profit.toLocaleString('en-IN')} / month
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
