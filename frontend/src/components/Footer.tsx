import React from 'react';
import { ShieldCheck, FileCheck2, Scale } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC<{ setCurrentPage?: (page: string) => void }> = ({ setCurrentPage }) => {
  return (
    <footer className="bg-[#070b14] border-t border-slate-800/80 mt-16 text-xs text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div 
              onClick={() => setCurrentPage?.('dashboard')}
              className="cursor-pointer inline-block"
            >
              <Logo size="md" showTagline />
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              Franchise Investment Intelligence — independent financial decision-support and unit-economics validation platform.
              We do not broker franchises, sell brand leads, or take transaction cuts. Our algorithms prioritize investor capital preservation and transparent margin realities.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] pt-1">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 4-Tier Verification</span>
              <span className="flex items-center gap-1.5"><FileCheck2 className="w-3.5 h-3.5 text-blue-500" /> Forensic Claim Audits</span>
              <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-indigo-500" /> Objective Scoring</span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Analytics & Tools</h5>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => setCurrentPage?.('advisor')} className="hover:text-emerald-400 transition-colors cursor-pointer">Investor Advisor</button></li>
              <li><button onClick={() => setCurrentPage?.('explore')} className="hover:text-emerald-400 transition-colors cursor-pointer">Franchise Directory</button></li>
              <li><button onClick={() => setCurrentPage?.('calculator')} className="hover:text-emerald-400 transition-colors cursor-pointer">Unit Financial Calculator</button></li>
              <li><button onClick={() => setCurrentPage?.('simulator')} className="hover:text-emerald-400 transition-colors cursor-pointer">Scenario Stress-Test</button></li>
              <li><button onClick={() => setCurrentPage?.('location')} className="hover:text-emerald-400 transition-colors cursor-pointer">Location Intelligence</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Data Governance</h5>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-emerald-400 font-medium">🟢 Verified Audits</span></li>
              <li><span className="text-sky-400 font-medium">🔵 Reported Submissions</span></li>
              <li><span className="text-amber-400 font-medium">🟡 Platform Estimates</span></li>
              <li><span className="text-rose-400 font-medium">🔴 Marketing Claims</span></li>
              <li><button onClick={() => setCurrentPage?.('watchlist')} className="hover:text-emerald-400 transition-colors cursor-pointer">My Watchlist</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 FranchiseIQ. All rights reserved. Built with precision for franchise investors.</p>
          <p className="max-w-xl text-center md:text-right text-slate-400">
            <strong>Legal Notice:</strong> Estimated monthly profit based on available data. Actual results may vary based on location, execution, expenses and market conditions. Never treat projections as guaranteed return commitments.
          </p>
        </div>
      </div>
    </footer>
  );
};
