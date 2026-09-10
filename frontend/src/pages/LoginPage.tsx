import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvestor } from '../context/InvestorContext';
import {
  User, Mail, Phone, IndianRupee, MapPin, Briefcase,
  Shield, CheckCircle2, ArrowRight, Sparkles, Building2, KeyRound
} from 'lucide-react';
import { CITIES_AND_LOCALITIES, getCityInfo } from '../data/citiesAndLocalities';

interface LoginPageProps {
  setCurrentPage: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage }) => {
  const { quickLogin, login, loginDemoInvestor, loginDemoAdmin } = useAuth();
  const { updatePreferences } = useInvestor();

  // Form State
  const [isPasswordMode, setIsPasswordMode] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [budget, setBudget] = useState<number>(2500000);
  const [city, setCity] = useState<string>('Hyderabad');
  const [locality, setLocality] = useState<string>('Hitec City');
  const [experience, setExperience] = useState<string>('0-2 years');
  const [riskPreference, setRiskPreference] = useState<string>('Medium');

  const currentCityInfo = getCityInfo(city) || CITIES_AND_LOCALITIES[0];

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const target = getCityInfo(newCity);
    if (target && target.localities.length > 0) {
      setLocality(target.localities[0].locality);
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to proceed.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await quickLogin({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        budget,
        city,
        locality,
        business_experience: experience,
        risk_preference: riskPreference,
        goal: 'Maximum ROI'
      });

      // Update investor context
      updatePreferences({
        budget,
        city,
        locality,
        business_experience: experience,
        risk_preference: riskPreference
      });

      // Redirect to dashboard with sector profit leaders
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile entry.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoInvestor = async () => {
    setLoading(true);
    try {
      await loginDemoInvestor();
      setCurrentPage('dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    try {
      await loginDemoAdmin();
      setCurrentPage('admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 max-w-5xl mx-auto flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Value Props Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Franchise Intelligence & Decision Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Invest in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Right Franchise</span>, Not Just the Brand.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Enter your basic capital and preference details to unlock verified ROI rankings, forensic profit gap audits, and top profit-making franchise leaders across all 12 sectors.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">60+ Active Multi-Sector Franchises</h4>
                <p className="text-[11px] text-slate-400">Audited P&L for QSR, Healthcare, Gyms, Education, Logistics & more.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Claimed vs Actual Profit Gap Audit</h4>
                <p className="text-[11px] text-slate-400">Forensic detection of marketing overstatements and inflation fragility.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live Break-Even & Macro Stress-Tests</h4>
                <p className="text-[11px] text-slate-400">Simulate inflation, rent spikes and customer footfall variations.</p>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Demo Logins */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Or Test Instantly via Demo Accounts:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoInvestor}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/40 text-left transition-all"
              >
                <div className="text-xs font-bold text-emerald-400">Rajesh Sharma</div>
                <div className="text-[10px] text-slate-400">Investor (₹25L Demo)</div>
              </button>
              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <div className="text-xs font-bold text-cyan-400">Vikram Mehta</div>
                <div className="text-[10px] text-slate-400">Admin / Chief Analyst</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md backdrop-blur-xl relative">
          
          {/* Header & Mode Switcher */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">
                {isPasswordMode ? 'Sign In with Password' : 'Quick Investor Onboarding'}
              </h2>
              <p className="text-xs text-slate-400">
                {isPasswordMode ? 'Access your existing account' : 'Enter your name and basic details to unlock sector profit leaders'}
              </p>
            </div>
            <button
              onClick={() => {
                setIsPasswordMode(!isPasswordMode);
                setError(null);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
            >
              {isPasswordMode ? 'Quick Onboarding' : 'Password Login'}
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!isPasswordMode ? (
            /* QUICK BASIC INFO FORM */
            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sai Charan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Email Address (Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Investment Budget Slider */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Your Investment Capital Budget</span>
                  </label>
                  <span className="text-base font-black text-emerald-400">
                    ₹{(budget / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="10000000"
                  step="250000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>₹5 Lakhs</span>
                  <span>₹25 Lakhs</span>
                  <span>₹50 Lakhs</span>
                  <span>₹1.0 Crore</span>
                </div>
              </div>

              {/* City and Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Target City</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {CITIES_AND_LOCALITIES.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Prime Commercial Area</span>
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                  >
                    {currentCityInfo.localities.map((loc) => (
                      <option key={loc.locality} value={loc.locality}>
                        ⭐ {loc.locality} — {loc.tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience and Risk Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Business Experience</span>
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="0-2 years">First-Time Entrepreneur (0-2 yrs)</option>
                    <option value="2-5 years">Mid-Level Operator (2-5 yrs)</option>
                    <option value="5+ years">Seasoned Multi-Unit Investor (5+ yrs)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Risk Tolerance</span>
                  </label>
                  <select
                    value={riskPreference}
                    onChange={(e) => setRiskPreference(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Low">Low Risk (Recession-Proof, Established Brand)</option>
                    <option value="Medium">Medium Risk (Balanced Growth & Solid Cash Flow)</option>
                    <option value="High">High Growth (Aggressive ROI & Fast Expansion)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-sm shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <span>{loading ? 'Analyzing Opportunities...' : 'Enter FranchiseIQ & View Sector Profit Leaders'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* PASSWORD LOGIN FORM */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@franchiseiq.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
