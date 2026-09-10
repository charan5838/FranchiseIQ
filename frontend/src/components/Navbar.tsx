import React, { useState } from 'react';
import { 
  Building2, Sparkles, SlidersHorizontal, Scale, 
  Calculator, Activity, MapPin, BookmarkCheck, Shield, LogOut, 
  User as UserIcon, Sun, Moon, Menu, X, ChevronDown, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInvestor } from '../context/InvestorContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { AboutModal } from './AboutModal';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, loginDemoAdmin, logout } = useAuth();
  const { comparisonList, watchlist } = useInvestor();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  const navigateTo = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
  };

  const isToolsActive = ['calculator', 'simulator', 'location'].includes(currentPage);

  return (
    <>
      <header className="bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/60 sticky top-0 z-40 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div 
              onClick={() => navigateTo('dashboard')}
              className="cursor-pointer group shrink-0 flex items-center"
            >
              <Logo size="md" showTagline />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentPage === 'dashboard'
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => navigateTo('explore')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentPage === 'explore'
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                }`}
              >
                Explore Franchises
              </button>

              <button
                onClick={() => navigateTo('compare')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentPage === 'compare'
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                }`}
              >
                <span>Compare</span>
                {comparisonList.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                    {comparisonList.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateTo('advisor')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentPage === 'advisor'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Advisor</span>
              </button>

              {/* Analytics & Tools Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setToolsDropdownOpen(prev => !prev)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    isToolsActive
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span>Analytics</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {toolsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-xl z-50 space-y-1">
                    <button
                      onClick={() => navigateTo('calculator')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                        currentPage === 'calculator' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Calculator className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-semibold">Financial Calculator</div>
                        <div className="text-[10px] text-slate-400">Unit P&L and break-even</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('simulator')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                        currentPage === 'simulator' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-teal-500" />
                      <div>
                        <div className="font-semibold">Scenario Simulator</div>
                        <div className="text-[10px] text-slate-400">Macro stress-testing</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('location')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                        currentPage === 'location' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <div>
                        <div className="font-semibold">Location Intelligence</div>
                        <div className="text-[10px] text-slate-400">Catchment & radar</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setAboutModalOpen(true)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                About
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => navigateTo('admin')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    currentPage === 'admin'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}
            </nav>

            {/* Right Action Utilities */}
            <div className="flex items-center gap-2">
              {/* Theme Switcher Toggle */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Watchlist Symbol Icon with Counter Badge */}
              <button
                onClick={() => navigateTo('watchlist')}
                title={`Watchlist (${watchlist.length} saved)`}
                className={`relative p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                  currentPage === 'watchlist'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-label="Watchlist"
              >
                <BookmarkCheck className="w-4 h-4" />
                {watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                    {watchlist.length}
                  </span>
                )}
              </button>

              {/* Auth Button */}
              {!user ? (
                <button
                  onClick={() => navigateTo('login')}
                  className="hidden sm:inline-flex text-xs px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-blue-500" />
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {user.role}
                    </span>
                  </div>

                  {user.role !== 'admin' && (
                    <button
                      onClick={loginDemoAdmin}
                      className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                      title="Switch to Demo Admin Mode"
                    >
                      Admin
                    </button>
                  )}

                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-1.5 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => navigateTo('dashboard')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'dashboard' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Home</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigateTo('explore')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'explore' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Explore Franchises</span>
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigateTo('compare')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'compare' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Compare Franchises</span>
              <div className="flex items-center gap-2">
                {comparisonList.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                    {comparisonList.length}
                  </span>
                )}
                <Scale className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            <button
              onClick={() => navigateTo('advisor')}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'advisor' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Investor Advisor</span>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </button>

            <div className="pt-2 pb-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                Analytics & Calculations
              </span>
            </div>

            <button
              onClick={() => navigateTo('calculator')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                currentPage === 'calculator' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>Financial Calculator</span>
              <Calculator className="w-4 h-4 text-blue-500" />
            </button>

            <button
              onClick={() => navigateTo('simulator')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                currentPage === 'simulator' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>Scenario Simulator</span>
              <Activity className="w-4 h-4 text-teal-500" />
            </button>

            <button
              onClick={() => navigateTo('location')}
              className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                currentPage === 'location' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>Location Intelligence</span>
              <MapPin className="w-4 h-4 text-indigo-500" />
            </button>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setAboutModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5"
              >
                <Info className="w-3.5 h-3.5" />
                <span>About FranchiseIQ</span>
              </button>

              {!user && (
                <button
                  onClick={() => navigateTo('login')}
                  className="text-xs px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* About FranchiseIQ Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};
