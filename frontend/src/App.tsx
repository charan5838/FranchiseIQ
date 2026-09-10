import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InvestorProvider } from './context/InvestorContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { InvestorAdvisor } from './pages/InvestorAdvisor';
import { ExploreFranchises } from './pages/ExploreFranchises';
import { FranchiseDetail } from './pages/FranchiseDetail';
import { FranchiseCompare } from './pages/FranchiseCompare';
import { FinancialCalculator } from './pages/FinancialCalculator';
import { ScenarioSimulator } from './pages/ScenarioSimulator';
import { LocationAnalysis } from './pages/LocationAnalysis';
import { WatchlistPage } from './pages/WatchlistPage';
import { AdminPortal } from './pages/AdminPortal';
import { LoginPage } from './pages/LoginPage';
import { Building2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(1);

  // Show sleek loader while checking persistent token
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 animate-pulse">
          <Building2 className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div className="text-base font-black tracking-tight text-white">
          Franchise<span className="text-emerald-400">IQ</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">Checking authorization credentials...</p>
      </div>
    );
  }

  // If user visits website for the first time without an active session, require login / register first
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500 selection:text-white">
        <header className="bg-[#090d16]/85 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm">
                  <Building2 className="w-4 h-4 text-slate-950 font-bold" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-white">
                    Franchise<span className="text-emerald-400">IQ</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="hidden sm:inline">First-time visitor?</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                  Secure Investor Portal
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <LoginPage setCurrentPage={setCurrentPage} />
        </main>

        <Footer setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  // Authenticated user experience: full access to all pages and navigation
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'advisor':
        return <InvestorAdvisor setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
      case 'explore':
        return <ExploreFranchises setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
      case 'detail':
        return <FranchiseDetail franchiseId={selectedFranchiseId} setCurrentPage={setCurrentPage} />;
      case 'compare':
        return <FranchiseCompare setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
      case 'calculator':
        return (
          <FinancialCalculator
            initialFranchiseId={selectedFranchiseId}
            setSelectedFranchiseId={setSelectedFranchiseId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'simulator':
        return <ScenarioSimulator />;
      case 'location':
        return <LocationAnalysis />;
      case 'watchlist':
        return <WatchlistPage setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
      case 'admin':
        return <AdminPortal />;
      case 'dashboard':
      default:
        return <Dashboard setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <InvestorProvider>
        <AppContent />
      </InvestorProvider>
    </AuthProvider>
  );
}
