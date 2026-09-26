import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  FileSearch,
} from 'lucide-react';
import { Case } from '../../types';
import { SeverityBadge, CaseStatusBadge } from '../common/SeverityBadge';

interface CriticalCasesSegmentProps {
  cases: Case[];
  onSelectCase: (caseId: string) => void;
}

export const CriticalCasesSegment: React.FC<CriticalCasesSegmentProps> = ({
  cases,
  onSelectCase,
}) => {
  // Filter exclusively for Critical Priority cases
  const criticalCases = React.useMemo(() => {
    return cases.filter(
      (c) => c.priority === 'CRITICAL' || c.caseFlags?.includes('CRITICAL')
    );
  }, [cases]);

  return (
    <div className="bg-forge-card border-2 border-rose-500/40 rounded-xl p-5 space-y-4 shadow-xl select-none relative overflow-hidden">
      {/* Background Subtle Watermark Tint */}
      <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-rose-500">
        <ShieldAlert className="w-56 h-56" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight font-sans">
                Critical &amp; Hot Cases
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase">
                Immediate Action Required ({criticalCases.length})
              </span>
            </div>
            <p className="text-xs text-forge-text-muted mt-0.5 font-sans">
              High-urgency criminal operations flagged for active syndicate threats, flight risks, or multi-state coordination.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 shrink-0">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span className="font-bold tracking-wider">HOT MONITORING ACTIVE</span>
        </div>
      </div>

      {/* Grid of Critical Case Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {criticalCases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="p-4 rounded-xl bg-forge-bg/95 border border-rose-500/40 hover:border-rose-400 transition space-y-3.5 flex flex-col justify-between group shadow-sm"
          >
            {/* Top row: Case Code, Location, Status, Priority */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-white bg-forge-card px-2 py-0.5 rounded border border-forge-border">
                    {caseItem.code}
                  </span>
                  <CaseStatusBadge status={caseItem.status} size="xs" />
                  <SeverityBadge level={caseItem.priority} size="xs" />
                </div>

                <div className="flex items-center space-x-1 text-[11px] font-mono text-forge-text-muted">
                  <Clock className="w-3 h-3 text-forge-rose" />
                  <span>Update: <strong className="text-white font-medium">{caseItem.lastActivity || 'Recent'}</strong></span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition font-sans pt-1">
                {caseItem.name}
              </h3>
              <p className="text-xs text-forge-text-secondary line-clamp-2 leading-relaxed font-sans">
                {caseItem.description}
              </p>
            </div>

            {/* Middle Metadata: Location & Assigned Team */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-forge-text-muted border-t border-forge-border/40">
              <div className="flex items-center space-x-1 truncate">
                <MapPin className="w-3 h-3 text-forge-cyan shrink-0" />
                <span className="truncate">{caseItem.location}</span>
              </div>
              <div className="flex items-center space-x-1 truncate text-right justify-end">
                <Users className="w-3 h-3 text-forge-amber shrink-0" />
                <span className="truncate">{caseItem.assignedTeam || caseItem.assignedUnit.split(',')[0]}</span>
              </div>
            </div>

            {/* Important People Chips */}
            {caseItem.importantPeople && caseItem.importantPeople.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-forge-border/40">
                <div className="text-[10px] font-mono text-forge-text-muted uppercase">
                  Key Targets &amp; Persons:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {caseItem.importantPeople.map((person) => (
                    <span
                      key={person.id}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center space-x-1 ${
                        person.classification === 'VICTIM'
                          ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                          : person.classification === 'ACCUSED'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-forge-card text-forge-text-secondary border-forge-border'
                      }`}
                    >
                      <span className="font-bold">{person.name}</span>
                      <span className="opacity-75">({person.classification})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Row: Evidence Count & Action Button */}
            <div className="pt-2 border-t border-forge-border/40 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-3 text-forge-text-muted text-[11px]">
                <span className="flex items-center space-x-1">
                  <FileSearch className="w-3 h-3 text-forge-cyan" />
                  <span><strong>{caseItem.evidenceCount}</strong> Evidence Exhibits</span>
                </span>
                <span>&middot;</span>
                <span>Lead: <strong className="text-white font-medium">{caseItem.leadInvestigator}</strong></span>
              </div>

              <button
                onClick={() => onSelectCase(caseItem.id)}
                className="px-3.5 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-200 font-bold flex items-center space-x-1.5 transition"
              >
                <span>Open Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
