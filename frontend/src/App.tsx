import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InvestorProvider } from './context/InvestorContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BrandLogo } from './components/BrandLogo';
import { MobileAppNav } from './components/MobileAppNav';
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
import { DataSourcesPage } from './pages/DataSourcesPage';
import { CustomerSupport } from './pages/CustomerSupport';
import { HelpChatbot } from './components/HelpChatbot';
import { LoginPage } from './pages/LoginPage';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(1);

  // Show sleek branded loader while checking persistent token
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-slate-100 p-4">
        <BrandLogo size="xl" showTagline className="animate-pulse mb-3" />
        <p className="text-xs text-slate-500 mt-2 font-mono">Verifying authorization credentials...</p>
      </div>
    );
  }

  // If user visits website for the first time without an active session, require login / register first
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500 selection:text-white pb-6">
        <header className="bg-[#090d16]/85 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <BrandLogo size="md" showTagline />
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
      case 'sources':
        return <DataSourcesPage setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
      case 'support':
        return <CustomerSupport setCurrentPage={setCurrentPage} />;
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
      {/* pb-20 on mobile to give clearance for native mobile bottom navigation bar */}
      <main className="flex-1 pb-20 md:pb-0">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
      {/* Persistent Floating Help Chatbot at bottom-right */}
      <HelpChatbot setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />
      {/* Mobile App Native Bottom Navigation Bar */}
      <MobileAppNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
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
