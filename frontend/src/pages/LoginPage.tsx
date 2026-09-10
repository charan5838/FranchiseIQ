import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvestor } from '../context/InvestorContext';
import {
  User, Mail, Phone, IndianRupee, MapPin, Briefcase,
  Shield, CheckCircle2, ArrowRight, Sparkles, Building2, KeyRound, Lock, UserPlus, LogIn
} from 'lucide-react';
import { CITIES_AND_LOCALITIES, getCityInfo } from '../data/citiesAndLocalities';

interface LoginPageProps {
  setCurrentPage: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage }) => {
  const { login, register, quickLogin, loginDemoInvestor, loginDemoAdmin } = useAuth();
  const { updatePreferences } = useInvestor();

  // Auth Mode: 'login' (registered user checking credentials) vs 'register' (first-time visitor creating account)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
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

  // Sign In with registered credentials
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your registered email address and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      // On success, redirect to website dashboard
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register a new user account
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);

      // Save preferences to context
      updatePreferences({
        budget,
        city,
        locality,
        business_experience: experience,
        risk_preference: riskPreference
      });

      // Redirect to website dashboard
      setCurrentPage('dashboard');
    } catch (err: any) {
      // If email exists, suggest signing in
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Please sign in with your password.');
        setAuthMode('login');
      } else {
        setError(err.message || 'Registration failed. Please verify your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoInvestor = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginDemoInvestor();
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError('Failed to login with demo investor account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginDemoAdmin();
      setCurrentPage('admin');
    } catch (err: any) {
      setError('Failed to login with demo admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 max-w-5xl mx-auto flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Value Props Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Franchise Intelligence & Decision Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Invest in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Right Franchise</span>, Not Just the Brand.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Please log in or create an account to unlock verified ROI rankings, forensic profit gap audits, and top profit-making franchise leaders across all 12 sectors.
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
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-emerald-400">Rajesh Sharma</div>
                <div className="text-[10px] text-slate-400">Investor (₹25L Demo)</div>
              </button>
              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-cyan-400">Vikram Mehta</div>
                <div className="text-[10px] text-slate-400">Admin / Chief Analyst</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          
          {/* Tabs: Sign In vs Create Account */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In (Registered)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New User (Sign Up)</span>
              </button>
            </div>

            <div className="hidden sm:block text-[11px] text-slate-400">
              {authMode === 'login' ? 'Existing Member' : 'First-time Visitor'}
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️ {error}</span>
            </div>
          )}

          {authMode === 'login' ? (
            /* REGISTERED USER LOGIN FORM (CREDENTIAL CHECK) */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Welcome Back</h3>
                <p className="text-xs text-slate-400">
                  Enter your registered credentials to access your FranchiseIQ portfolio.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registered Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Password *</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying Credentials...' : 'Sign In & Access Website'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Don't have an account yet? <span className="text-emerald-400 font-semibold underline">Register here</span>
                </button>
              </div>
            </form>
          ) : (
            /* NEW USER REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Create Investor Account</h3>
                <p className="text-xs text-slate-400">
                  Register your account to unlock verified unit economics and personalized franchise matches.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose Password (min 6 characters) *</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Target Capital Budget */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Investment Capital</span>
                    </span>
                    <span className="text-emerald-400 font-bold">₹{(budget / 100000).toFixed(1)} Lakhs</span>
                  </label>
                  <input
                    type="range"
                    min={500000}
                    max={15000000}
                    step={250000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Target City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Target City</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {CITIES_AND_LOCALITIES.map((c) => (
                      <option key={c.city} value={c.city}>{c.city} ({c.state})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Register & Enter FranchiseIQ'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Already registered? <span className="text-emerald-400 font-semibold underline">Sign In with your password</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
