import React, { useState, useEffect } from 'react';
import { 
  Building2, SlidersHorizontal, Scale, Sparkles, Activity, BookmarkCheck, 
  Download, Check, Shield
} from 'lucide-react';
import { useInvestor } from '../context/InvestorContext';
import { useAuth } from '../context/AuthContext';

interface MobileAppNavProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const MobileAppNav: React.FC<MobileAppNavProps> = ({ currentPage, setCurrentPage }) => {
  const { comparisonList, watchlist } = useInvestor();
  const { isHost } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const navTabs = [
    { id: 'dashboard', label: 'Home', icon: Building2 },
    { id: 'explore', label: 'Explore', icon: SlidersHorizontal },
    { id: 'compare', label: 'Compare', icon: Scale, badge: comparisonList.length },
    { id: 'advisor', label: 'Advisor', icon: Sparkles, highlight: true },
    { id: 'calculator', label: 'Analytics', icon: Activity },
  ];

  return (
    <>
      {/* Optional Install Mobile App banner when available */}
      {showInstallBanner && !isInstalled && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-50 bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-sm">
              <Download className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">Install FranchiseIQ App</div>
              <div className="text-[10px] text-slate-400">Add to Home Screen for fast mobile access</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Native Mobile Bottom Navigation Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl select-none"
        aria-label="Mobile Navigation"
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id || (tab.id === 'calculator' && ['calculator', 'simulator', 'location'].includes(currentPage));
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-400'
                  : tab.highlight
                  ? 'text-indigo-400/90'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium transition-all ${isActive ? 'font-bold text-emerald-400' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 shadow-[0_0_6px_#10b981]" />
              )}
            </button>
          );
        })}

        {/* Watchlist Mobile Tab */}
        <button
          onClick={() => setCurrentPage('watchlist')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            currentPage === 'watchlist' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <BookmarkCheck className={`w-5 h-5 transition-transform ${currentPage === 'watchlist' ? 'scale-110 text-emerald-400' : ''}`} />
            {watchlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                {watchlist.length}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-1 font-medium transition-all ${currentPage === 'watchlist' ? 'font-bold text-emerald-400' : ''}`}>
            Watchlist
          </span>
          {currentPage === 'watchlist' && (
            <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 shadow-[0_0_6px_#10b981]" />
          )}
        </button>

        {/* Host Admin Tab (ONLY visible if current user is Host) */}
        {isHost && (
          <button
            onClick={() => setCurrentPage('admin')}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              currentPage === 'admin' ? 'text-amber-400' : 'text-amber-400/60 hover:text-amber-300'
            }`}
            title="Host Admin Console"
          >
            <Shield className={`w-5 h-5 ${currentPage === 'admin' ? 'scale-110 text-amber-400' : ''}`} />
            <span className="text-[10px] mt-1 font-semibold">Host</span>
            {currentPage === 'admin' && (
              <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-[0_0_6px_#f59e0b]" />
            )}
          </button>
        )}
      </nav>
    </>
  );
};
