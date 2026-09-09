import React from 'react';
import { AlertCircle, TrendingDown, CheckCircle } from 'lucide-react';

interface ClaimGapProps {
  claimedRevenue: number;
  actualRevenue: number;
  claimedMargin: number;
  actualMargin: number;
  claimedProfit: number;
  actualProfit: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH';
  advisory?: string;
}

export const ClaimGapIndicator: React.FC<ClaimGapProps> = ({
  claimedRevenue,
  actualRevenue,
  claimedMargin,
  actualMargin,
  claimedProfit,
  actualProfit,
  severity,
  advisory
}) => {
  const revGap = claimedRevenue - actualRevenue;
  const revGapPct = claimedRevenue > 0 ? (revGap / claimedRevenue * 100) : 0;
  const profitGap = claimedProfit - actualProfit;
  const profitGapPct = claimedProfit > 0 ? (profitGap / claimedProfit * 100) : 0;

  const getBorderColor = () => {
    if (severity === 'HIGH') return 'border-rose-500/40 bg-rose-950/20';
    if (severity === 'MODERATE') return 'border-amber-500/40 bg-amber-950/20';
    return 'border-emerald-500/40 bg-emerald-950/20';
  };

  const getBadge = () => {
    if (severity === 'HIGH') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          Suspiciously Large Gap ({profitGapPct.toFixed(0)}%)
        </span>
      );
    }
    if (severity === 'MODERATE') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
          Moderate Marketing Gap ({profitGapPct.toFixed(0)}%)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        High Data Alignment (&lt;10% Gap)
      </span>
    );
  };

  return (
    <div className={`p-5 rounded-2xl border ${getBorderColor()} transition-all shadow-sm`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Performance Discrepancy Analysis
          </div>
          <h4 className="text-base font-bold text-white mt-0.5">
            Franchisor Advertised Claim vs. Verified Field Actual
          </h4>
        </div>
        {getBadge()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-sm mb-4">
        {/* Revenue Gap */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Monthly Gross Revenue</div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-400 text-xs">Claimed:</span>
            <span className="font-semibold text-slate-200">₹{(claimedRevenue/100000).toFixed(1)}L</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-slate-400 text-xs">Verified Actual:</span>
            <span className="font-bold text-emerald-400">₹{(actualRevenue/100000).toFixed(1)}L</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Claim Gap:</span>
            <span className={revGap > 0 ? 'text-amber-400 font-medium' : 'text-emerald-400'}>
              -₹{(revGap/100000).toFixed(1)}L ({revGapPct.toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Margin Gap */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Net Profit Margin</div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-400 text-xs">Claimed:</span>
            <span className="font-semibold text-slate-200">{claimedMargin}%</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-slate-400 text-xs">Verified Actual:</span>
            <span className="font-bold text-emerald-400">{actualMargin}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Margin Gap:</span>
            <span className={claimedMargin - actualMargin > 3 ? 'text-amber-400 font-medium' : 'text-emerald-400'}>
              -{(claimedMargin - actualMargin).toFixed(1)}% pts
            </span>
          </div>
        </div>

        {/* Profit Gap */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Monthly Net Cash Profit</div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-400 text-xs">Claimed:</span>
            <span className="font-semibold text-slate-200">₹{claimedProfit.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-slate-400 text-xs">Verified Actual:</span>
            <span className="font-bold text-emerald-400">₹{actualProfit.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Profit Gap:</span>
            <span className={profitGap > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
              -₹{profitGap.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {advisory && (
        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
          <strong className="text-slate-200 font-semibold">Forensic Advisory:</strong> {advisory}
        </div>
      )}
    </div>
  );
};
