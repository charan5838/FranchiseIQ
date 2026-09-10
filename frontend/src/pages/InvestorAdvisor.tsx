import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  Building2, Sliders, Scale, ShieldCheck, HelpCircle, MapPin,
  Filter, ArrowUpDown, LayoutGrid, ListOrdered, Search,
  Calculator, DollarSign, TrendingUp, ChevronRight, BarChart3, BookmarkCheck
} from 'lucide-react';
import { api } from '../services/api';
import { RankedFranchise, Sector } from '../types';
import { useInvestor } from '../context/InvestorContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { CITIES_AND_LOCALITIES, getCityInfo } from '../data/citiesAndLocalities';

interface InvestorAdvisorProps {
  setCurrentPage: (page: string) => void;
  setSelectedFranchiseId: (id: number) => void;
}

export const InvestorAdvisor: React.FC<InvestorAdvisorProps> = ({ setCurrentPage, setSelectedFranchiseId }) => {
  const { preferences, updatePreferences, toggleComparison, comparisonList, toggleWatchlist, isWatched } = useInvestor();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [results, setResults] = useState<RankedFranchise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Form State (Constraints)
  const [budgetLakhs, setBudgetLakhs] = useState<number>(preferences.budget / 100000 || 25);
  const [city, setCity] = useState<string>(preferences.city || 'Hyderabad');
  const [locality, setLocality] = useState<string>(preferences.locality || 'Hitec City');
  const [sectorId, setSectorId] = useState<number | null>(preferences.preferred_sector_id || null);
  const [areaSqft, setAreaSqft] = useState<number>(preferences.shop_area_sqft || 800);
  const [experience, setExperience] = useState<string>(preferences.business_experience || '0-2 years');
  const [involvement, setInvolvement] = useState<string>(preferences.desired_involvement || 'full-time');
  const [riskPref, setRiskPref] = useState<string>(preferences.risk_preference || 'Medium');
  const [desiredReturn, setDesiredReturn] = useState<number>(preferences.desired_return_pct || 25);
  const [maxPayback, setMaxPayback] = useState<number>(preferences.max_payback_months || 30);
  const [goal, setGoal] = useState<string>(preferences.goal || 'Maximum ROI');

  // Classification, Filter & Sort State for Advisor Results
  const [selectedSectorTab, setSelectedSectorTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('overall_score');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterVerification, setFilterVerification] = useState<string>('ALL');
  const [filterClaimGap, setFilterClaimGap] = useState<string>('ALL');
  const [filterBudgetCap, setFilterBudgetCap] = useState<number | 'ALL'>('ALL');
  const [viewLayout, setViewLayout] = useState<'sector_grouped' | 'ranked_list'>('sector_grouped');

  const currentCityInfo = getCityInfo(city) || CITIES_AND_LOCALITIES[0];

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const target = getCityInfo(newCity);
    if (target && target.localities.length > 0) {
      setLocality(target.localities[0].locality);
    }
  };

  useEffect(() => {
    api.getSectors().then(setSectors).catch(console.error);
    // Trigger initial ranking on load with default sample parameters (Hyderabad / ₹25L)
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    const budgetAmount = budgetLakhs * 100000;
    updatePreferences({
      budget: budgetAmount,
      city,
      locality,
      preferred_sector_id: sectorId,
      shop_area_sqft: areaSqft,
      business_experience: experience,
      desired_involvement: involvement,
      risk_preference: riskPref,
      desired_return_pct: desiredReturn,
      max_payback_months: maxPayback,
      goal
    });

    try {
      const data = await api.rankFranchises({
        budget: budgetAmount,
        city,
        locality,
        preferred_sector_id: sectorId,
        shop_area_sqft: areaSqft,
        business_experience: experience,
        desired_involvement: involvement,
        risk_preference: riskPref,
        desired_return_pct: desiredReturn,
        max_payback_months: maxPayback,
        goal
      });
      setResults(data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Distinct list of sectors present in current results
  const availableSectorsInResults = useMemo(() => {
    const map = new Map<string, number>();
    results.forEach(r => {
      map.set(r.sector_name, (map.get(r.sector_name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([sectorName, count]) => ({
      name: sectorName,
      count
    }));
  }, [results]);

  // Filter and Sort Processing
  const filteredAndSortedResults = useMemo(() => {
    let list = [...results];

    // 1. Sector Tab Filter
    if (selectedSectorTab !== 'ALL') {
      list = list.filter(r => r.sector_name.toLowerCase() === selectedSectorTab.toLowerCase());
    }

    // 2. Search Query (Name or Sub-sector)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.sub_sector.toLowerCase().includes(q) ||
        r.sector_name.toLowerCase().includes(q)
      );
    }

    // 3. Risk Filter
    if (filterRisk === 'LOW') {
      list = list.filter(r => r.risk_score < 35 || r.risk_tier.toLowerCase().includes('low'));
    } else if (filterRisk === 'MEDIUM') {
      list = list.filter(r => r.risk_score >= 35 && r.risk_score <= 65);
    } else if (filterRisk === 'HIGH') {
      list = list.filter(r => r.risk_score > 65 || r.risk_tier.toLowerCase().includes('high'));
    }

    // 4. Verification Tier Filter
    if (filterVerification === 'VERIFIED') {
      list = list.filter(r => r.primary_source_type === 'VERIFIED');
    } else if (filterVerification === 'REPORTED') {
      list = list.filter(r => r.primary_source_type === 'VERIFIED' || r.primary_source_type === 'REPORTED');
    }

    // 5. Claim Gap Severity Filter
    if (filterClaimGap === 'SAFE') {
      list = list.filter(r => r.claim_gap_severity !== 'HIGH');
    } else if (filterClaimGap === 'LOW_ONLY') {
      list = list.filter(r => r.claim_gap_severity === 'LOW');
    }

    // 6. Budget Cap Filter
    if (filterBudgetCap !== 'ALL') {
      list = list.filter(r => r.total_investment <= filterBudgetCap);
    }

    // 7. Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'roi_desc':
          return b.roi_annual - a.roi_annual;
        case 'profit_desc':
          return b.monthly_profit - a.monthly_profit;
        case 'investment_asc':
          return a.total_investment - b.total_investment;
        case 'investment_desc':
          return b.total_investment - a.total_investment;
        case 'payback_asc':
          return a.payback_months - b.payback_months;
        case 'risk_asc':
          return a.risk_score - b.risk_score;
        case 'confidence_desc':
          return b.data_confidence - a.data_confidence;
        case 'overall_score':
        default:
          return b.overall_score - a.overall_score;
      }
    });

    return list;
  }, [
    results, selectedSectorTab, searchQuery, sortBy,
    filterRisk, filterVerification, filterClaimGap, filterBudgetCap
  ]);

  // Grouped by sector for the classified view
  const sectorGroups = useMemo(() => {
    const groups: Record<string, RankedFranchise[]> = {};
    filteredAndSortedResults.forEach(r => {
      if (!groups[r.sector_name]) {
        groups[r.sector_name] = [];
      }
      groups[r.sector_name].push(r);
    });
    return Object.entries(groups).map(([sectorName, items]) => {
      const avgRoi = Math.round(items.reduce((acc, curr) => acc + curr.roi_annual, 0) / items.length);
      const avgProfit = Math.round(items.reduce((acc, curr) => acc + curr.monthly_profit, 0) / items.length);
      const minInv = Math.min(...items.map(i => i.total_investment));
      const topScore = Math.max(...items.map(i => i.overall_score));
      return {
        sectorName,
        items,
        avgRoi,
        avgProfit,
        minInv,
        topScore
      };
    });
  }, [filteredAndSortedResults]);

  const handleOpenCalculator = (franchiseId: number) => {
    setSelectedFranchiseId(franchiseId);
    setCurrentPage('calculator');
  };

  const handleOpenDetail = (franchiseId: number) => {
    setSelectedFranchiseId(franchiseId);
    setCurrentPage('detail');
  };

  // Render a Single Franchise Card
  const renderFranchiseCard = (f: RankedFranchise) => {
    const isCompared = comparisonList.includes(f.franchise_id);
    const isTop = f.rank === 1;

    return (
      <div
        key={f.franchise_id}
        className={`bg-slate-900/90 rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
          isTop 
            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-emerald-500/5' 
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Top Bar: Rank, Name, Badges, Overall Score */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shadow-sm ${
              isTop ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}>
              #{f.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 
                  onClick={() => handleOpenDetail(f.franchise_id)}
                  className="text-base font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  {f.name}
                </h4>
                <VerificationBadge sourceType={f.primary_source_type} confidence={f.data_confidence} size="sm" />
              </div>
              <p className="text-xs text-slate-400">{f.sector_name} • {f.sub_sector}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Franchise Score</div>
              <div className="text-xl font-black text-emerald-400">{f.overall_score}<span className="text-xs text-slate-500 font-normal">/100</span></div>
            </div>
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Investment</span>
            <span className="text-slate-200 font-bold">₹{(f.total_investment / 100000).toFixed(1)} Lakhs</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Monthly Net Profit</span>
            <span className="text-emerald-400 font-bold">₹{f.monthly_profit.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Annual Net ROI</span>
            <span className="text-white font-bold">{f.roi_annual}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Payback Period</span>
            <span className="text-slate-200 font-semibold">{f.payback_months} Months</span>
          </div>
        </div>

        {/* 6-Factor Score Breakdown */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Algorithmic Fit Breakdown</span>
            <span className="text-slate-400 font-mono text-[10px]">Max 100 pts</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">ROI (20)</span>
              <span className="font-bold text-emerald-400">{f.score_breakdown.roi_score}</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Payback (20)</span>
              <span className="font-bold text-teal-400">{f.score_breakdown.payback_score}</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Location (20)</span>
              <span className="font-bold text-indigo-400">{f.score_breakdown.location_score}</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Growth (15)</span>
              <span className="font-bold text-purple-400">{f.score_breakdown.growth_score}</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Risk Buffer (15)</span>
              <span className="font-bold text-amber-400">{f.score_breakdown.risk_score}</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Data Conf (10)</span>
              <span className="font-bold text-blue-400">{f.score_breakdown.data_confidence}</span>
            </div>
          </div>
        </div>

        {/* Why Recommended & Identified Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl">
            <h5 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Why {f.name} fits your criteria</span>
            </h5>
            <ul className="space-y-1 text-slate-300">
              {f.why_recommended.map((pro, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/20 p-3.5 rounded-xl">
            <h5 className="font-bold text-rose-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Identified Sensitivity & Risks</span>
            </h5>
            <ul className="space-y-1 text-slate-300">
              {f.key_risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions Footer Strip: Easy Franchise Selection for Calculator & Detail */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{f.space_assessment}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick 1-Click Select for Financial Calculator */}
            <button
              onClick={() => handleOpenCalculator(f.franchise_id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Open in Unit Financial Calculator with Claimed vs Actual Benchmarks"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Financial Calculator</span>
            </button>

            {/* Compare */}
            <button
              onClick={() => toggleComparison(f.franchise_id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                isCompared 
                  ? 'bg-emerald-500 text-slate-950 font-bold' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Compare' : 'Compare'}</span>
            </button>

            {/* Watchlist */}
            <button
              onClick={() => toggleWatchlist(f.franchise_id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                isWatched(f.franchise_id)
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isWatched(f.franchise_id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <BookmarkCheck className={`w-3.5 h-3.5 ${isWatched(f.franchise_id) ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{isWatched(f.franchise_id) ? 'Watched' : 'Watchlist'}</span>
            </button>

            {/* Deep Dive */}
            <button
              onClick={() => handleOpenDetail(f.franchise_id)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>Audit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Sector-Classified Investor Decision Support
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Investor Financial Advisor</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Enter your capital parameters and city catchment to discover algorithmic opportunities. Classify opportunities <strong>by sector</strong>, filter by risk and verification, and sort by ROI, profit, or payback.
        </p>
      </div>

      {/* 2-Column Layout: Inputs (Left) and Sector-Classified Rankings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Investor Profile & Constraints (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Investment Constraints</span>
            </h2>

            {/* Budget */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="text-slate-300 font-medium">Investment Budget (₹ Lakhs)</label>
                <span className="text-emerald-400 font-bold">₹{budgetLakhs} Lakhs</span>
              </div>
              <input
                type="range"
                min={5}
                max={150}
                step={5}
                value={budgetLakhs}
                onChange={(e) => setBudgetLakhs(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>₹5 Lakhs</span>
                <span>₹50 Lakhs</span>
                <span>₹1.5 Crore</span>
              </div>
            </div>

            {/* City & Locality */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Target Commercial Metro</label>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  {CITIES_AND_LOCALITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Prime Area / Catchment Locality</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none font-medium"
                >
                  {currentCityInfo.localities.map((loc) => (
                    <option key={loc.locality} value={loc.locality}>
                      ⭐ {loc.locality} ({loc.tag})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shop Area */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="text-slate-300 font-medium">Available Shop/Office Area</label>
                <span className="text-slate-200 font-bold">{areaSqft} sq ft</span>
              </div>
              <input
                type="range"
                min={200}
                max={5000}
                step={100}
                value={areaSqft}
                onChange={(e) => setAreaSqft(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Preferred Sector Constraint (Optional Backend Filter) */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Sector Constraint (Backend)</label>
              <select
                value={sectorId || ''}
                onChange={(e) => setSectorId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              >
                <option value="">All 12 Sectors (Recommended)</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Business Experience & Involvement */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Experience</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="None">First-time Investor</option>
                  <option value="0-2 years">0 - 2 Years</option>
                  <option value="3-5 years">3 - 5 Years</option>
                  <option value="5+ years">5+ Years</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Involvement</label>
                <select
                  value={involvement}
                  onChange={(e) => setInvolvement(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="full-time">Full-Time Operator</option>
                  <option value="part-time">Part-Time / FOCO</option>
                </select>
              </div>
            </div>

            {/* Risk Preference & Goal */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Risk Preference</label>
                <select
                  value={riskPref}
                  onChange={(e) => setRiskPref(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Primary Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-semibold focus:border-emerald-500 outline-none"
                >
                  <option value="Maximum ROI">Maximum ROI</option>
                  <option value="Lowest Risk">Lowest Risk</option>
                  <option value="Fastest Payback">Fastest Payback</option>
                  <option value="Lowest Investment">Lowest Investment</option>
                  <option value="Highest Profit">Highest Profit</option>
                  <option value="Highest Growth">Highest Growth</option>
                  <option value="Best Overall">Best Overall</option>
                </select>
              </div>
            </div>

            {/* Payback target */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <label className="text-slate-300 font-medium">Max Acceptable Payback</label>
                <span className="text-slate-200 font-bold">{maxPayback} Months</span>
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

            {/* Submit Button */}
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Score Opportunities</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Sector Classification, Filter, Sort & Ranked Results (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Top Advisor Strategy Summary Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400">Target Strategy:</span>
              <span className="text-xs font-bold text-emerald-400 ml-1.5">{goal}</span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-xs text-slate-300">{locality}, {city}</span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-xs text-slate-300">₹{budgetLakhs}L Budget</span>
            </div>
            <div className="text-xs text-slate-400">
              Found <strong className="text-white">{results.length}</strong> viable opportunities
            </div>
          </div>

          {/* SECTOR CLASSIFICATION TABS BAR */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Classify by Sector</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Showing {filteredAndSortedResults.length} of {results.length} matches
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setSelectedSectorTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSectorTab === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Sectors ({results.length})
              </button>

              {availableSectorsInResults.map((sec) => (
                <button
                  key={sec.name}
                  onClick={() => setSelectedSectorTab(sec.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSectorTab === sec.name
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sec.name} ({sec.count})
                </button>
              ))}
            </div>
          </div>

          {/* FILTER & SORT CONTROL BAR */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            {/* Search & Layout View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by franchise brand name or subsector..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* View Layout Toggle: Sector Grouped vs Flat List */}
              <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0">
                <button
                  onClick={() => setViewLayout('sector_grouped')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    viewLayout === 'sector_grouped'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Sector Groups</span>
                </button>
                <button
                  onClick={() => setViewLayout('ranked_list')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    viewLayout === 'ranked_list'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ranked List</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-xs">
              {/* Sort Dropdown */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  <span>Sort By</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="overall_score">⭐ Franchise Score (Default)</option>
                  <option value="roi_desc">📈 Highest Net Annual ROI</option>
                  <option value="profit_desc">💰 Highest Monthly Profit</option>
                  <option value="investment_asc">💵 Lowest Investment</option>
                  <option value="investment_desc">🏛️ Highest Investment</option>
                  <option value="payback_asc">⚡ Fastest Payback Horizon</option>
                  <option value="risk_asc">🛡️ Lowest Risk Profile</option>
                  <option value="confidence_desc">🔍 Data Confidence</option>
                </select>
              </div>

              {/* Risk Filter */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Risk Profile</label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="LOW">Low Risk Only</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Growth / High Risk</option>
                </select>
              </div>

              {/* Verification Tier */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Data Verification</label>
                <select
                  value={filterVerification}
                  onChange={(e) => setFilterVerification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Data Tiers</option>
                  <option value="VERIFIED">Verified Ground Truth</option>
                  <option value="REPORTED">Reported or Higher</option>
                </select>
              </div>

              {/* Claim Gap Severity */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Claim Safety</label>
                <select
                  value={filterClaimGap}
                  onChange={(e) => setFilterClaimGap(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Opportunities</option>
                  <option value="SAFE">Safe Claims (Low/Mod)</option>
                  <option value="LOW_ONLY">Strict Low Variance Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* NO RESULTS NOTICE */}
          {filteredAndSortedResults.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No matching franchises found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Try resetting your sector tab filter, clearing the search query, or selecting "All Risk Levels".
              </p>
              <button
                onClick={() => {
                  setSelectedSectorTab('ALL');
                  setSearchQuery('');
                  setFilterRisk('ALL');
                  setFilterVerification('ALL');
                  setFilterClaimGap('ALL');
                  setSortBy('overall_score');
                }}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-semibold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* RENDER VIEW 1: SECTOR CLASSIFIED GROUPED VIEW */}
          {viewLayout === 'sector_grouped' && sectorGroups.length > 0 && (
            <div className="space-y-6">
              {sectorGroups.map((group) => (
                <div key={group.sectorName} className="space-y-3">
                  {/* Sector Header Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                          Sector: {group.sectorName}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {group.items.length} opportunities matching your capital & catchment
                        </p>
                      </div>
                    </div>

                    {/* Sector Statistics Quick Metrics */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Avg ROI</span>
                        <span className="font-bold text-emerald-400">{group.avgRoi}%</span>
                      </div>
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Avg Profit</span>
                        <span className="font-bold text-white">₹{(group.avgProfit / 1000).toFixed(0)}k/mo</span>
                      </div>
                      <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Min Entry</span>
                        <span className="font-bold text-indigo-300">₹{(group.minInv / 100000).toFixed(1)}L</span>
                      </div>
                    </div>
                  </div>

                  {/* Sector Franchise Cards */}
                  <div className="space-y-3">
                    {group.items.map(renderFranchiseCard)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RENDER VIEW 2: FLAT RANKED LIST VIEW */}
          {viewLayout === 'ranked_list' && filteredAndSortedResults.length > 0 && (
            <div className="space-y-4">
              {filteredAndSortedResults.map(renderFranchiseCard)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
