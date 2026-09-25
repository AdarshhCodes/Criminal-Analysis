import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Users,
  FileSearch,
  AlertTriangle,
  HeartHandshake,
} from 'lucide-react';
import { Case } from '../../types';
import { SeverityBadge, CaseStatusBadge, CaseFlagBadge } from '../common/SeverityBadge';

interface CriticalCasesSegmentProps {
  cases: Case[];
  onSelectCase: (caseId: string) => void;
}

export const CriticalCasesSegment: React.FC<CriticalCasesSegmentProps> = ({
  cases,
  onSelectCase,
}) => {
  // Filter for cases that are women-related or critical priority
  const criticalCases = React.useMemo(() => {
    return cases.filter(
      (c) =>
        c.priority === 'CRITICAL' ||
        (c.caseFlags && (c.caseFlags.includes('WOMEN_RELATED') || c.caseFlags.includes('CRITICAL')))
    );
  }, [cases]);

  return (
    <div className="bg-gradient-to-r from-rose-950/30 via-forge-card to-forge-card border-2 border-rose-500/40 rounded-xl p-5 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background Subtle Watermark Tint */}
      <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-rose-500">
        <ShieldAlert className="w-56 h-56" />
      </div>

      {/* Header with Plain, Non-Technical Labels */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/30 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Critical Cases &amp; Women-Related Investigations
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase">
                High Priority Oversight ({criticalCases.length})
              </span>
            </div>
            <p className="text-xs text-forge-text-muted mt-0.5">
              Dedicated monitoring for high-urgency criminal operations, cyber harassment, and protected witness safety.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 shrink-0">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span className="font-bold tracking-wider">LIVE SURVEILLANCE ACTIVE</span>
        </div>
      </div>

      {/* Grid of Critical Case Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {criticalCases.map((caseItem) => {
          const isWomenRelated = caseItem.caseFlags?.includes('WOMEN_RELATED');

          return (
            <div
              key={caseItem.id}
              className={`p-4 rounded-lg border transition space-y-3 relative group ${
                isWomenRelated
                  ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-950/30'
                  : 'bg-forge-bg/90 border-forge-border hover:border-rose-500/40 hover:bg-forge-card/90'
              }`}
            >
              {/* Badges and Case Code */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-white bg-forge-card px-2 py-0.5 rounded border border-forge-border">
                    {caseItem.code}
                  </span>
                  <CaseStatusBadge status={caseItem.status} />
                  <SeverityBadge level={caseItem.priority} />
                  {isWomenRelated && (
                    <CaseFlagBadge flag="WOMEN_RELATED" />
                  )}
                </div>

                <span className="text-[10px] font-mono text-forge-text-muted">
                  {caseItem.assignedUnit.split(',')[0]}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-rose-200 transition">
                  {caseItem.name}
                </h3>
                <p className="text-xs text-forge-text-secondary mt-1 line-clamp-2 leading-relaxed">
                  {caseItem.description}
                </p>
              </div>

              {/* Case Stats Ribbon */}
              <div className="grid grid-cols-3 gap-2 p-2 rounded bg-forge-panel/70 border border-forge-border/60 text-xs font-mono">
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-forge-cyan shrink-0" />
                  <div>
                    <div className="text-[9px] text-forge-text-muted">NODES</div>
                    <div className="font-bold text-white">{caseItem.metrics.totalEntities}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <FileSearch className="w-3.5 h-3.5 text-forge-emerald shrink-0" />
                  <div>
                    <div className="text-[9px] text-forge-text-muted">EVIDENCE</div>
                    <div className="font-bold text-white">{caseItem.evidenceCount}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-forge-rose shrink-0" />
                  <div>
                    <div className="text-[9px] text-forge-text-muted">ALERTS</div>
                    <div className="font-bold text-forge-rose">{caseItem.alertCount}</div>
                  </div>
                </div>
              </div>

              {/* Footer with Lead Officer and Direct Jump Link */}
              <div className="flex items-center justify-between pt-2 border-t border-forge-border/40 text-xs">
                <div className="text-[11px] text-forge-text-muted">
                  Lead: <span className="text-white font-medium">{caseItem.leadInvestigator}</span>
                </div>

                {/* Direct Link into Case (switches Case Switcher) */}
                <button
                  onClick={() => onSelectCase(caseItem.id)}
                  className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-rose-400 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 rounded border border-rose-500/40 transition group-hover:border-rose-400 shadow-sm"
                  title={`Open investigation workspace for ${caseItem.name}`}
                >
                  <span>Open Case Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
