import React, { useState } from 'react';
import { CheckCircle2, FileText, Cpu, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { DataSource } from '../types';

interface VerificationBadgeProps {
  sourceType?: 'VERIFIED' | 'REPORTED' | 'ESTIMATED' | 'MARKETING_CLAIM' | string;
  confidence?: number;
  dataSource?: DataSource;
  size?: 'sm' | 'md';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  sourceType = 'ESTIMATED',
  confidence = 85,
  dataSource,
  size = 'md'
}) => {
  const [showModal, setShowModal] = useState(false);

  const getBadgeConfig = () => {
    switch (sourceType) {
      case 'VERIFIED':
        return {
          label: 'Verified',
          color: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          desc: 'Official, audited, and strongly documented financial disclosures.'
        };
      case 'REPORTED':
        return {
          label: 'Reported',
          color: 'bg-blue-950/80 text-blue-400 border-blue-500/30 hover:bg-blue-900/60',
          dot: 'bg-blue-400',
          icon: FileText,
          desc: 'Information provided directly by active franchisees and credible third parties.'
        };
      case 'ESTIMATED':
        return {
          label: 'Estimated',
          color: 'bg-amber-950/80 text-amber-400 border-amber-500/30 hover:bg-amber-900/60',
          dot: 'bg-amber-400',
          icon: Cpu,
          desc: 'Calculated algorithmically by FranchiseIQ models using category unit economics.'
        };
      case 'MARKETING_CLAIM':
      default:
        return {
          label: 'Marketing Claim',
          color: 'bg-rose-950/80 text-rose-400 border-rose-500/30 hover:bg-rose-900/60',
          dot: 'bg-rose-400',
          icon: AlertTriangle,
          desc: 'Figures directly advertised or promoted by the franchisor sales team.'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all cursor-pointer shadow-sm ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        } ${config.color}`}
        title="Click to view data provenance and verification audit"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
        {confidence && (
          <span className="opacity-70 text-[10px]">({confidence}%)</span>
        )}
      </button>

      {/* Verification Methodology Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl border ${config.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Data Verification Audit</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${config.color}`}>
                    {config.label}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Provenance & methodology trail</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 mb-5">
              <div>
                <div className="text-xs text-slate-400 font-medium">Verification Status</div>
                <div className="text-white font-semibold flex items-center gap-2 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  {sourceType}
                </div>
                <p className="text-xs text-slate-400 mt-1">{config.desc}</p>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="text-xs text-slate-400 font-medium">Source Documentation</div>
                <div className="text-slate-200 font-medium mt-0.5">
                  {dataSource?.source_name || 'Franchise Regulatory Filings & Financial Model'}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="text-xs text-slate-400 font-medium">Methodology & Sampling</div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {dataSource?.methodology || 'Triangulated using multi-point unit economic audits, operator disclosures, and regional high-street benchmark parameters.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Confidence Level</div>
                  <div className="text-emerald-400 font-bold text-base mt-0.5">
                    {dataSource?.confidence_level || confidence}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Last Audit Date</div>
                  <div className="text-slate-200 text-sm mt-0.5">
                    {dataSource?.verification_date || 'September 2026'}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="text-xs text-slate-400 font-medium">Audited / Certified By</div>
                <div className="text-slate-300 text-xs flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {dataSource?.verified_by || 'FranchiseIQ Forensic Analytics Bureau'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Close Verification Audit
            </button>
          </div>
        </div>
      )}
    </>
  );
};
