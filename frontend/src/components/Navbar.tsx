import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, Sparkles, SlidersHorizontal, Scale, 
  Calculator, Activity, MapPin, BookmarkCheck, Shield, LogOut, User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInvestor } from '../context/InvestorContext';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, loginDemoAdmin, logout } = useAuth();
  const { comparisonList, watchlist } = useInvestor();
  const [analyticsDropdownOpen, setAnalyticsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAnalyticsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'advisor', label: 'Advisor', icon: Sparkles, highlight: true },
    { id: 'explore', label: 'Explore', icon: SlidersHorizontal },
    { id: 'compare', label: 'Compare', icon: Scale, badge: comparisonList.length },
  ];

  const isAnalyticsActive = ['calculator', 'simulator', 'location'].includes(currentPage);

  return (
    <header className="bg-[#090d16]/85 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Platform Tagline */}
          <div 
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-lg font-black tracking-tight text-white">Franchise<span className="text-emerald-400">IQ</span></span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold'
                      : item.highlight
                      ? 'text-indigo-300 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-indigo-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Analytics Dropdown (Grouping Calculator, Simulator, and Location) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAnalyticsDropdownOpen(prev => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isAnalyticsActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analytics</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${analyticsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {analyticsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-900 rounded-xl border border-slate-800 p-1.5 shadow-xl z-50 space-y-1">
                  <button
                    onClick={() => {
                      setCurrentPage('calculator');
                      setAnalyticsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentPage === 'calculator'
                        ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <div>Financial Calculator</div>
                      <div className="text-[10px] text-slate-400 font-normal">Unit P&L and break-even</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('simulator');
                      setAnalyticsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentPage === 'simulator'
                        ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    <div>
                      <div>Scenario Simulator</div>
                      <div className="text-[10px] text-slate-400 font-normal">Macro stress-testing</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('location');
                      setAnalyticsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentPage === 'location'
                        ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <div>Location Intelligence</div>
                      <div className="text-[10px] text-slate-400 font-normal">Catchment & radar</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                    : 'text-rose-400 hover:bg-rose-950/30'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Utility: Watchlist Symbol Icon & User Auth */}
          <div className="flex items-center gap-2.5">
            {/* Watchlist Symbol Only */}
            <button
              onClick={() => setCurrentPage('watchlist')}
              title={`Watchlist (${watchlist.length} saved)`}
              className={`relative p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                currentPage === 'watchlist'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-label="My Watchlist"
            >
              <BookmarkCheck className="w-4 h-4" />
              {watchlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </button>

            {!user ? (
              <button
                onClick={() => setCurrentPage('login')}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-white flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-emerald-400" />
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    {user.role} mode
                  </span>
                </div>

                {user.role !== 'admin' && (
                  <button
                    onClick={loginDemoAdmin}
                    className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer"
                    title="Switch to Admin Mode"
                  >
                    Admin
                  </button>
                )}

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile secondary navigation bar */}
        <div className="xl:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-slate-800/80 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                currentPage === item.id ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage('calculator')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentPage === 'calculator' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setCurrentPage('simulator')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentPage === 'simulator' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setCurrentPage('location')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentPage === 'location' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Location
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentPage('admin')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                currentPage === 'admin' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-rose-400'
              }`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
