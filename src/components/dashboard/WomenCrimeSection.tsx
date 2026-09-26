import React, { useState } from 'react';
import {
  HeartHandshake,
  Shield,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
  PhoneCall,
} from 'lucide-react';
import { Case } from '../../types';
import { SeverityBadge, CaseStatusBadge } from '../common/SeverityBadge';

interface WomenCrimeSectionProps {
  cases: Case[];
  onSelectCase: (caseId: string) => void;
}

export const WomenCrimeSection: React.FC<WomenCrimeSectionProps> = ({
  cases,
  onSelectCase,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'CASES' | 'TIMELINE' | 'PROTECTION'>('CASES');

  // Filter cases involving crimes against women
  const womenCases = React.useMemo(() => {
    return cases.filter(
      (c) =>
        c.caseFlags?.includes('WOMEN_RELATED') ||
        c.category?.toLowerCase().includes('women') ||
        c.name.toLowerCase().includes('harassment')
    );
  }, [cases]);

  // Sensitive protection activity timeline
  const protectionEvents = [
    {
      id: 'PE-01',
      caseCode: 'IF-2026-0741',
      title: 'Complainant Kavita Nair 24/7 Protection Protocol Activated',
      unit: 'Special Crime Unit for Women & Children (SPS-NCR)',
      time: '12m ago',
      type: 'WITNESS_SECURITY',
      location: 'Rohini, Delhi',
      verified: true,
      description: 'Physical security post deployed at victim residence following intercept of threatening voice notes.',
    },
    {
      id: 'PE-02',
      caseCode: 'IF-2026-0923',
      title: 'Emergency Webhook Freeze: 3 Harassment Broadcast Channels',
      unit: 'Cyber Crime Investigation Centre, Bengaluru',
      time: '2h ago',
      type: 'DIGITAL_TAKEDOWN',
      location: 'Electronic City, Bengaluru',
      verified: true,
      description: 'Immediate takedown order served to Telegram and cloud storage platforms removing synthetic morphed imagery.',
    },
    {
      id: 'PE-03',
      caseCode: 'IF-2026-0741',
      title: 'VoIP Gateway Carrier Block Enacted',
      unit: 'DoT / Telecom Lawful Intercept Node',
      time: '5h ago',
      type: 'TELECOM_BLOCK',
      location: 'North Delhi Corridor',
      verified: true,
      description: 'Virtual numbers used to initiate extortion calls permanently blacklisted across national telecom grids.',
    },
    {
      id: 'PE-04',
      caseCode: 'IF-2026-0923',
      title: 'Victim Support & Legal Counseling Assigned',
      unit: 'Special Anti-Harassment Taskforce',
      time: '1d ago',
      type: 'SUPPORT_SERVICE',
      location: 'Bengaluru, Karnataka',
      verified: true,
      description: 'Medical and forensic counseling support initiated for 4 female complainants targeted by fake court notice scam.',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-rose-950/20 via-forge-card to-forge-card border border-rose-500/30 rounded-xl p-5 space-y-4 shadow-xl select-none">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight font-sans">
                Women-Related Crime Investigations &amp; Protection
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase">
                Dedicated Oversight ({womenCases.length} Active Cases)
              </span>
            </div>
            <p className="text-xs text-forge-text-muted mt-0.5 font-sans">
              Priority oversight for digital harassment, extortion syndicates, protected witness security, and rapid victim assistance.
            </p>
          </div>
        </div>

        {/* Sub-view switcher */}
        <div className="flex items-center space-x-1 font-mono text-xs bg-forge-panel p-1 rounded-lg border border-forge-border">
          <button
            onClick={() => setSelectedSubTab('CASES')}
            className={`px-3 py-1 rounded transition text-xs ${
              selectedSubTab === 'CASES'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            Active Operations
          </button>
          <button
            onClick={() => setSelectedSubTab('TIMELINE')}
            className={`px-3 py-1 rounded transition text-xs ${
              selectedSubTab === 'TIMELINE'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            Protection Feed
          </button>
          <button
            onClick={() => setSelectedSubTab('PROTECTION')}
            className={`px-3 py-1 rounded transition text-xs ${
              selectedSubTab === 'PROTECTION'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-forge-text-secondary hover:text-white'
            }`}
          >
            Safety Protocols
          </button>
        </div>
      </div>

      {/* Subtab 1: Active Cases Grid */}
      {selectedSubTab === 'CASES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {womenCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="p-4 rounded-xl bg-forge-bg/90 border border-rose-500/30 hover:border-rose-400/60 transition space-y-3.5 flex flex-col justify-between group shadow-sm"
            >
              {/* Top Row: Case Code, Location, Status */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-white bg-forge-card px-2 py-0.5 rounded border border-forge-border">
                      {caseItem.code}
                    </span>
                    <CaseStatusBadge status={caseItem.status} size="xs" />
                    <SeverityBadge level={caseItem.priority} size="xs" />
                  </div>

                  <span className="text-[11px] font-mono text-rose-300/80 flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{caseItem.location}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-rose-200 transition font-sans pt-1">
                  {caseItem.name}
                </h3>
                <p className="text-xs text-forge-text-secondary line-clamp-2 leading-relaxed font-sans">
                  {caseItem.description}
                </p>
              </div>

              {/* Important People in Case */}
              {caseItem.importantPeople && caseItem.importantPeople.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-forge-border/40">
                  <div className="text-[10px] font-mono text-forge-text-muted uppercase">
                    Key Persons &amp; Complainants:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {caseItem.importantPeople.map((person) => (
                      <span
                        key={person.id}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center space-x-1 ${
                          person.classification === 'VICTIM'
                            ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}
                      >
                        <span className="font-bold">{person.name}</span>
                        <span className="opacity-75">({person.role.split(' ')[0]})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Metrics and Action Link */}
              <div className="pt-2 border-t border-forge-border/40 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-3 text-forge-text-muted text-[11px]">
                  <span>Lead: <strong className="text-white font-medium">{caseItem.leadInvestigator}</strong></span>
                  <span>&middot;</span>
                  <span>{caseItem.evidenceCount} Exhibits</span>
                </div>

                <button
                  onClick={() => onSelectCase(caseItem.id)}
                  className="px-3 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold flex items-center space-x-1 transition"
                >
                  <span>Case Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 2: Protection Activity Feed */}
      {selectedSubTab === 'TIMELINE' && (
        <div className="space-y-2.5">
          {protectionEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3 bg-forge-bg rounded-lg border border-forge-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-800/40">
                    {evt.caseCode}
                  </span>
                  <span className="font-bold text-white text-xs">{evt.title}</span>
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-950/40 px-1.5 py-0.2 rounded border border-teal-800/40 flex items-center space-x-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>VERIFIED PROTOCOL</span>
                  </span>
                </div>
                <p className="text-[11px] text-forge-text-secondary leading-relaxed">
                  {evt.description}
                </p>
                <div className="text-[10px] font-mono text-forge-text-muted flex items-center space-x-2">
                  <span>Unit: {evt.unit}</span>
                  <span>&middot;</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-forge-cyan" />
                    <span>{evt.location}</span>
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-forge-text-muted">{evt.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 3: Safety Protocols & Victim Standards */}
      {selectedSubTab === 'PROTECTION' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 bg-forge-bg rounded-lg border border-forge-border space-y-1.5">
            <div className="flex items-center space-x-1.5 text-rose-300 font-bold text-[11px]">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>WITNESS PROTECTION INITIATIVE</span>
            </div>
            <p className="text-[11px] text-forge-text-secondary font-sans leading-relaxed">
              Automated surveillance alerts triggered if suspect devices or ANPR cameras detect syndicate vehicles within 500m of complainant coordinates.
            </p>
            <div className="text-[10px] text-teal-400 font-bold pt-1">
              STATUS: ARMED &amp; MONITORED
            </div>
          </div>

          <div className="p-3.5 bg-forge-bg rounded-lg border border-forge-border space-y-1.5">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold text-[11px]">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>RAPID TELECOM INTERCEPT</span>
            </div>
            <p className="text-[11px] text-forge-text-secondary font-sans leading-relaxed">
              Immediate lawful priority intercept on burner and VoIP phone numbers threatening protected witnesses, coupled with SIM gateway takedowns.
            </p>
            <div className="text-[10px] text-cyan-400 font-bold pt-1">
              RESPONSE TIME: &lt; 15 MINUTES
            </div>
          </div>

          <div className="p-3.5 bg-forge-bg rounded-lg border border-forge-border space-y-1.5">
            <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-[11px]">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>IDENTITY REDACTION IN EVIDENCE</span>
            </div>
            <p className="text-[11px] text-forge-text-secondary font-sans leading-relaxed">
              Automatic digital masking of female complainant personal identifying details in all court dossiers under Section 228A IPC protocols.
            </p>
            <div className="text-[10px] text-amber-400 font-bold pt-1">
              CRYPTOGRAPHIC REDACTION ON
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
