import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InvestorProvider } from './context/InvestorContext';
import { ThemeProvider } from './context/ThemeContext';
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

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(1);

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-150">
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
    <ThemeProvider>
      <AuthProvider>
        <InvestorProvider>
          <AppContent />
        </InvestorProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
