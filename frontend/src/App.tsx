import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InvestorProvider } from './context/InvestorContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DemoBanner } from './components/DemoBanner';
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

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(1);

  const renderPage = () => {
    switch (currentPage) {
      case 'advisor':
        return <InvestorAdvisor setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
      case 'explore':
        return <ExploreFranchises setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
      case 'detail':
        return <FranchiseDetail franchiseId={selectedFranchiseId} setCurrentPage={setCurrentPage} />;
      case 'compare':
        return <FranchiseCompare setCurrentPage={setCurrentPage} setSelectedFranchiseId={setSelectedFranchiseId} />;
      case 'calculator':
        return <FinancialCalculator />;
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      <DemoBanner />
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
