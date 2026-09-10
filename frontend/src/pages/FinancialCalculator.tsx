import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, DollarSign, TrendingUp, Clock, Scale, 
  HelpCircle, RefreshCw, BarChart2, PieChart, ShieldAlert,
  Building2, Layers, CheckCircle2, AlertTriangle, ArrowRight,
  Sliders, History, Sparkles, Filter, Search
} from 'lucide-react';
import { api } from '../services/api';
import { CalculatorResult, FranchiseCalculatorPreset, Sector } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

interface FinancialCalculatorProps {
  initialFranchiseId?: number;
  setSelectedFranchiseId?: (id: number) => void;
  setCurrentPage?: (page: string) => void;
}

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  initialFranchiseId = 1,
  setSelectedFranchiseId,
  setCurrentPage
}) => {
  // Master Presets & Sectors
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [presets, setPresets] = useState<FranchiseCalculatorPreset[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<number | 'ALL'>('ALL');
  const [selectedFranchiseIdState, setSelectedFranchiseIdState] = useState<number>(initialFranchiseId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingPresets, setLoadingPresets] = useState<boolean>(true);

  // Active Benchmark Mode: 'CLAIMED' | 'ACTUAL' | 'CUSTOM'
  const [benchmarkMode, setBenchmarkMode] = useState<'CLAIMED' | 'ACTUAL' | 'CUSTOM'>('ACTUAL');

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
  const [loading, setLoading] = useState<boolean>(false);

  // Load Sectors and All Franchise Presets on mount
  useEffect(() => {
    Promise.all([
      api.getSectors(),
      api.getCalculatorPresets()
    ]).then(([secData, presetData]) => {
      setSectors(secData);
      setPresets(presetData);

      // Find initial preset
      const initP = presetData.find(p => p.id === initialFranchiseId) || presetData[0];
      if (initP) {
        setSelectedFranchiseIdState(initP.id);
        applyPresetData(initP, 'ACTUAL');
      }
    }).catch(console.error)
      .finally(() => setLoadingPresets(false));
  }, []);

  // Find currently active preset object
  const currentPreset = useMemo(() => {
    return presets.find(p => p.id === selectedFranchiseIdState) || null;
  }, [presets, selectedFranchiseIdState]);

  // Filtered list of franchises based on sector and search
  const filteredPresets = useMemo(() => {
    return presets.filter(p => {
      const matchSector = selectedSectorId === 'ALL' || p.sector_id === selectedSectorId;
      const matchSearch = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sub_sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchSearch;
    });
  }, [presets, selectedSectorId, searchQuery]);

  // Apply a preset's data to input states
  const applyPresetData = (preset: FranchiseCalculatorPreset, mode: 'CLAIMED' | 'ACTUAL') => {
    setBenchmarkMode(mode);
    const dataSrc = mode === 'CLAIMED' ? preset.claimed_data : preset.actual_data;

    setCustomersDaily(dataSrc.customers_daily);
    setTicketValue(preset.ticket_value);
    setOperatingDays(30);
    setTotalInvestment(preset.total_investment);

    setCogsPct(preset.operating_costs.cogs_pct);
    setMonthlyRent(preset.operating_costs.monthly_rent);
    setSalaries(preset.operating_costs.employee_salaries);
    setUtilities(preset.operating_costs.utilities);
    setMarketing(preset.operating_costs.marketing);
    setMaintenance(preset.operating_costs.maintenance);
    setPlatformCommission(preset.operating_costs.platform_commission);
    setTechFees(preset.operating_costs.tech_fees);
    setOtherExpenses(preset.operating_costs.other_expenses);
    setRoyaltyPct(preset.operating_costs.royalty_pct);
  };

  const handleSelectFranchise = (fId: number) => {
    setSelectedFranchiseIdState(fId);
    if (setSelectedFranchiseId) {
      setSelectedFranchiseId(fId);
    }
    const targetPreset = presets.find(p => p.id === fId);
    if (targetPreset) {
      applyPresetData(targetPreset, 'ACTUAL');
    }
  };

  const handleSectorFilterChange = (secId: number | 'ALL') => {
    setSelectedSectorId(secId);
    // If the currently selected franchise doesn't match this sector, switch to first in sector
    if (secId !== 'ALL') {
      const firstInSector = presets.find(p => p.sector_id === secId);
      if (firstInSector && firstInSector.id !== selectedFranchiseIdState) {
        handleSelectFranchise(firstInSector.id);
      }
    }
  };

  // Run calculation whenever inputs change
  const recalculate = () => {
    setLoading(true);
    api.runCalculator({
      franchise_id: selectedFranchiseIdState,
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

  // Sector-tailored customer unit labels
  const getTrafficLabels = (sectorName?: string) => {
    switch (sectorName) {
      case 'QSR':
      case 'Cafes':
        return { volumeLabel: 'Daily Orders / Footfall', ticketLabel: 'Average Order Value (AOV)' };
      case 'Food & Beverage':
        return { volumeLabel: 'Daily Dining Covers / Bills', ticketLabel: 'Average Bill Value (ABV)' };
      case 'Healthcare':
        return { volumeLabel: 'Daily Patient Customers', ticketLabel: 'Average Prescription / Spend' };
      case 'Diagnostics':
        return { volumeLabel: 'Daily Test / Sample Visits', ticketLabel: 'Average Test Package Price' };
      case 'Fitness':
        return { volumeLabel: 'Daily Active Gym Check-ins', ticketLabel: 'Equivalent Per-Visit Value' };
      case 'Education':
        return { volumeLabel: 'Active Student Count (Monthly)', ticketLabel: 'Monthly Student Tuition Fee' };
      case 'Logistics':
        return { volumeLabel: 'Daily Parcels / Consignments', ticketLabel: 'Average Consignment Booking Fee' };
      case 'Retail':
        return { volumeLabel: 'Daily Retail In-Store Bills', ticketLabel: 'Average Basket Size' };
      case 'Beauty & Salon':
        return { volumeLabel: 'Daily Client Appointments', ticketLabel: 'Average Salon Service Bill' };
      case 'EV & Automotive':
        return { volumeLabel: 'Daily Vehicle Service / Invoices', ticketLabel: 'Average Service Job Ticket' };
      case 'Home Services':
        return { volumeLabel: 'Monthly Customer Projects', ticketLabel: 'Average Project Contract Value' };
      default:
        return { volumeLabel: 'Daily Paying Customers', ticketLabel: 'Average Transaction Value (ATV)' };
    }
  };

  const trafficLabels = getTrafficLabels(currentPreset?.sector_name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
          <Calculator className="w-3.5 h-3.5" /> Unit Economics Simulation & Forensic P&L
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Franchise Financial Calculator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
          Evaluate individual franchise unit economics across all 12 sectors. Stress-test <strong>previous claimed franchisor projections</strong> against <strong>audited ground-truth realities</strong> and custom operational models.
        </p>
      </div>

      {/* SECTOR & INDIVIDUAL FRANCHISE PICKER BAR */}
      <div className="bg-slate-900/35 border border-slate-800/60 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/70 pb-3">
          <div>
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select Sector & Individual Franchise</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Choose from 60+ verified franchises to load historical claimed figures and ground-truth cost baselines.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by franchise name..."
              className="w-full bg-slate-950/60 border border-slate-800/70 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/80"
            />
          </div>
        </div>

        {/* Sector Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => handleSectorFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedSectorId === 'ALL'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-900/40 text-slate-300 hover:text-white border border-slate-800/60'
            }`}
          >
            All Sectors ({presets.length})
          </button>
          {sectors.map((sec) => {
            const countInSec = presets.filter(p => p.sector_id === sec.id).length;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectorFilterChange(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSectorId === sec.id
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-900/40 text-slate-300 hover:text-white border border-slate-800/60'
                }`}
              >
                {sec.name} ({countInSec})
              </button>
            );
          })}
        </div>

        {/* Franchise Dropdown & Selected Info */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
          <div className="sm:col-span-6">
            <label className="text-xs text-slate-300 font-medium block mb-1">
              Active Franchise Opportunity
            </label>
            <select
              value={selectedFranchiseIdState}
              onChange={(e) => handleSelectFranchise(Number(e.target.value))}
              className="w-full bg-slate-950/60 border border-slate-800/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition-colors font-medium"
            >
              {filteredPresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — [{p.sector_name}] ₹{(p.total_investment / 100000).toFixed(1)}L Total Inv
                </option>
              ))}
            </select>
          </div>

          {currentPreset && (
            <div className="sm:col-span-6 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Sub-Sector & Space</span>
                <span className="text-xs font-semibold text-white">
                  {currentPreset.sub_sector} ({currentPreset.space_min_sqft}-{currentPreset.space_max_sqft} sq ft)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Franchise Fee</span>
                <span className="text-xs font-semibold text-emerald-400">
                  ₹{(currentPreset.franchise_fee / 100000).toFixed(1)} Lakhs
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BENCHMARK MODE SELECTOR (CLAIMED vs GROUND TRUTH vs CUSTOM) */}
      {currentPreset && (
        <div className="bg-slate-900/35 border border-slate-800/60 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Baseline Benchmark Model: <span className="text-emerald-400">{currentPreset.name}</span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Switch between franchisor's claimed pitch figures, audited ground-truth benchmarks, or custom simulation.
              </p>
            </div>

            {/* 3 Mode Buttons */}
            <div className="inline-flex rounded-lg bg-slate-950/80 p-0.5 border border-slate-800/70 shrink-0">
              <button
                onClick={() => applyPresetData(currentPreset, 'CLAIMED')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  benchmarkMode === 'CLAIMED'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📜 Claimed Pitch Data</span>
              </button>

              <button
                onClick={() => applyPresetData(currentPreset, 'ACTUAL')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  benchmarkMode === 'ACTUAL'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🔍 Audited Ground Truth</span>
              </button>

              <button
                onClick={() => setBenchmarkMode('CUSTOM')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  benchmarkMode === 'CUSTOM'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>⚙️ Custom Simulation</span>
              </button>
            </div>
          </div>

          {/* Forensic Claim Gap Audit Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/60">
            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Claimed vs Actual Revenue</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-semibold text-amber-400">
                  ₹{(currentPreset.claimed_data.monthly_revenue / 100000).toFixed(1)}L
                </span>
                <span className="text-[10px] text-slate-500">vs</span>
                <span className="text-sm font-semibold text-emerald-400">
                  ₹{(currentPreset.actual_data.monthly_revenue / 100000).toFixed(1)}L
                </span>
              </div>
              <span className="text-[10px] text-rose-400 block mt-0.5">
                {currentPreset.claim_gap.revenue_gap_pct > 0 ? `+${currentPreset.claim_gap.revenue_gap_pct}% claimed gap` : 'Parity'}
              </span>
            </div>

            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Claimed vs Actual Monthly Profit</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-semibold text-amber-400">
                  ₹{(currentPreset.claimed_data.monthly_profit / 1000).toFixed(0)}k
                </span>
                <span className="text-[10px] text-slate-500">vs</span>
                <span className="text-sm font-semibold text-emerald-400">
                  ₹{(currentPreset.actual_data.monthly_profit / 1000).toFixed(0)}k
                </span>
              </div>
              <span className="text-[10px] text-rose-400 block mt-0.5">
                ₹{(currentPreset.claim_gap.profit_gap / 1000).toFixed(0)}k / month profit variance
              </span>
            </div>

            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Claimed vs Actual Net Margin</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-semibold text-amber-400">
                  {currentPreset.claimed_data.net_margin_pct}%
                </span>
                <span className="text-[10px] text-slate-500">vs</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {currentPreset.actual_data.net_margin_pct}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Payback: {currentPreset.claimed_data.payback_months} vs {currentPreset.actual_data.payback_months} mo
              </span>
            </div>

            <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Forensic Claim Severity</span>
              <div>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  currentPreset.claim_gap.severity === 'CRITICAL'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : currentPreset.claim_gap.severity === 'HIGH'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {currentPreset.claim_gap.severity} VARIANCE
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Mode: <strong className="text-white font-medium">{benchmarkMode}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN CALCULATOR PANE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* LEFT: DRIVERS & OPERATING COST CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Section 1: Revenue Drivers */}
          <div className="bg-slate-900/35 border border-slate-800/60 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Revenue & Footfall Drivers</span>
              </h2>
              <button 
                onClick={recalculate} 
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {/* Daily Customers / Transactions */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{trafficLabels.volumeLabel}</span>
                <span className="font-semibold text-emerald-400">{customersDaily} units/day</span>
              </div>
              <input
                type="range"
                min={10}
                max={Math.max(500, customersDaily * 2)}
                step={5}
                value={customersDaily}
                onChange={(e) => {
                  setCustomersDaily(Number(e.target.value));
                  setBenchmarkMode('CUSTOM');
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Low: 25</span>
                <span>Claimed: {currentPreset?.claimed_data.customers_daily || 120}</span>
                <span>Peak: 450+</span>
              </div>
            </div>

            {/* Ticket Value */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{trafficLabels.ticketLabel}</span>
                <span className="font-semibold text-emerald-400">₹{ticketValue.toLocaleString('en-IN')} / transaction</span>
              </div>
              <input
                type="range"
                min={50}
                max={Math.max(5000, ticketValue * 2.5)}
                step={25}
                value={ticketValue}
                onChange={(e) => {
                  setTicketValue(Number(e.target.value));
                  setBenchmarkMode('CUSTOM');
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Total Capital Investment */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Total Capital Outlay</span>
                <span className="font-semibold text-white">₹{(totalInvestment / 100000).toFixed(1)} Lakhs</span>
              </div>
              <input
                type="range"
                min={300000}
                max={15000000}
                step={100000}
                value={totalInvestment}
                onChange={(e) => {
                  setTotalInvestment(Number(e.target.value));
                  setBenchmarkMode('CUSTOM');
                }}
                className="w-full accent-white cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Operating Costs */}
          <div className="bg-slate-900/35 border border-slate-800/60 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 backdrop-blur-sm">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800/70 pb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cost Structure & Royalties</span>
            </h2>

            {/* COGS % */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Raw Material / Product Cost (COGS)</span>
                <span className="font-semibold text-rose-400">{cogsPct}% of Revenue</span>
              </div>
              <input
                type="range"
                min={10}
                max={75}
                step={1}
                value={cogsPct}
                onChange={(e) => {
                  setCogsPct(Number(e.target.value));
                  setBenchmarkMode('CUSTOM');
                }}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Store Rent */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Monthly Commercial Rent</span>
                <span className="font-semibold text-white">₹{monthlyRent.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={15000}
                max={400000}
                step={5000}
                value={monthlyRent}
                onChange={(e) => {
                  setMonthlyRent(Number(e.target.value));
                  setBenchmarkMode('CUSTOM');
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Staff Salaries */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Staff & Technician Salaries</span>
                <span className="font-semibold text-white">₹{salaries.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={15000}
                max={350000}
                step={5000}
                value={salaries}
                onChange={(e) => {
                  setSalaries(Number(e.target.value));
                  setBenchmarkMode('CUSTOM');
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Franchisor Royalty % */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Franchisor Royalty Fee</span>
                <span className="font-semibold text-amber-400">{royaltyPct}% of Gross</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.5}
                value={royaltyPct}
                onChange={(e) => {
                  setRoyaltyPct(Number(e.target.value));
                  setBenchmarkMode('CUSTOM');
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Local Marketing & Platforms */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Platform Delivery / Comm.</label>
                <input
                  type="number"
                  value={platformCommission}
                  onChange={(e) => {
                    setPlatformCommission(Number(e.target.value));
                    setBenchmarkMode('CUSTOM');
                  }}
                  className="w-full bg-slate-950/60 border border-slate-800/70 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Marketing / Promo Fund</label>
                <input
                  type="number"
                  value={marketing}
                  onChange={(e) => {
                    setMarketing(Number(e.target.value));
                    setBenchmarkMode('CUSTOM');
                  }}
                  className="w-full bg-slate-950/60 border border-slate-800/70 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: RESULTS, CHARTS & P&L WATERFALL (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {result && (
            <>
              {/* Primary KPI Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/35 border border-slate-800/60 p-3 sm:p-3.5 rounded-xl backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Monthly Revenue</span>
                  <span className="text-base sm:text-lg font-bold text-white">₹{(result.revenue / 100000).toFixed(1)}L</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">₹{result.revenue.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-slate-900/35 border border-emerald-500/30 p-3 sm:p-3.5 rounded-xl backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] text-emerald-400 block font-medium">Monthly Net Profit</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-400">₹{(result.monthly_net_profit / 100000).toFixed(2)}L</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Margin: {result.net_margin_pct}%</span>
                </div>

                <div className="bg-slate-900/35 border border-slate-800/60 p-3 sm:p-3.5 rounded-xl backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] text-indigo-400 block font-medium">Annual ROI</span>
                  <span className="text-base sm:text-lg font-bold text-white">{result.roi_annual}%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Annualized yield</span>
                </div>

                <div className="bg-slate-900/35 border border-slate-800/60 p-3 sm:p-3.5 rounded-xl backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] text-amber-400 block font-medium">Payback Horizon</span>
                  <span className="text-base sm:text-lg font-bold text-white">{result.payback_months} mo</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Capital recovery</span>
                </div>
              </div>

              {/* Visual Break-Even Curve Chart */}
              <div className="bg-slate-900/35 border border-slate-800/60 rounded-xl p-4 sm:p-5 shadow-sm backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      <span>Visual Break-Even Curve</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Intersection of Revenue Line with Fixed + Variable Total Operating Costs
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Break-Even Monthly Sales</span>
                    <span className="text-xs sm:text-sm font-semibold text-amber-400">
                      ₹{Math.round(result.break_even_monthly_sales).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="h-60 w-full">
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
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
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
              <div className="bg-slate-900/35 border border-slate-800/60 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 text-xs backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider text-slate-300">
                    Simulated Cash Flow Waterfall ({currentPreset?.name})
                  </h3>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Mode: {benchmarkMode}
                  </span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  <div className="py-2 flex justify-between font-bold text-white">
                    <span>Gross Revenue ({customersDaily} orders/day × ₹{ticketValue} × 30 days)</span>
                    <span>₹{result.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-rose-400">
                    <span>(-) Raw Materials & Product COGS ({cogsPct}%)</span>
                    <span>-₹{result.cogs_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between font-semibold text-slate-200 bg-slate-950/40 px-2 rounded">
                    <span>(=) Gross Trading Profit ({result.gross_margin_pct}%)</span>
                    <span>₹{result.gross_profit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-400">
                    <span>Store Commercial Rent</span>
                    <span>-₹{monthlyRent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-400">
                    <span>Staff & Operator Salaries</span>
                    <span>-₹{salaries.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-400">
                    <span>Utilities, Technology, Maintenance</span>
                    <span>-₹{(utilities + techFees + maintenance).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-400">
                    <span>Local Marketing & Aggregator Commissions</span>
                    <span>-₹{(marketing + platformCommission).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2 flex justify-between text-amber-400">
                    <span>Franchisor Royalty ({royaltyPct}%)</span>
                    <span>-₹{result.royalty_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-xs font-bold bg-emerald-950/25 border border-emerald-500/25 px-3 rounded-lg mt-1">
                    <span className="text-emerald-300">Net Monthly Operating Cash Flow</span>
                    <span className="text-emerald-400">₹{result.monthly_net_profit.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <div>Fixed Overhead Base: <strong className="text-slate-200">₹{result.fixed_costs.toLocaleString('en-IN')}/mo</strong></div>
                  <div>Variable Cost Ratio: <strong className="text-slate-200">{(100 - result.contribution_margin_ratio * 100).toFixed(1)}%</strong></div>
                </div>
              </div>

              {/* 5-Year Historical Performance Track Record */}
              {currentPreset && currentPreset.history && currentPreset.history.length > 0 && (
                <div className="bg-slate-900/35 border border-slate-800/60 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-emerald-400" />
                      <span>5-Year Historical Performance Record (2022 – 2026)</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">Ground Reality Audited</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    How {currentPreset.name}'s units actually performed over consecutive operational financial years:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                          <th className="py-2 pr-3">Year</th>
                          <th className="py-2 px-3">Annual Rev</th>
                          <th className="py-2 px-3">Annual Profit</th>
                          <th className="py-2 px-3">Annual ROI</th>
                          <th className="py-2 px-3">Outlets</th>
                          <th className="py-2 pl-3">Closure Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {currentPreset.history.map((h) => (
                          <tr key={h.year} className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-2 pr-3 font-semibold text-white">{h.year}</td>
                            <td className="py-2 px-3 text-slate-300">₹{(h.annual_revenue / 100000).toFixed(1)}L</td>
                            <td className="py-2 px-3 text-emerald-400 font-medium">₹{(h.annual_profit / 100000).toFixed(1)}L</td>
                            <td className="py-2 px-3 text-indigo-300">{h.roi_annual}%</td>
                            <td className="py-2 px-3 text-slate-300">{h.total_outlets} units</td>
                            <td className="py-2 pl-3 text-amber-400">{h.closure_rate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
