import React, { useState, useMemo, useEffect } from 'react';
import {
  FolderKanban,
  User,
  Users,
  Landmark,
  FileSearch,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { Entity, Relationship } from '../../types';
import { investigationService } from '../../services';
import {
  PersonClassificationBadge,
  SeverityBadge,
} from '../common/SeverityBadge';

export interface SingleCaseDetailGraphProps {
  initialCaseId?: string;
  onSelectEntity?: (entity: Entity) => void;
  onSelectCase?: (caseId: string) => void;
  onSwitchToCrossCase?: () => void;
}

export const SingleCaseDetailGraph: React.FC<SingleCaseDetailGraphProps> = ({
  initialCaseId,
  onSelectEntity,
  onSelectCase,
  onSwitchToCrossCase,
}) => {
  const allCases = useMemo(() => investigationService.getCases(), []);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId || allCases[0]?.id || 'IF-CASE-2026-0882'
  );
  const [selectedNode, setSelectedNode] = useState<Entity | null>(null);
  const [lastDismissedNode, setLastDismissedNode] = useState<Entity | null>(null);
  const [aiReviewRelationship, setAiReviewRelationship] = useState<Relationship | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialCaseId) {
      setSelectedCaseId(initialCaseId);
    }
  }, [initialCaseId]);

  const targetCase = useMemo(() => {
    return allCases.find((c) => c.id === selectedCaseId || c.code === selectedCaseId) || allCases[0];
  }, [allCases, selectedCaseId]);

  const caseEntities = useMemo(() => {
    return investigationService.getEntities(targetCase.id);
  }, [targetCase.id, actionFeedback]);

  const caseRelationships = useMemo(() => {
    return investigationService.getRelationships(targetCase.id);
  }, [targetCase.id, actionFeedback]);

  // Group entities into investigative hierarchical tiers
  const tiers = useMemo(() => {
    const accused = caseEntities.filter(
      (e) => e.type === 'PERSON' && (e.personClassification === 'ACCUSED' || e.riskScore >= 80)
    );
    const associates = caseEntities.filter(
      (e) =>
        e.type === 'PERSON' &&
        e.personClassification !== 'ACCUSED' &&
        e.riskScore < 80
    );
    const financial = caseEntities.filter(
      (e) => e.type === 'BANK_ACCOUNT' || e.type === 'TRANSACTION'
    );
    const orgs = caseEntities.filter((e) => e.type === 'ORGANIZATION');
    const locations = caseEntities.filter((e) => e.type === 'LOCATION');
    const evidence = caseEntities.filter((e) =>
      ['CCTV', 'AUDIO', 'DOCUMENT', 'FIR', 'CDR'].includes(e.type)
    );

    return {
      accused,
      associates,
      financial,
      orgs,
      locations,
      evidence,
    };
  }, [caseEntities]);

  // Handle Human-in-the-Loop review
  const handleVerify = (relId: string) => {
    investigationService.verifyRelationship(relId, 'Senior Field Officer (Badge 4402)');
    setActionFeedback('Relationship verified and signed into immutable audit trail.');
    setAiReviewRelationship(null);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleReject = (relId: string) => {
    if (!rejectionReason.trim()) return;
    investigationService.rejectRelationship(
      relId,
      'Senior Field Officer (Badge 4402)',
      rejectionReason.trim()
    );
    setActionFeedback('Relationship rejected and flagged in intelligence log.');
    setAiReviewRelationship(null);
    setRejectionReason('');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto bg-forge-bg select-none font-sans p-6 space-y-6">
      {/* Top Floating Controls Bar */}
      <div className="glass-card rounded-xl p-4 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30 font-bold uppercase">
                SINGLE-CASE INVESTIGATION FLOW GRAPH
              </span>
              <span className="text-xs font-mono text-forge-text-muted">
                Hierarchical Evidence &amp; Actor Decomposition
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
              {targetCase.name}
            </h2>
          </div>
        </div>

        {/* Case Switcher Dropdown */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-forge-text-muted text-[11px]">DISSECT CASE:</span>
          <select
            value={targetCase.id}
            onChange={(e) => {
              setSelectedCaseId(e.target.value);
              if (onSelectCase) onSelectCase(e.target.value);
            }}
            className="bg-forge-bg border border-white/[0.1] rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-forge-cyan"
          >
            {allCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name.slice(0, 28)}...
              </option>
            ))}
          </select>

          {onSwitchToCrossCase && (
            <button
              onClick={onSwitchToCrossCase}
              className="px-2.5 py-1.5 rounded-lg bg-forge-cyan/15 hover:bg-forge-cyan/25 text-forge-cyan border border-forge-cyan/30 text-xs font-mono transition"
              title="Return to Cross-Case Hub"
            >
              Cross-Case Hub
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-lg bg-forge-emerald/20 border border-forge-emerald/40 text-emerald-300 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Crime Board Investigative Flow Canvas (Multi-Tier DAG) */}
      <div className="space-y-6">
        {/* Tier 1: Case Docket Master Card */}
        <div className="max-w-xl mx-auto p-5 rounded-2xl glass-card border border-forge-cyan/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30 text-xs font-mono font-bold">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>ORIGIN DOSSIER: {targetCase.code}</span>
          </div>
          <h3 className="text-lg font-bold text-white">{targetCase.name}</h3>
          <p className="text-xs text-forge-text-secondary leading-relaxed max-w-md mx-auto">
            {targetCase.description}
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs font-mono text-forge-text-muted pt-2 border-t border-white/[0.06]">
            <span>Lead: <strong className="text-white">{targetCase.leadInvestigator}</strong></span>
            <span>&middot;</span>
            <span>Location: <strong className="text-forge-amber">{targetCase.location}</strong></span>
            <span>&middot;</span>
            <SeverityBadge level={targetCase.priority} size="xs" />
          </div>
        </div>

        {/* Tier Connector Arrow */}
        <div className="flex justify-center text-forge-cyan opacity-60">
          <div className="h-6 w-0.5 bg-forge-cyan" />
        </div>

        {/* Tier 2: Primary Accused & Targets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-rose-400 border-b border-rose-500/20 pb-1">
            <span className="font-bold flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5" />
              <span>TIER 1 · PRIMARY ACCUSED &amp; SYNDICATE TARGETS ({tiers.accused.length})</span>
            </span>
            <span className="text-[10px] text-forge-text-muted">THREAT RADAR ≥ 75</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.accused.map((a) => (
              <div
                key={a.id}
                onClick={() => {
                  setSelectedNode(a);
                  if (onSelectEntity) onSelectEntity(a);
                }}
                className="glass-card p-4 rounded-xl border border-rose-500/30 hover:border-rose-400 hover:bg-white/[0.02] cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{a.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">
                    {a.riskScore}/100
                  </span>
                </div>
                <div className="text-[11px] text-forge-text-muted font-mono">{a.role}</div>
                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-forge-text-muted">
                  <span>ID: {a.id}</span>
                  <span className="text-forge-cyan group-hover:text-white flex items-center space-x-0.5">
                    <span>Inspect</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Connector Arrow */}
        <div className="flex justify-center text-forge-cyan opacity-60">
          <div className="h-6 w-0.5 bg-forge-cyan" />
        </div>

        {/* Tier 3: Associates & Victims / Witnesses */}
        {tiers.associates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-teal-400 border-b border-teal-500/20 pb-1">
              <span className="font-bold flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>TIER 2 · ASSOCIATES, WITNESSES &amp; COMPLAINANTS ({tiers.associates.length})</span>
              </span>
              <span className="text-[10px] text-forge-text-muted">LINKED PERSONS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tiers.associates.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedNode(item);
                    if (onSelectEntity) onSelectEntity(item);
                  }}
                  className="glass-card p-4 rounded-xl border border-teal-500/30 hover:border-teal-400 hover:bg-white/[0.02] cursor-pointer transition space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{item.name}</span>
                    <PersonClassificationBadge classification={item.personClassification} size="xs" />
                  </div>
                  <div className="text-[11px] text-forge-text-muted font-mono">{item.role}</div>
                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-forge-text-muted">
                    <span>ID: {item.id}</span>
                    <span className="text-forge-cyan group-hover:text-white flex items-center space-x-0.5">
                      <span>Inspect</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier Connector Arrow */}
        <div className="flex justify-center text-forge-cyan opacity-60">
          <div className="h-6 w-0.5 bg-forge-cyan" />
        </div>

        {/* Tier 4: Financial Conduits & Shell Organizations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400 border-b border-amber-500/20 pb-1">
            <span className="font-bold flex items-center space-x-1.5">
              <Landmark className="w-3.5 h-3.5" />
              <span>TIER 3 · FINANCIAL TRANSACTIONS, BANKS &amp; SHELL ORGS</span>
            </span>
            <span className="text-[10px] text-forge-text-muted">AML TELEMETRY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...tiers.financial, ...tiers.orgs].map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedNode(item);
                  if (onSelectEntity) onSelectEntity(item);
                }}
                className="glass-card p-4 rounded-xl border border-amber-500/30 hover:border-amber-400 hover:bg-white/[0.02] cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white truncate max-w-[200px]">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold">
                    {item.type}
                  </span>
                </div>
                <div className="text-[11px] text-forge-text-muted font-mono">
                  {item.metadata?.accountNumber
                    ? `A/C: ${item.metadata.accountNumber}`
                    : item.role || 'Corporate Shell Vehicle'}
                </div>
                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-forge-text-muted">
                  <span>Vol: {String(item.metadata?.amount || item.metadata?.estimatedVolume || 'Tracked')}</span>
                  <span className="text-forge-cyan group-hover:text-white flex items-center space-x-0.5">
                    <span>Inspect</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Connector Arrow */}
        <div className="flex justify-center text-forge-cyan opacity-60">
          <div className="h-6 w-0.5 bg-forge-cyan" />
        </div>

        {/* Tier 5: Monitored Locations & Forensic Evidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-forge-cyan border-b border-forge-cyan/20 pb-1">
            <span className="font-bold flex items-center space-x-1.5">
              <FileSearch className="w-3.5 h-3.5" />
              <span>TIER 4 · PHYSICAL LOCATIONS &amp; FORENSIC EXHIBITS</span>
            </span>
            <span className="text-[10px] text-forge-text-muted">CHAIN OF CUSTODY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...tiers.locations, ...tiers.evidence].map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedNode(item);
                  if (onSelectEntity) onSelectEntity(item);
                }}
                className="glass-card p-4 rounded-xl border border-forge-cyan/30 hover:border-forge-cyan hover:bg-white/[0.02] cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white truncate max-w-[200px]">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forge-cyan/15 text-forge-cyan font-bold">
                    {item.type}
                  </span>
                </div>
                <div className="text-[11px] text-forge-text-muted font-mono truncate">
                  {item.metadata?.address || item.role || (item.metadata?.description as string) || item.notes || 'Forensic Exhibit Record'}
                </div>
                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-forge-text-muted">
                  <span>ID: {item.id}</span>
                  <span className="text-forge-cyan group-hover:text-white flex items-center space-x-0.5">
                    <span>Inspect</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggested Relationships Review Banner */}
        <div className="p-4 rounded-xl glass-card border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <div className="flex items-center space-x-2 text-amber-300 font-mono text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI-SUGGESTED RELATIONSHIPS AWAITING HUMAN ATTESTATION</span>
            </div>
            <span className="text-[10px] font-mono text-forge-text-muted">
              HUMAN-IN-THE-LOOP AUDIT PROTOCOL
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {caseRelationships
              .filter((r) => r.verificationStatus === 'AI_SUGGESTED')
              .map((rel) => {
                const src = investigationService.getEntityById(rel.sourceId);
                const tgt = investigationService.getEntityById(rel.targetId);
                return (
                  <div
                    key={rel.id}
                    className="p-3 rounded-lg bg-forge-bg/80 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{src?.name || rel.sourceId}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-white">{tgt?.name || rel.targetId}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          {rel.label || rel.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-forge-text-secondary leading-snug font-sans">
                        {rel.aiReasoning || 'Algorithmic co-occurrence detected from cellular CDR ping overlap.'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleVerify(rel.id)}
                        className="px-3 py-1.5 rounded-lg bg-forge-emerald hover:bg-emerald-600 text-slate-950 font-bold transition flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Link</span>
                      </button>

                      <button
                        onClick={() => setAiReviewRelationship(rel)}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 border border-rose-500/30 transition flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Reject Relationship Modal */}
      {aiReviewRelationship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card max-w-md w-full rounded-2xl p-5 border border-white/[0.12] space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="font-bold text-white">REJECT AI SUGGESTED RELATIONSHIP</span>
              <button
                onClick={() => setAiReviewRelationship(null)}
                className="text-forge-text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-forge-text-secondary font-sans leading-relaxed">
              Please enter the investigative justification for rejecting this algorithmic link. This rationale will be permanently recorded in the immutable audit ledger.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. CDR cell tower overlap confirmed accidental; target was at scheduled court hearing..."
              className="w-full h-24 bg-forge-bg border border-white/[0.1] rounded-lg p-2.5 text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan text-xs"
            />

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setAiReviewRelationship(null)}
                className="px-3 py-1.5 rounded bg-white/[0.04] text-forge-text-secondary hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(aiReviewRelationship.id)}
                disabled={!rejectionReason.trim()}
                className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Node Inspection Drawer */}
      {selectedNode && (
        <div className="fixed bottom-4 right-4 z-40 max-w-md w-full glass-card p-4 rounded-xl border border-forge-cyan/40 shadow-2xl space-y-3 font-mono text-xs animate-slideUp">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-forge-cyan animate-pulse" />
              <span className="font-bold text-white uppercase">ENTITY DOSSIER INSPECTOR</span>
            </div>
            <button
              onClick={() => {
                setLastDismissedNode(selectedNode);
                setSelectedNode(null);
              }}
              className="p-1 rounded text-forge-text-muted hover:text-white hover:bg-white/[0.05]"
              title="Close Inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">{selectedNode.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
                {selectedNode.type}
              </span>
            </div>
            {selectedNode.role && (
              <div className="text-xs text-forge-text-secondary font-mono">{selectedNode.role}</div>
            )}
            <div className="text-xs text-forge-text-muted font-mono">
              ID: {selectedNode.id} &middot; Status: {selectedNode.status}
              {selectedNode.riskScore !== undefined && (
                <span className="ml-2 text-rose-400 font-bold">Threat: {selectedNode.riskScore}/100</span>
              )}
            </div>
          </div>

          {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
            <div className="p-2.5 rounded-lg bg-forge-bg/60 border border-white/[0.04] space-y-1 text-[11px] font-mono">
              <div className="text-[10px] text-forge-text-muted uppercase">RECORDED ATTRIBUTES:</div>
              {Object.entries(selectedNode.metadata).slice(0, 4).map(([key, val]) => (
                <div key={key} className="flex justify-between text-forge-text-secondary truncate">
                  <span className="text-forge-text-muted">{key}:</span>
                  <span className="text-white truncate max-w-[220px]">{String(val)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setLastDismissedNode(selectedNode);
                setSelectedNode(null);
              }}
              className="px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Restore Button for Dismissed Entity Inspector */}
      {!selectedNode && lastDismissedNode && (
        <button
          onClick={() => setSelectedNode(lastDismissedNode)}
          className="fixed bottom-4 right-4 z-40 glass-card px-3.5 py-2 rounded-xl border border-forge-cyan/40 text-forge-cyan text-xs font-mono font-bold flex items-center space-x-2 hover:bg-white/[0.05] transition shadow-2xl"
          title="Reopen last inspected entity dossier"
        >
          <User className="w-3.5 h-3.5" />
          <span>Reopen Inspector: {lastDismissedNode.name}</span>
        </button>
      )}
    </div>
  );
};
