import React from 'react';
import { X, ShieldCheck, FileCheck2, Scale, ArrowRight, ExternalLink } from 'lucide-react';
import { Logo } from './Logo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentPage: (page: string) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, setCurrentPage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <Logo size="lg" showTagline />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2">
            Independent Franchise Investment Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            FranchiseIQ is an independent, algorithmic decision-support platform designed for prospective franchise investors. We evaluate unit economics, stress-test franchisor claims against audited ground-truth performance, and provide transparent risk benchmarking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1.5" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">4-Tier Verification</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Every data point is classified from Verified Audits to Marketing Claims.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <FileCheck2 className="w-5 h-5 text-blue-500 mb-1.5" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Claim Gap Audits</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Forensic variance detection between pitch decks and active store P&Ls.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <Scale className="w-5 h-5 text-indigo-500 mb-1.5" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Brokerage</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              We never take brand listing commissions or broker cuts.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            Platform v2.4 • Production Ready
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setCurrentPage('explore');
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore Franchises</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
