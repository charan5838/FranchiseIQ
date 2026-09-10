import React, { useState, useEffect } from 'react';
import { 
  MapPin, Store, Users, TrendingUp, AlertTriangle, 
  CheckCircle2, Compass, BarChart3, Navigation, Layers, Building2, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { LocationAnalysisResult } from '../types';
import { CITIES_AND_LOCALITIES, getCityInfo } from '../data/citiesAndLocalities';

export const LocationAnalysis: React.FC = () => {
  const [city, setCity] = useState('Hyderabad');
  const [locality, setLocality] = useState('Hitec City');
  const [pinCode, setPinCode] = useState('500081');
  const [areaSqft, setAreaSqft] = useState(800);
  const [monthlyRent, setMonthlyRent] = useState(108000);
  const [footfall, setFootfall] = useState(2200);

  const [result, setResult] = useState<LocationAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const currentCityInfo = getCityInfo(city) || CITIES_AND_LOCALITIES[0];

  const runLocationAnalysis = () => {
    setLoading(true);
    api.analyzeLocation({
      city,
      locality,
      pin_code: pinCode,
      available_area_sqft: areaSqft,
      monthly_rent: monthlyRent,
      footfall_estimate: footfall
    }).then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runLocationAnalysis();
  }, [city, locality, pinCode, areaSqft, monthlyRent, footfall]);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const target = getCityInfo(newCity);
    if (target && target.localities.length > 0) {
      const firstLoc = target.localities[0];
      setLocality(firstLoc.locality);
      setPinCode(firstLoc.pinCode);
      setMonthlyRent(firstLoc.defaultRent);
      setFootfall(firstLoc.footfall);
    }
  };

  const handleLocalitySelect = (selectedLocalityName: string) => {
    setLocality(selectedLocalityName);
    const locInfo = currentCityInfo.localities.find(l => l.locality === selectedLocalityName);
    if (locInfo) {
      setPinCode(locInfo.pinCode);
      setMonthlyRent(locInfo.defaultRent);
      setFootfall(locInfo.footfall);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <MapPin className="w-3.5 h-3.5" /> High-Street Catchment Feasibility
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Location Intelligence & Competitor Radar</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Evaluate local trade catchment demographics, commercial rent density, footfall conversion indices, and nearby direct competitors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Pane (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3">
              Location & Trade Catchment Details
            </h2>

            {/* City */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Target Commercial Metro</label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              >
                {CITIES_AND_LOCALITIES.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prime Locality Selector */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Prime Catchment Locality / Commercial Hub
              </label>
              <select
                value={locality}
                onChange={(e) => handleLocalitySelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none font-medium"
              >
                {currentCityInfo.localities.map((loc) => (
                  <option key={loc.locality} value={loc.locality}>
                    ⭐ {loc.locality} — {loc.tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Locality Edit & PIN */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Locality Label</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Available Area */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Available Store/Office Area</span>
                <span className="font-bold text-white">{areaSqft} sq ft</span>
              </div>
              <input
                type="range"
                min={200}
                max={3000}
                step={50}
                value={areaSqft}
                onChange={(e) => setAreaSqft(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Monthly Rent */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Offered Monthly Lease Rent</span>
                <span className="font-bold text-emerald-400">₹{monthlyRent.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={20000}
                max={350000}
                step={5000}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Rent Density: ~₹{Math.round(monthlyRent / areaSqft)} / sq ft
              </span>
            </div>

            {/* Estimated Footfall */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Estimated Daily Passerby Footfall</span>
                <span className="font-bold text-amber-400">{footfall.toLocaleString('en-IN')} people / day</span>
              </div>
              <input
                type="range"
                min={300}
                max={5000}
                step={100}
                value={footfall}
                onChange={(e) => setFootfall(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Output Score & Competitor Radar (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Overall Location Score Card (Section 9) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Composite Feasibility</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    Location Score: <span className="text-emerald-400">{result.overall_location_score}</span><span className="text-sm text-slate-500 font-normal">/100</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Evaluated for <strong>{result.locality}, {result.city}</strong> (PIN: {result.pin_code})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Competition</span>
                    <span className={`text-xs font-bold ${
                      result.competitive_intensity === 'Low' ? 'text-emerald-400' : result.competitive_intensity === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {result.competitive_intensity} Intensity
                    </span>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rent / sq ft</span>
                    <span className="text-xs font-bold text-white">₹{result.rent_per_sqft}</span>
                  </div>
                </div>
              </div>

              {/* 5 Dimensional Location Factor Breakdown */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Location Score Component Audit
                </h4>

                <div className="space-y-3 text-xs">
                  {/* Demand */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-300">Local Consumer Demand Index</span>
                      <span className="text-emerald-400">{result.demand_score}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.demand_score}%` }} />
                    </div>
                  </div>

                  {/* Footfall */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-300">High-Street Footfall Density</span>
                      <span className="text-indigo-400">{result.footfall_score}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${result.footfall_score}%` }} />
                    </div>
                  </div>

                  {/* Rent Efficiency */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-300">Rent Efficiency vs Commercial Revenue Potential</span>
                      <span className="text-teal-400">{result.rent_efficiency_score}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.rent_efficiency_score}%` }} />
                    </div>
                  </div>

                  {/* Competition Intensity */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-300">Market Room (Low Rival Density is Better)</span>
                      <span className="text-amber-400">{result.competition_score}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${result.competition_score}%` }} />
                    </div>
                  </div>

                  {/* Market Saturation */}
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-300">Trade Catchment Saturation</span>
                      <span className="text-rose-400">{result.market_saturation_score}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${result.market_saturation_score}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitor Radar Table (Section 10) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>Nearby Competitor Radar in {locality}</span>
                  </h4>
                  <span className="text-xs text-slate-400">{result.competitors?.length || 0} peer brands identified</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/50">
                      <tr>
                        <th className="py-2.5 px-3">Competitor Brand</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Distance</th>
                        <th className="py-2.5 px-3">Density</th>
                        <th className="py-2.5 px-3">Intensity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {result.competitors?.map((comp, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-semibold text-white">{comp.name}</td>
                          <td className="py-2.5 px-3 text-slate-300">{comp.category}</td>
                          <td className="py-2.5 px-3 text-slate-400">{comp.distance_km} km</td>
                          <td className="py-2.5 px-3 text-slate-400">{comp.density} units/km²</td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[11px] font-bold ${
                              comp.competitive_intensity === 'Low' ? 'text-emerald-400' : comp.competitive_intensity === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {comp.competitive_intensity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
