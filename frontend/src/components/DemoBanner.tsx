import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-slate-900 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold text-amber-300">DEMO DATASET ACTIVE:</strong> Financial figures, unit P&Ls, and location metrics are curated demo values. 
          <em className="text-amber-100/80 ml-1">"Estimated monthly profit based on available data. Actual results may vary based on location, execution, expenses and market conditions."</em>
        </span>
      </div>
    </div>
  );
};
