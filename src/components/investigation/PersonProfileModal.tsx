import React from 'react';
import {
  X,
  User,
  MapPin,
  Clock,
  ArrowRight,
  Activity,
  FolderOpen,
} from 'lucide-react';
import { Entity, Case } from '../../types';
import { investigationService } from '../../services';
import {
  PersonClassificationBadge,
  EntityRoleBadge,
  SeverityBadge,
  CaseStatusBadge,
} from '../common/SeverityBadge';

interface PersonProfileModalProps {
  person: Entity | null;
  cases?: Case[];
  onClose: () => void;
  onSelectCase: (caseId: string) => void;
  onInspectInGraph?: (entityId: string) => void;
}

export const PersonProfileModal: React.FC<PersonProfileModalProps> = ({
  person,
  cases,
  onClose,
  onSelectCase,
  onInspectInGraph,
}) => {
  if (!person) return null;

  const isVictim = person.personClassification === 'VICTIM';
  const isAccused = person.personClassification === 'ACCUSED' || person.personClassification === 'SUSPECT';

  const allCasesList = investigationService.getCases();
  const resolvedCases =
    cases && cases.length > 0
      ? cases
      : allCasesList.filter((c: Case) => c.entityIds.includes(person.id));
  const displayCases =
    resolvedCases.length > 0 ? resolvedCases : [allCasesList[0]];

  // Fictional activity timeline for this person
  const personTimeline = [
    {
      time: '2026-09-08 14:20 IST',
      action: 'Cellular triangulation match near Bandra Coastal Safehouse',
      category: 'Geofence Breach',
    },
    {
      time: '2026-09-05 11:15 IST',
      action: 'Hawala proxy account transfer of ₹8.20 Lakh flagged by NPCI audit',
      category: 'Financial Trail',
    },
    {
      time: '2026-09-02 09:30 IST',
      action: 'Encrypted communication intercept flagged in Operation Falcon',
      category: 'Signal Intel',
    },
    {
      time: '2026-08-28 10:00 IST',
      action: 'Initial docket registration under inter-state surveillance taskforce',
      category: 'Case Milestone',
    },
  ];

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden border border-white/[0.12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border text-lg font-bold font-mono ${
                isVictim
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : isAccused
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
              }`}
            >
              <User className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {person.name}
                </h2>
                <span className="font-mono text-xs text-forge-text-muted bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  {person.id}
                </span>
                <PersonClassificationBadge classification={person.personClassification} size="xs" />
                <EntityRoleBadge role={person.role} size="xs" />
              </div>
              <p className="text-xs text-forge-text-muted mt-0.5 font-mono">
                {person.metadata?.alias
                  ? `Alias: "${person.metadata.alias}" · `
                  : ''}
                Cross-Case Intelligence Profile · National Threat Registry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-forge-text-muted hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Row 1: Key Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-forge-text-muted">THREAT INDEX</div>
              <div className="text-lg font-bold mt-1 flex items-center space-x-1.5">
                <span
                  className={
                    person.riskScore >= 85
                      ? 'text-rose-400'
                      : person.riskScore >= 60
                      ? 'text-amber-400'
                      : 'text-teal-400'
                  }
                >
                  {person.riskScore}
                </span>
                <span className="text-[10px] text-forge-text-muted">/ 100</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-forge-text-muted">CASES INVOLVED</div>
              <div className="text-lg font-bold text-forge-cyan mt-1">
                {displayCases.length} Operations
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-forge-text-muted">FINANCIAL VOLUME</div>
              <div className="text-lg font-bold text-forge-amber mt-1">
                {String(person.metadata?.estimatedVolume || '₹4.20 Crore')}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-forge-text-muted">EVIDENCE EXH.</div>
              <div className="text-lg font-bold text-white mt-1">
                4 Exhibits
              </div>
            </div>
          </div>

          {/* Row 2: Cases Involved In */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold tracking-wider text-forge-cyan uppercase flex items-center space-x-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>CASES & OPERATIONS INVOLVED IN ({displayCases.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayCases.map((c: Case) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-forge-cyan/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {c.code}
                      </span>
                      <CaseStatusBadge status={c.status} size="xs" />
                      <SeverityBadge level={c.priority} size="xs" />
                    </div>
                    <div className="text-xs font-semibold text-white group-hover:text-forge-cyan transition truncate">
                      {c.name}
                    </div>
                    <div className="text-[10px] font-mono text-forge-text-muted flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-forge-amber" />
                      <span>{c.location}</span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-forge-text-muted group-hover:text-white group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Known Connections & Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Known Connections */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-forge-text-muted border-b border-white/[0.06] pb-2">
                <span className="font-bold text-white uppercase">KNOWN ASSOCIATES & CONNECTIONS</span>
                <Activity className="w-3.5 h-3.5 text-forge-cyan" />
              </div>

              <div className="space-y-2 text-xs">
                {(Array.isArray(person.metadata?.associatedTargets)
                  ? ((person.metadata?.associatedTargets as unknown) as Array<{ name: string; role: string; relation: string }>)
                  : [
                      { name: 'Sameer Merchant', role: 'Mule Aggregator', relation: 'Fund Conduit' },
                      { name: 'Elena Rostova', role: 'Crypto Laundering Lead', relation: 'Cold Wallet Escrow' },
                      { name: 'ACP Sunita Deshmukh', role: 'Supervising Officer', relation: 'Investigative Inquiry' },
                    ]
                ).map((assoc, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-forge-bg/60 border border-white/[0.04] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white">{assoc.name}</div>
                      <div className="text-[10px] text-forge-text-muted">{assoc.role}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-forge-cyan border border-white/[0.06]">
                      {assoc.relation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Locations & Safehouses */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-forge-text-muted border-b border-white/[0.06] pb-2">
                <span className="font-bold text-white uppercase">MONITORED LOCATIONS & SAFEHOUSES</span>
                <MapPin className="w-3.5 h-3.5 text-forge-amber" />
              </div>

              <div className="space-y-2 text-xs">
                {(Array.isArray(person.metadata?.frequentLocations)
                  ? (person.metadata.frequentLocations as string[])
                  : [
                      'South Mumbai Terminal Safehouse (Colaba)',
                      'East Delhi NCR Transit Corridor (Rohini)',
                      'Bandra Seaface Berth & Safehouse',
                    ]
                ).map((loc, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-forge-bg/60 border border-white/[0.04] flex items-center space-x-2 text-xs font-mono"
                  >
                    <MapPin className="w-3.5 h-3.5 text-forge-amber shrink-0" />
                    <span className="text-forge-text-secondary truncate">{loc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Chronological Activity Progression */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-forge-text-muted border-b border-white/[0.06] pb-2">
              <span className="font-bold text-white uppercase flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-forge-cyan" />
                <span>CHRONOLOGICAL ACTIVITY PROGRESSION</span>
              </span>
              <span className="text-[10px]">RECORDED TELEMETRY</span>
            </div>

            <div className="space-y-2">
              {personTimeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-forge-bg/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">{item.action}</span>
                    <div className="text-[10px] font-mono text-forge-text-muted">{item.category}</div>
                  </div>
                  <span className="font-mono text-[10px] text-forge-cyan shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="text-xs font-mono text-forge-text-muted">
            Status: <span className="text-forge-emerald font-semibold">Active Surveillance File</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (onInspectInGraph) onInspectInGraph(person.id);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-forge-cyan hover:bg-forge-cyanLight text-slate-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            >
              <span>Inspect in Network Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
