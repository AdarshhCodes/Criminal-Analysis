import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Network,
  FileSearch,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import {
  investigationService,
  alertService,
  evidenceService,
  auditService,
} from '../services';
import { truncateHash } from '../lib/utils';
import { Entity } from '../types';

export const CommandCentrePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentCase,
    selectEntity,
    selectEvidence,
    selectAlert,
    selectRelationship,
    runAiQuery,
    verifyRelationshipAction,
  } = useInvestigationStore();

  const entities = investigationService.getEntities(currentCase.id);
  const relationships = investigationService.getRelationships(currentCase.id);
  const alerts = alertService.getAlerts();
  const evidenceList = evidenceService.getEvidence();
  const recentAuditBlocks = auditService.getBlocks().slice(-5).reverse();

  const highRiskEntities = entities
    .filter((e) => e.riskScore >= 75)
    .sort((a, b) => b.riskScore - a.riskScore);

  const unverifiedRelationships = relationships.filter(
    (r) => r.verificationStatus === 'AI_SUGGESTED'
  );

  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'CRITICAL' || a.severity === 'HIGH'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header & Operational Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-forge-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs">
            <LayoutDashboard className="w-4 h-4" />
            <span>INVESTIGATION COMMAND HEADQUARTERS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            {currentCase.name}
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Special Cell &amp; EOW Joint Taskforce · Lead: {currentCase.leadInvestigator}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/graph')}
            className="flex items-center space-x-2 bg-forge-cyan hover:bg-forge-cyan/80 text-slate-900 font-mono text-xs font-bold px-3.5 py-2 rounded transition shadow-cyan-glow"
          >
            <Network className="w-4 h-4" />
            <span>LAUNCH NETWORK GRAPH</span>
          </button>
          <button
            onClick={() => navigate('/ai')}
            className="flex items-center space-x-1.5 bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-secondary hover:text-white font-mono text-xs px-3 py-2 rounded transition"
          >
            <Sparkles className="w-4 h-4 text-forge-cyan" />
            <span>AI COPILOT</span>
          </button>
        </div>
      </div>

      {/* Non-Dominating Metric Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-text-muted flex items-center justify-between">
            <span>ENTITIES</span>
            <Network className="w-3.5 h-3.5 text-forge-cyan" />
          </div>
          <div className="text-xl font-bold text-white mt-1">{entities.length}</div>
          <div className="text-[9px] text-forge-text-muted">Indexed Nodes</div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-rose flex items-center justify-between">
            <span>HIGH RISK</span>
            <Shield className="w-3.5 h-3.5 text-forge-rose" />
          </div>
          <div className="text-xl font-bold text-forge-rose mt-1">{highRiskEntities.length}</div>
          <div className="text-[9px] text-forge-rose/80">Score &ge; 75</div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-amber flex items-center justify-between">
            <span>AI LEADS</span>
            <Sparkles className="w-3.5 h-3.5 text-forge-amber" />
          </div>
          <div className="text-xl font-bold text-forge-amber mt-1">
            {unverifiedRelationships.length}
          </div>
          <div className="text-[9px] text-forge-amber/80">Quarantine Gate</div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-emerald flex items-center justify-between">
            <span>EVIDENCE</span>
            <FileSearch className="w-3.5 h-3.5 text-forge-emerald" />
          </div>
          <div className="text-xl font-bold text-white mt-1">{evidenceList.length}</div>
          <div className="text-[9px] text-forge-emerald">Sealed Exhibits</div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-text-muted flex items-center justify-between">
            <span>RELATIONSHIPS</span>
            <UserCheck className="w-3.5 h-3.5 text-forge-cyan" />
          </div>
          <div className="text-xl font-bold text-white mt-1">{relationships.length}</div>
          <div className="text-[9px] text-forge-text-muted">18 Verified Links</div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-rose flex items-center justify-between">
            <span>ALERTS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-forge-rose" />
          </div>
          <div className="text-xl font-bold text-white mt-1">{alerts.length}</div>
          <div className="text-[9px] text-forge-rose font-bold">2 Critical Anomaly</div>
        </div>
      </div>

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Intelligence Discoveries & Review Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Recent Intelligence Discoveries */}
          <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
              <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>KEY INTELLIGENCE DISCOVERIES</span>
              </div>
              <span className="text-[10px] font-mono text-forge-text-muted">AUTO-GROUNDED BY AGENT SWARM</span>
            </div>

            <div className="space-y-3">
              {/* Discovery 1: The 3-hop bridge */}
              <div className="p-3.5 bg-forge-bg rounded-md border border-forge-border hover:border-forge-cyan/50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
                    TELECOM + FINANCIAL FUSION
                  </span>
                  <span className="font-mono text-[10px] text-forge-emerald font-bold">94% Confidence</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  3-Hop Bridge Discovered: Rajesh Kumar &harr; Burner Phone &harr; Amit Sharma
                </h4>
                <p className="text-xs text-forge-text-secondary leading-relaxed">
                  Sequential calls from Vasant Vihar tower to Karol Bagh tower via burner hardware IMEI 861092049182091 occurred 15 minutes before ₹1.85 Cr RTGS Hawala remittance.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-forge-border/40 text-xs font-mono">
                  <span className="text-forge-text-muted text-[10px]">Citations: IF-EVD-002, IF-EVD-005</span>
                  <button
                    onClick={() => {
                      runAiQuery('Show the strongest connection between Rajesh Kumar and Amit Sharma');
                      navigate('/graph');
                    }}
                    className="text-forge-cyan hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <span>Highlight in Network Graph</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Discovery 2: Dubai Hawala Token */}
              <div className="p-3.5 bg-forge-bg rounded-md border border-forge-border hover:border-forge-cyan/50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-forge-amber/15 text-forge-amber border border-forge-amber/30">
                    DOCUMENT + AUDIO WIRE INTERCEPT
                  </span>
                  <span className="font-mono text-[10px] text-forge-emerald font-bold">92% Confidence</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Cross-Border Hawala Token Match (500,000 AED)
                </h4>
                <p className="text-xs text-forge-text-secondary leading-relaxed">
                  Seized handwritten chit #CH-992 from Surya Bullion matched intercepted phone wiretap #WT-26-088 where Mohd. Tariq confirmed settlement at Deira Gold Souk desk.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-forge-border/40 text-xs font-mono">
                  <span className="text-forge-text-muted text-[10px]">Citations: IF-EVD-006, IF-EVD-007</span>
                  <button
                    onClick={() => {
                      const ev = evidenceService.getEvidenceById('IF-EVD-006');
                      if (ev) selectEvidence(ev);
                    }}
                    className="text-forge-cyan hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <span>Inspect Token Exhibit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Discovery 3: Warehouse CCTV Sighting */}
              <div className="p-3.5 bg-forge-bg rounded-md border border-forge-border hover:border-forge-cyan/50 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-forge-rose/15 text-forge-rose border border-forge-rose/30">
                    YOLOV8 COMPUTER VISION
                  </span>
                  <span className="font-mono text-[10px] text-forge-emerald font-bold">96% Confidence</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Black Scorpio Fastag Crossing &amp; Okhla Cash Handover
                </h4>
                <p className="text-xs text-forge-text-secondary leading-relaxed">
                  Courier Suresh Raina and logistics controller Vikram Malhotra identified transferring currency duffle bags at Shed #14 gate at 19:42 IST.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-forge-border/40 text-xs font-mono">
                  <span className="text-forge-text-muted text-[10px]">Citations: IF-EVD-003, IF-EVD-004</span>
                  <button
                    onClick={() => navigate('/timeline')}
                    className="text-forge-cyan hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <span>Inspect Chronological Sequence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Evidence Review & Quarantine Queue */}
          <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
              <div className="flex items-center space-x-2 text-forge-amber font-mono text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>HUMAN-IN-THE-LOOP QUARANTINE QUEUE ({unverifiedRelationships.length})</span>
              </div>
              <span className="text-[10px] font-mono text-forge-text-muted">AWAITING INVESTIGATOR APPROVAL</span>
            </div>

            <div className="space-y-3">
              {unverifiedRelationships.map((rel) => {
                const source = investigationService.getEntityDetails(rel.sourceId);
                const target = investigationService.getEntityDetails(rel.targetId);

                return (
                  <div
                    key={rel.id}
                    className="p-3.5 bg-forge-bg rounded-md border border-forge-amber/30 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">
                        {source?.name || rel.sourceId} &rarr; {target?.name || rel.targetId}
                      </span>
                      <span className="text-forge-amber text-[11px] font-bold">
                        {rel.confidence}% Confidence
                      </span>
                    </div>

                    <div className="text-[11px] text-forge-cyan font-sans">{rel.type.replace(/_/g, ' ')}</div>
                    {rel.aiReasoning && (
                      <p className="text-[11px] text-forge-text-secondary font-sans leading-relaxed">
                        {rel.aiReasoning}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-forge-border/40">
                      <button
                        onClick={() => selectRelationship(rel)}
                        className="text-[11px] text-forge-text-muted hover:text-white underline"
                      >
                        Inspect Supporting Evidence ({rel.evidenceIds.length})
                      </button>
                      <button
                        onClick={() => verifyRelationshipAction(rel.id)}
                        className="px-3 py-1 bg-forge-emerald/20 hover:bg-forge-emerald/30 border border-forge-emerald/50 text-forge-emerald rounded text-[11px] font-bold flex items-center space-x-1 transition"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFY &amp; MINT BLOCK</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide): Threat Radar, High Risk Targets & Activity Log */}
        <div className="space-y-6">
          {/* High-Priority Alerts */}
          <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
              <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>HIGH PRIORITY THREATS</span>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-[10px] font-mono text-forge-cyan hover:underline"
              >
                VIEW ALL ({alerts.length})
              </button>
            </div>

            <div className="space-y-2">
              {criticalAlerts.slice(0, 4).map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => selectAlert(alt)}
                  className="p-2.5 bg-forge-bg rounded border border-forge-border hover:border-forge-borderLight cursor-pointer transition space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-forge-rose/20 text-forge-rose'
                          : 'bg-forge-amber/20 text-forge-amber'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="text-forge-text-muted">{alt.id}</span>
                  </div>
                  <div className="font-bold text-white text-xs">{alt.title}</div>
                  <p className="text-[11px] text-forge-text-muted line-clamp-2 leading-relaxed">
                    {alt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* High-Risk Targets Watchlist */}
          <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
              <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
                <Shield className="w-4 h-4" />
                <span>KEY SUSPECTS WATCHLIST</span>
              </div>
              <span className="text-[10px] font-mono text-forge-text-muted">RISK INDEX &ge; 75</span>
            </div>

            <div className="space-y-2">
              {highRiskEntities.slice(0, 5).map((person: Entity) => (
                <div
                  key={person.id}
                  onClick={() => selectEntity(person)}
                  className="p-2.5 bg-forge-bg rounded border border-forge-border hover:border-forge-cyan/40 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <span>{person.name}</span>
                      <span className="text-[9px] font-mono text-forge-text-muted">[{person.id}]</span>
                    </div>
                    <div className="text-[10px] text-forge-cyan truncate max-w-[170px]">{person.role}</div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-forge-rose/20 text-forge-rose border border-forge-rose/40">
                    {person.riskScore}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log (Blockchain Ledger Feed) */}
          <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
              <div className="flex items-center space-x-2 text-forge-emerald font-mono text-xs font-bold">
                <Clock className="w-4 h-4" />
                <span>BLOCKCHAIN ACTIVITY FEED</span>
              </div>
              <button
                onClick={() => navigate('/audit')}
                className="text-[10px] font-mono text-forge-cyan hover:underline"
              >
                LEDGER
              </button>
            </div>

            <div className="space-y-2 text-[11px] font-mono">
              {recentAuditBlocks.map((b) => (
                <div key={b.id} className="p-2 bg-forge-bg rounded border border-forge-border space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-forge-emerald font-bold">BLOCK #{b.blockIndex}</span>
                    <span className="text-forge-text-muted">{b.timestamp.slice(11, 19)}</span>
                  </div>
                  <div className="text-white text-xs font-sans font-medium">{b.action}</div>
                  <div className="text-[10px] text-forge-text-muted truncate">
                    Hash: {truncateHash(b.blockHash, 8, 8)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
