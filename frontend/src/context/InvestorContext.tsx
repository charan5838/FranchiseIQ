import React, { createContext, useContext, useState } from 'react';
import { UserPreferences } from '../types';

interface InvestorContextType {
  preferences: UserPreferences;
  updatePreferences: (newPref: Partial<UserPreferences>) => void;
  comparisonList: number[];
  toggleComparison: (franchiseId: number) => void;
  clearComparison: () => void;
}

const defaultPreferences: UserPreferences = {
  budget: 2500000,
  city: 'Hyderabad',
  locality: 'Madhapur',
  preferred_sector_id: null,
  shop_area_sqft: 800,
  business_experience: '0-2 years',
  desired_involvement: 'full-time',
  risk_preference: 'Medium',
  desired_return_pct: 25,
  max_payback_months: 30,
  goal: 'Maximum ROI'
};

const InvestorContext = createContext<InvestorContextType | undefined>(undefined);

export const InvestorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('franchiseiq_prefs');
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  const [comparisonList, setComparisonList] = useState<number[]>([1, 2, 3]); // pre-select top 3 for demo convenience

  const updatePreferences = (newPref: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPref };
      localStorage.setItem('franchiseiq_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleComparison = (id: number) => {
    setComparisonList(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 5) {
        alert('You can compare a maximum of 5 franchises side-by-side.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  return (
    <InvestorContext.Provider value={{ preferences, updatePreferences, comparisonList, toggleComparison, clearComparison }}>
      {children}
    </InvestorContext.Provider>
  );
};

export const useInvestor = () => {
  const ctx = useContext(InvestorContext);
  if (!ctx) throw new Error('useInvestor must be used within InvestorProvider');
  return ctx;
};
