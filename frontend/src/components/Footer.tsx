import React from 'react';
import { Building2, ShieldCheck, FileCheck2, Scale } from 'lucide-react';

export const Footer: React.FC<{ setCurrentPage?: (page: string) => void }> = ({ setCurrentPage }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-slate-950 font-bold" />
              </div>
              <span className="text-lg font-bold text-white">Franchise<span className="text-emerald-400">IQ</span></span>
            </div>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed mb-4">
              Franchise Investment Intelligence — independent financial decision-support and unit-economics validation platform.
              We do not broker franchises, sell brand leads, or take transaction cuts. Our algorithms prioritize investor capital preservation and transparent margin realities.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 4-Tier Verification</span>
              <span className="flex items-center gap-1.5"><FileCheck2 className="w-3.5 h-3.5 text-blue-400" /> Forensic Claim Gap Audits</span>
              <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-indigo-400" /> Objective Scoring</span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Analytics Tools</h5>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentPage?.('advisor')} className="hover:text-emerald-400 transition-colors">Investor Advisor</button></li>
              <li><button onClick={() => setCurrentPage?.('explore')} className="hover:text-emerald-400 transition-colors">Franchise Directory</button></li>
              <li><button onClick={() => setCurrentPage?.('calculator')} className="hover:text-emerald-400 transition-colors">Unit Financial Calculator</button></li>
              <li><button onClick={() => setCurrentPage?.('simulator')} className="hover:text-emerald-400 transition-colors">Scenario Stress-Test</button></li>
              <li><button onClick={() => setCurrentPage?.('location')} className="hover:text-emerald-400 transition-colors">Location Intelligence</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Data Governance</h5>
            <ul className="space-y-2">
              <li><span className="text-emerald-400">🟢 Verified Audits</span></li>
              <li><span className="text-blue-400">🔵 Reported Submissions</span></li>
              <li><span className="text-amber-400">🟡 Platform Estimates</span></li>
              <li><span className="text-rose-400">🔴 Marketing Claims</span></li>
              <li><button onClick={() => setCurrentPage?.('watchlist')} className="hover:text-emerald-400 transition-colors">My Watchlist</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 FranchiseIQ. All rights reserved. Built with precision for franchise investors.</p>
          <p className="max-w-xl text-center md:text-right text-slate-400">
            <strong>Legal Notice:</strong> Estimated monthly profit based on available data. Actual results may vary based on location, execution, expenses and market conditions. Never treat projections as guaranteed return commitments.
          </p>
        </div>
      </div>
    </footer>
  );
};
