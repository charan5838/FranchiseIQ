import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, Sparkles, SlidersHorizontal, Scale, 
  Calculator, Activity, MapPin, BookmarkCheck, Shield, LogOut, User as UserIcon,
  ChevronDown, Globe, LifeBuoy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInvestor } from '../context/InvestorContext';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, isHost, toggleHostAdminMode, logout } = useAuth();
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
    { id: 'sources', label: 'Data Sources', icon: Globe },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  const isAnalyticsActive = ['calculator', 'simulator', 'location'].includes(currentPage);

  return (
    <header className="bg-[#090d16]/85 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentPage('dashboard')}
            className="cursor-pointer group shrink-0"
          >
            <BrandLogo size="md" showTagline />
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

            {/* Admin link visible ONLY to authorized Host Charan */}
            {isHost && user?.role === 'admin' && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-amber-400 hover:bg-amber-950/30'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
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
                    {isHost ? 'Host Mode' : `${user.role} mode`}
                  </span>
                </div>

                {/* ONLY Host (Charan) can toggle Admin mode */}
                {isHost && (
                  <button
                    onClick={toggleHostAdminMode}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 cursor-pointer font-bold flex items-center gap-1 transition-all shadow-xs"
                    title="Toggle Host Admin / Investor Mode"
                  >
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>{user.role === 'admin' ? 'Admin Mode' : 'Investor View'}</span>
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
          {isHost && (
            <button
              onClick={() => setCurrentPage('admin')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                currentPage === 'admin' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-amber-400'
              }`}
            >
              Host Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
