import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldAlert,
  User,
  MapPin,
  FileSearch,
  Landmark,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Entity } from '../../types';
import { investigationService } from '../../services';
import {
  PersonClassificationBadge,
  EntityRoleBadge,
} from '../common/SeverityBadge';

interface PeopleAnalyticsSectionProps {
  onSelectPerson: (person: Entity) => void;
  onSelectCase: (caseId: string) => void;
  onInspectInGraph: (entityId: string) => void;
}

export const PeopleAnalyticsSection: React.FC<PeopleAnalyticsSectionProps> = ({
  onSelectPerson,
  onSelectCase,
  onInspectInGraph,
}) => {
  const [subView, setSubView] = useState<'VICTIMS' | 'ACCUSED'>('ACCUSED');

  const victimsList = investigationService.getVictimsList();
  const accusedList = investigationService.getAccusedList();

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Sub-view Switcher Banner */}
      <div className="glass-card rounded-xl p-5 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            People Analytics &amp; Threat Profiles
          </h2>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Distinct forensic analytical models for victim safeguard oversight versus accused syndicate threat tracking.
          </p>
        </div>

        {/* Dedicated Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-forge-bg border border-white/[0.08] text-xs font-mono">
          <button
            onClick={() => setSubView('ACCUSED')}
            className={`px-4 py-1.5 rounded-lg flex items-center space-x-2 transition font-bold ${
              subView === 'ACCUSED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>ACCUSED &amp; SUSPECTS ({accusedList.length})</span>
          </button>

          <button
            onClick={() => setSubView('VICTIMS')}
            className={`px-4 py-1.5 rounded-lg flex items-center space-x-2 transition font-bold ${
              subView === 'VICTIMS'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-teal-400" />
            <span>VICTIMS &amp; COMPLAINANTS ({victimsList.length})</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SUB-VIEW 1: ACCUSED & SUSPECTS THREAT MATRIX                          */}
      {/* ===================================================================== */}
      {subView === 'ACCUSED' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accusedList.map((item) => (
            <div
              key={item.person.id}
              onClick={() => onSelectPerson(item.person)}
              className="glass-card p-5 rounded-xl border border-rose-500/25 hover:border-rose-400/50 hover:bg-white/[0.02] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-sm"
            >
              {/* Top Row: Name, Alias, Risk Score */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-white group-hover:text-rose-200 transition">
                        {item.person.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-forge-text-muted border border-white/[0.06]">
                        {item.person.id}
                      </span>
                    </div>
                    {item.alias && (
                      <span className="text-[11px] font-mono text-forge-text-muted">
                        Known Alias: &quot;{item.alias}&quot;
                      </span>
                    )}
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        item.riskLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      THREAT {item.riskScore} / 100
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <EntityRoleBadge role={item.person.role} size="xs" />
                  <div className="flex flex-wrap gap-1">
                    {item.cases.map((c) => (
                      <button
                        key={c.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c.id);
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] hover:bg-rose-500/20 text-rose-300 border border-white/[0.06] hover:border-rose-500/30 transition"
                        title="Switch to this operation"
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Known Associates */}
              {item.knownAssociates.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                  <div className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider flex items-center space-x-1">
                    <User className="w-3 h-3 text-forge-cyan" />
                    <span>KNOWN ASSOCIATES:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.knownAssociates.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] text-forge-text-secondary border border-white/[0.06]"
                      >
                        <strong className="text-white">{a.name}</strong> ({a.role.split(' ')[0]})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Links & Locations */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/[0.05]">
                <div className="p-2 rounded-lg bg-forge-bg/60 border border-white/[0.04] space-y-0.5">
                  <div className="text-[10px] text-forge-text-muted flex items-center space-x-1">
                    <Landmark className="w-2.5 h-2.5 text-forge-amber" />
                    <span>FINANCIAL FLOW:</span>
                  </div>
                  <div className="font-bold text-forge-amber truncate text-[11px]">
                    {item.financialLinks[0]?.amount || '₹14.80 Lakh'}
                  </div>
                  <div className="text-[9px] text-forge-text-muted truncate">
                    {item.financialLinks[0]?.entityName || 'SBI Hawala Transit'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-forge-bg/60 border border-white/[0.04] space-y-0.5">
                  <div className="text-[10px] text-forge-text-muted flex items-center space-x-1">
                    <MapPin className="w-2.5 h-2.5 text-rose-400" />
                    <span>LAST KNOWN HUB:</span>
                  </div>
                  <div className="font-bold text-white truncate text-[11px]">
                    {item.locations[0] || 'South Mumbai Transit'}
                  </div>
                  <div className="text-[9px] text-forge-text-muted truncate">
                    Active Flight Watchlist
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectInGraph(item.person.id);
                  }}
                  className="text-forge-cyan hover:text-white transition flex items-center space-x-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Inspect in Graph</span>
                </button>

                <span className="text-forge-text-muted group-hover:text-white transition flex items-center space-x-1">
                  <span>Target Threat Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 2: VICTIMS & COMPLAINANTS SAFEGUARD PROFILE                  */}
      {/* ===================================================================== */}
      {subView === 'VICTIMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {victimsList.map((item) => (
            <div
              key={item.person.id}
              onClick={() => onSelectPerson(item.person)}
              className="glass-card p-5 rounded-xl border border-teal-500/25 hover:border-teal-400/50 hover:bg-white/[0.02] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-sm"
            >
              {/* Top Row: Name, Protection Status */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white group-hover:text-teal-200 transition">
                      {item.person.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-forge-text-muted border border-white/[0.06]">
                      {item.person.id}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>{item.protectionStatus}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <PersonClassificationBadge classification="VICTIM" size="xs" />
                  <span className="text-forge-text-muted">FIR:</span>
                  <span className="text-white font-bold">{item.firNumber}</span>
                  <span className="text-forge-text-muted">&middot;</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCase(item.caseItem.id);
                    }}
                    className="text-forge-cyan hover:underline hover:text-white transition"
                    title="Switch to this operation"
                  >
                    {item.caseItem.code}
                  </button>
                </div>
              </div>

              {/* Case Statement & History */}
              <div className="p-3 rounded-lg bg-forge-bg/60 border border-white/[0.04] space-y-1">
                <div className="text-[10px] font-mono text-forge-text-muted uppercase">
                  RECORDED STATEMENT &amp; CASE HISTORY:
                </div>
                <p className="text-xs text-forge-text-secondary leading-relaxed font-sans">
                  {item.caseHistory}
                </p>
              </div>

              {/* Location & Evidence */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/[0.05]">
                <div className="flex items-center space-x-1.5 text-forge-text-muted">
                  <MapPin className="w-3.5 h-3.5 text-forge-amber shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>

                <div className="flex items-center space-x-1.5 text-forge-text-muted">
                  <FileSearch className="w-3.5 h-3.5 text-forge-cyan shrink-0" />
                  <span>{item.relatedEvidence.length} Exhibits on File</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-teal-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>CrPC 228A Identity Redaction Active</span>
                </span>

                <span className="text-forge-text-muted group-hover:text-white transition flex items-center space-x-1">
                  <span>View Protection Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
