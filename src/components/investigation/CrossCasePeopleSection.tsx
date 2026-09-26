import React from 'react';
import {
  ArrowRight,
  FolderOpen,
  Network,
  Share2,
} from 'lucide-react';
import { Entity } from '../../types';
import { investigationService } from '../../services';
import {
  PersonClassificationBadge,
  EntityRoleBadge,
} from '../common/SeverityBadge';

interface CrossCasePeopleSectionProps {
  onSelectPerson: (person: Entity) => void;
  onSelectCase: (caseId: string) => void;
  onInspectInGraph: (entityId: string) => void;
}

export const CrossCasePeopleSection: React.FC<CrossCasePeopleSectionProps> = ({
  onSelectPerson,
  onSelectCase,
  onInspectInGraph,
}) => {
  const crossPeople = investigationService.getCrossCasePeople();

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header Banner */}
      <div className="glass-card rounded-xl p-5 border border-amber-500/25 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Cross-Case People Connections
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                  {crossPeople.length} Multi-Case Targets Detected
                </span>
              </div>
              <p className="text-xs text-forge-text-muted mt-0.5">
                Automated detection of individuals appearing across multiple active investigations, cross-jurisdictional syndicates, and proxy money mule rings.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded bg-white/[0.04] text-forge-text-secondary border border-white/[0.08] self-start sm:self-auto">
            Cross-Jurisdiction Telemetry Active
          </span>
        </div>
      </div>

      {/* Cross-Case People Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {crossPeople.map(({ person, cases, primaryRole, riskScore, evidenceCount, financialTotal, connectionsCount }) => (
          <div
            key={person.id}
            onClick={() => onSelectPerson(person)}
            className="glass-card p-5 rounded-xl border border-white/[0.08] hover:border-amber-400/50 hover:bg-white/[0.02] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-sm"
          >
            {/* Top Row: Name, Badges, Threat Index */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-white group-hover:text-forge-cyan transition">
                    {person.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-forge-text-muted border border-white/[0.06]">
                    {person.id}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <PersonClassificationBadge classification={person.personClassification} size="xs" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                    {cases.length} CASES LINKED
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <EntityRoleBadge role={primaryRole} size="xs" />
                <span className="text-forge-text-muted">&middot;</span>
                <span className="text-forge-text-muted">Threat Index:</span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    riskScore >= 85
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {riskScore} / 100
                </span>
              </div>
            </div>

            {/* Cases Appeared In (Highlighted visually) */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
              <div className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider flex items-center space-x-1">
                <FolderOpen className="w-3 h-3 text-forge-cyan" />
                <span>OPERATIONAL CASES INVOLVED IN:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCase(c.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-forge-bg/80 hover:bg-forge-panel border border-white/[0.08] hover:border-forge-cyan text-xs font-mono text-left transition flex items-center space-x-1.5 group/case"
                  >
                    <span className="font-bold text-white group-hover/case:text-forge-cyan">{c.code}</span>
                    <span className="text-forge-text-muted text-[10px]">({c.name.split(':')[0]})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics & Known Connections */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-forge-bg/60 border border-white/[0.04] text-xs font-mono text-center">
              <div>
                <div className="text-[10px] text-forge-text-muted">FINANCIAL FLOW</div>
                <div className="font-bold text-forge-amber text-[11px] truncate mt-0.5">{financialTotal}</div>
              </div>
              <div>
                <div className="text-[10px] text-forge-text-muted">CONNECTIONS</div>
                <div className="font-bold text-white text-[11px] mt-0.5">{connectionsCount} Nodes</div>
              </div>
              <div>
                <div className="text-[10px] text-forge-text-muted">EVIDENCE</div>
                <div className="font-bold text-forge-cyan text-[11px] mt-0.5">{evidenceCount} Exhibits</div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectInGraph(person.id);
                }}
                className="text-forge-cyan hover:text-white flex items-center space-x-1 transition font-semibold"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Inspect in Graph</span>
              </button>

              <span className="text-forge-text-muted group-hover:text-white transition flex items-center space-x-1">
                <span>View Full Person Dossier</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
