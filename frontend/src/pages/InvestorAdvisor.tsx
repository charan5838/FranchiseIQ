import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  Building2, Sliders, Scale, ShieldCheck, HelpCircle, MapPin
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
  const { preferences, updatePreferences, toggleComparison, comparisonList } = useInvestor();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [results, setResults] = useState<RankedFranchise[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Form State
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Personalized Decision Support Flow
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Investor Financial Advisor</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Enter your specific financial constraints, location, space, and risk tolerance. Our algorithmic ranking engine scores opportunities and provides an audit of <strong>why each franchise is ranked</strong>.
        </p>
      </div>

      {/* 2-Column Layout: Inputs (Left) and Personalized Ranking Results (Right) */}
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

            {/* Preferred Sector */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Preferred Sector</label>
              <select
                value={sectorId || ''}
                onChange={(e) => setSectorId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              >
                <option value="">All Sectors (Cross-Category Intelligence)</option>
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
                  <span>Analyze & Rank Opportunities</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Personalized Rankings & Explanations (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
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

          {results.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No exact franchise matches</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Try widening your budget range or choosing "All Sectors" to discover opportunities.
              </p>
            </div>
          )}

          {/* Ranked Franchise Cards */}
          <div className="space-y-4">
            {results.map((f) => {
              const isCompared = comparisonList.includes(f.franchise_id);
              const isTop = f.rank === 1;

              return (
                <div
                  key={f.franchise_id}
                  className={`bg-slate-900/90 rounded-2xl border transition-all p-5 shadow-sm ${
                    isTop 
                      ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-emerald-500/5' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Rank, Name, Badges, Overall Score */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center ${
                        isTop ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{f.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={() => {
                              setSelectedFranchiseId(f.franchise_id);
                              setCurrentPage('detail');
                            }}
                            className="text-base font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                          >
                            {f.name}
                          </h3>
                          <VerificationBadge sourceType={f.primary_source_type} confidence={f.data_confidence} size="sm" />
                        </div>
                        <p className="text-xs text-slate-400">{f.sector_name} • {f.sub_sector}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Franchise Score</div>
                        <div className="text-xl font-black text-emerald-400">{f.overall_score}<span className="text-xs text-slate-500 font-normal">/100</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Investment</span>
                      <span className="text-slate-200 font-bold">₹{(f.total_investment/100000).toFixed(1)} Lakhs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Monthly Profit</span>
                      <span className="text-emerald-400 font-bold">₹{f.monthly_profit.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Annual ROI</span>
                      <span className="text-white font-bold">{f.roi_annual}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Payback Period</span>
                      <span className="text-slate-200 font-semibold">{f.payback_months} Months</span>
                    </div>
                  </div>

                  {/* 6-Factor Score Breakdown (Section 11) */}
                  <div className="mb-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      <span>Score Component Breakdown</span>
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

                  {/* Why This Franchise Was Ranked #X (Section 19) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
                    {/* Advantages */}
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl">
                      <h5 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Why {f.name} is #{f.rank} for you</span>
                      </h5>
                      <ul className="space-y-1.5 text-slate-300">
                        {f.why_recommended.map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Disadvantages / Risks (Never hidden) */}
                    <div className="bg-rose-950/20 border border-rose-500/20 p-3.5 rounded-xl">
                      <h5 className="font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Identified Risks & Sensitivity Factors</span>
                      </h5>
                      <ul className="space-y-1.5 text-slate-300">
                        {f.key_risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{f.space_assessment}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleComparison(f.franchise_id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                          isCompared 
                            ? 'bg-emerald-500 text-slate-950 font-bold' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{isCompared ? 'In Compare List' : 'Compare Side-by-Side'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedFranchiseId(f.franchise_id);
                          setCurrentPage('detail');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Deep Dive Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
