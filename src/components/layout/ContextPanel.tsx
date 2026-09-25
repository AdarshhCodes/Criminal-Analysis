import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  User,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  Cpu,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Network,
  Clock,
  FileText,
} from 'lucide-react';
import { useInvestigationStore, ContextPanelTab } from '../../stores';
import { investigationService, evidenceService } from '../../services';

export const ContextPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    isRightPanelOpen,
    toggleRightPanel,
    activeContextTab,
    setActiveContextTab,
    selectedEntity,
    selectedEvidence,
    selectedAlert,
    selectedRelationship,
    aiResult,
    verifyRelationshipAction,
    rejectRelationshipAction,
    openEvidenceModal,
    expandNode,
    setTimelineFilter,
    runAiQuery,
  } = useInvestigationStore();

  const [copiedHash, setCopiedHash] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!isRightPanelOpen) {
    return (
      <button
        onClick={() => toggleRightPanel(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-forge-panel border border-forge-border border-r-0 rounded-l-md p-2 text-forge-cyan hover:bg-forge-card transition shadow-panel z-20"
        title="Open Context Panel"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  // Calculate entity network breakdown if an entity is selected
  let networkBreakdown = {
    persons: 0,
    phones: 0,
    accounts: 0,
    locations: 0,
    vehicles: 0,
    organizations: 0,
    verifiedRels: 0,
    aiSuggestedRels: 0,
    rejectedRels: 0,
    linkedEvidence: [] as { id: string; title: string; type: string }[],
  };

  if (selectedEntity) {
    const connections = investigationService.findConnections(selectedEntity.id, 2);
    const allEntities = investigationService.getEntities();
    const allRelationships = investigationService.getRelationships();

    connections.connectedEntityIds.forEach((id) => {
      const ent = allEntities.find((e) => e.id === id);
      if (!ent) return;
      if (ent.type === 'PERSON') networkBreakdown.persons++;
      else if (ent.type === 'PHONE') networkBreakdown.phones++;
      else if (ent.type === 'BANK_ACCOUNT') networkBreakdown.accounts++;
      else if (ent.type === 'LOCATION') networkBreakdown.locations++;
      else if (ent.type === 'VEHICLE') networkBreakdown.vehicles++;
      else if (ent.type === 'ORGANIZATION') networkBreakdown.organizations++;
    });

    allRelationships.forEach((rel) => {
      if (rel.sourceId === selectedEntity.id || rel.targetId === selectedEntity.id) {
        if (rel.verificationStatus === 'HUMAN_VERIFIED') networkBreakdown.verifiedRels++;
        else if (rel.verificationStatus === 'AI_SUGGESTED') networkBreakdown.aiSuggestedRels++;
        else if (rel.verificationStatus === 'REJECTED') networkBreakdown.rejectedRels++;
      }
    });

    const evs = evidenceService.getEvidenceForEntity(selectedEntity.id);
    networkBreakdown.linkedEvidence = evs.map((e) => ({ id: e.id, title: e.title, type: e.type }));
  }

  const tabs: { id: ContextPanelTab; label: string; icon: React.ElementType }[] = [
    { id: 'ENTITY', label: 'Entity Dossier', icon: User },
    { id: 'RELATIONSHIP', label: 'Review Gate', icon: ShieldCheck },
    { id: 'EVIDENCE', label: 'Evidence', icon: FileSearch },
    { id: 'ALERT', label: 'Threats', icon: AlertTriangle },
    { id: 'AI', label: 'AI Swarm', icon: Cpu },
  ];

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs md:hidden z-30"
        onClick={() => toggleRightPanel(false)}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 right-0 md:static w-full sm:w-96 md:w-84 lg:w-96 bg-forge-panel border-l border-forge-border flex flex-col shrink-0 select-none z-40 md:z-20 overflow-hidden shadow-panel">
      {/* Panel Header & Navigation Tabs */}
      <div className="border-b border-forge-border bg-forge-bg/80">
        <div className="flex items-center justify-between px-4 py-2 border-b border-forge-border/60">
          <span className="text-[11px] font-mono font-bold tracking-wider text-forge-cyan uppercase">
            INTELLIGENCE DOSSIER
          </span>
          <button
            onClick={() => toggleRightPanel(false)}
            className="p-1 rounded text-forge-text-muted hover:text-white hover:bg-forge-card transition"
            title="Collapse Panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex px-2 py-1 space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeContextTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveContextTab(tab.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium transition ${
                  isActive
                    ? 'bg-forge-card text-forge-cyan border border-forge-border shadow-sm'
                    : 'text-forge-text-muted hover:text-white hover:bg-forge-card/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {/* TAB 1: ENTITY INVESTIGATION DOSSIER */}
        {activeContextTab === 'ENTITY' && (
          selectedEntity ? (
            <div className="space-y-4">
              {/* Entity Header */}
              <div className="bg-forge-card p-4 rounded-md border border-forge-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40">
                    {selectedEntity.type} — {selectedEntity.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-rose/20 text-forge-rose font-bold border border-forge-rose/30">
                    UNDER INVESTIGATION
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{selectedEntity.name}</h3>
                  {selectedEntity.role && (
                    <p className="text-xs text-forge-cyan font-medium mt-0.5">{selectedEntity.role}</p>
                  )}
                  {selectedEntity.aliases && selectedEntity.aliases.length > 0 && (
                    <div className="text-[11px] text-forge-text-muted mt-1 font-mono">
                      Aliases: {selectedEntity.aliases.join(', ')}
                    </div>
                  )}
                </div>

                {/* Risk Score Meter */}
                <div className="space-y-1 pt-1 border-t border-forge-border/50">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-forge-text-muted">THREAT RISK SCORE</span>
                    <span
                      className={`font-bold ${
                        selectedEntity.riskScore >= 75
                          ? 'text-forge-rose'
                          : selectedEntity.riskScore >= 50
                          ? 'text-forge-amber'
                          : 'text-forge-emerald'
                      }`}
                    >
                      {selectedEntity.riskScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-forge-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedEntity.riskScore >= 75
                          ? 'bg-forge-rose'
                          : selectedEntity.riskScore >= 50
                          ? 'bg-forge-amber'
                          : 'bg-forge-emerald'
                      }`}
                      style={{ width: `${selectedEntity.riskScore}%` }}
                    />
                  </div>
                </div>

                {selectedEntity.primaryIdentifier && (
                  <div className="p-2 rounded bg-forge-bg border border-forge-border font-mono text-[11px] text-forge-text-secondary">
                    <span className="text-forge-text-muted block text-[9px]">PRIMARY IDENTIFIER</span>
                    {selectedEntity.primaryIdentifier}
                  </div>
                )}
              </div>

              {/* Network Connectivity Breakdown */}
              <div className="bg-forge-card p-3.5 rounded-md border border-forge-border space-y-2.5">
                <div className="text-[10px] font-mono uppercase text-forge-text-muted font-bold flex items-center justify-between">
                  <span>NETWORK CONNECTIVITY (2 HOPS)</span>
                  <Network className="w-3.5 h-3.5 text-forge-cyan" />
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                  <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                    <div className="text-white font-bold">{networkBreakdown.persons}</div>
                    <div className="text-forge-text-muted text-[9px]">PERSONS</div>
                  </div>
                  <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                    <div className="text-forge-amber font-bold">{networkBreakdown.phones}</div>
                    <div className="text-forge-text-muted text-[9px]">PHONES</div>
                  </div>
                  <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                    <div className="text-forge-emerald font-bold">{networkBreakdown.accounts}</div>
                    <div className="text-forge-text-muted text-[9px]">ACCOUNTS</div>
                  </div>
                  <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                    <div className="text-forge-rose font-bold">{networkBreakdown.locations}</div>
                    <div className="text-forge-text-muted text-[9px]">LOCATIONS</div>
                  </div>
                  <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                    <div className="text-indigo-400 font-bold">{networkBreakdown.vehicles}</div>
                    <div className="text-forge-text-muted text-[9px]">VEHICLES</div>
                  </div>
                  <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                    <div className="text-indigo-400 font-bold">{networkBreakdown.organizations}</div>
                    <div className="text-forge-text-muted text-[9px]">CORP SHELLS</div>
                  </div>
                </div>
              </div>

              {/* Relationships Breakdown */}
              <div className="bg-forge-card p-3.5 rounded-md border border-forge-border space-y-2">
                <div className="text-[10px] font-mono uppercase text-forge-text-muted font-bold flex items-center justify-between">
                  <span>RELATIONSHIPS AUDIT</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-forge-emerald" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-forge-border/40">
                  <span className="text-forge-emerald">Human Verified:</span>
                  <span className="text-white font-bold">{networkBreakdown.verifiedRels}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-forge-border/40">
                  <span className="text-forge-amber">AI Suggested:</span>
                  <span className="text-white font-bold">{networkBreakdown.aiSuggestedRels}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono py-1">
                  <span className="text-forge-rose">Rejected / Disproven:</span>
                  <span className="text-white font-bold">{networkBreakdown.rejectedRels}</span>
                </div>
              </div>

              {/* Supporting Evidence References */}
              {networkBreakdown.linkedEvidence.length > 0 && (
                <div className="bg-forge-card p-3.5 rounded-md border border-forge-border space-y-2">
                  <div className="text-[10px] font-mono uppercase text-forge-text-muted font-bold flex items-center justify-between">
                    <span>EVIDENCE CITATIONS ({networkBreakdown.linkedEvidence.length})</span>
                    <FileSearch className="w-3.5 h-3.5 text-forge-cyan" />
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {networkBreakdown.linkedEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => {
                          const fullEv = evidenceService.getEvidenceById(ev.id);
                          if (fullEv) openEvidenceModal(fullEv);
                        }}
                        className="p-2 rounded bg-forge-bg hover:bg-forge-cardHover border border-forge-border cursor-pointer transition flex items-center justify-between"
                      >
                        <span className="text-forge-cyan font-bold">{ev.id}</span>
                        <span className="text-white font-sans text-xs truncate max-w-[170px]">
                          {ev.title}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-forge-card text-forge-text-muted">
                          {ev.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="space-y-2 pt-2 border-t border-forge-border">
                <div className="text-[10px] font-mono uppercase text-forge-text-muted font-bold">
                  INVESTIGATOR ACTIONS
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    onClick={() => expandNode(selectedEntity.id)}
                    className="p-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white flex items-center justify-center space-x-1.5 transition"
                  >
                    <Network className="w-3.5 h-3.5 text-forge-cyan" />
                    <span>Expand Network</span>
                  </button>
                  <button
                    onClick={() => {
                      setTimelineFilter('ALL');
                      navigate('/timeline');
                    }}
                    className="p-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white flex items-center justify-center space-x-1.5 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-forge-amber" />
                    <span>View Timeline</span>
                  </button>
                  <button
                    onClick={() => navigate('/evidence')}
                    className="p-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white flex items-center justify-center space-x-1.5 transition"
                  >
                    <FileSearch className="w-3.5 h-3.5 text-forge-emerald" />
                    <span>View Evidence</span>
                  </button>
                  <button
                    onClick={() => navigate('/reports')}
                    className="p-2 rounded bg-forge-cyan/15 hover:bg-forge-cyan/25 border border-forge-cyan/40 text-forge-cyan font-bold flex items-center justify-center space-x-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Brief</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-forge-text-muted space-y-2">
              <User className="w-8 h-8 mx-auto text-forge-border" />
              <p className="text-xs">No entity selected</p>
              <p className="text-[11px]">Click on any node in the graph or watchlist to view its dossier.</p>
            </div>
          )
        )}

        {/* TAB 2: RELATIONSHIP REVIEW GATE */}
        {activeContextTab === 'RELATIONSHIP' && (
          selectedRelationship ? (
            <div className="space-y-4">
              <div className="bg-forge-card p-3.5 rounded-md border border-forge-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedRelationship.verificationStatus === 'HUMAN_VERIFIED'
                        ? 'bg-forge-emerald/20 text-forge-emerald border border-forge-emerald/40'
                        : selectedRelationship.verificationStatus === 'AI_SUGGESTED'
                        ? 'bg-forge-amber/20 text-forge-amber border border-forge-amber/40 animate-pulse'
                        : 'bg-forge-rose/20 text-forge-rose border border-forge-rose/40'
                    }`}
                  >
                    {selectedRelationship.verificationStatus.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-[11px] text-forge-cyan font-bold">
                    CONFIDENCE: {selectedRelationship.confidence}%
                  </span>
                </div>

                <div className="text-xs font-mono text-forge-text-primary">
                  <span className="text-forge-text-muted block text-[9px]">RELATIONSHIP TYPE</span>
                  <span className="font-bold text-white text-sm">{selectedRelationship.type}</span>
                  {selectedRelationship.label && (
                    <span className="block text-forge-cyan text-xs mt-0.5">{selectedRelationship.label}</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-forge-bg border border-forge-border font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] text-forge-text-muted block">SOURCE</span>
                    <span className="text-white font-bold">{selectedRelationship.sourceId}</span>
                  </div>
                  <span className="text-forge-cyan font-bold">&rarr;</span>
                  <div className="text-right">
                    <span className="text-[9px] text-forge-text-muted block">TARGET</span>
                    <span className="text-white font-bold">{selectedRelationship.targetId}</span>
                  </div>
                </div>
              </div>

              {selectedRelationship.aiReasoning && (
                <div className="p-3 bg-forge-card rounded-md border border-forge-border space-y-1">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-forge-amber font-bold">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>AI HYPOTHESIS &amp; REASONING</span>
                  </div>
                  <p className="text-forge-text-secondary leading-relaxed text-xs">
                    {selectedRelationship.aiReasoning}
                  </p>
                </div>
              )}

              {selectedRelationship.verificationStatus === 'AI_SUGGESTED' && (
                <div className="p-3.5 bg-forge-card rounded-md border border-forge-amber/40 space-y-3 font-mono">
                  <div className="p-2.5 rounded bg-forge-amber/10 border border-forge-amber/30 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-forge-amber font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>NO VERIFIED EVIDENCE</span>
                    </div>
                    <p className="text-[11px] text-forge-text-secondary font-sans leading-relaxed">
                      This relationship is currently supported by AI inference and has not been human verified.
                    </p>
                    <button
                      onClick={() => setActiveContextTab('EVIDENCE')}
                      className="mt-1 px-2.5 py-1 rounded bg-forge-amber/20 hover:bg-forge-amber/30 border border-forge-amber/40 text-forge-amber text-xs font-bold inline-flex items-center space-x-1 transition"
                    >
                      <span>[REVIEW EVIDENCE]</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-forge-border/60">
                    <div className="text-[10px] text-forge-text-muted uppercase font-bold mb-2">
                      HUMAN-IN-THE-LOOP VERIFICATION GATE
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => verifyRelationshipAction(selectedRelationship.id)}
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-forge-emerald/20 hover:bg-forge-emerald/30 border border-forge-emerald/50 text-forge-emerald py-2 rounded text-xs font-semibold transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>VERIFY LINK</span>
                      </button>
                      <button
                        onClick={() => setShowRejectInput(!showRejectInput)}
                        className="flex-1 flex items-center justify-center space-x-1.5 bg-forge-rose/20 hover:bg-forge-rose/30 border border-forge-rose/50 text-forge-rose py-2 rounded text-xs font-semibold transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>REJECT</span>
                      </button>
                    </div>
                  </div>

                  {showRejectInput && (
                    <div className="space-y-2 pt-2 border-t border-forge-border">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="State reason for rejecting AI hypothesis..."
                        className="w-full bg-forge-bg border border-forge-border rounded p-2 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-rose font-sans"
                        rows={2}
                      />
                      <button
                        onClick={() => {
                          if (rejectReason.trim()) {
                            rejectRelationshipAction(selectedRelationship.id, rejectReason.trim());
                            setShowRejectInput(false);
                          }
                        }}
                        className="w-full bg-forge-rose hover:bg-forge-rose/80 text-white py-1 rounded text-xs font-semibold transition"
                      >
                        CONFIRM REJECTION
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedRelationship.verificationStatus === 'HUMAN_VERIFIED' && (
                <div className="p-3 bg-forge-emerald/10 border border-forge-emerald/30 rounded-md font-mono text-[11px] text-forge-emerald space-y-1">
                  <div className="flex items-center space-x-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED BY {selectedRelationship.verifiedBy || 'Senior Investigator'}</span>
                  </div>
                  <div className="text-forge-text-muted text-[10px]">
                    Timestamp: {selectedRelationship.verifiedAt || selectedRelationship.createdAt}
                  </div>
                  <div className="text-forge-text-muted text-[10px]">
                    Cryptographic blockchain block sealed.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-forge-text-muted space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-forge-border" />
              <p className="text-xs">No relationship selected</p>
              <p className="text-[11px]">Click on any graph edge to inspect or review its verification status.</p>
            </div>
          )
        )}

        {/* TAB 3: EVIDENCE VIEWER */}
        {activeContextTab === 'EVIDENCE' && (
          selectedEvidence ? (
            <div className="space-y-4">
              <div className="bg-forge-card p-3.5 rounded-md border border-forge-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40">
                    {selectedEvidence.type}
                  </span>
                  <span className="text-[10px] font-mono text-forge-text-muted">
                    {selectedEvidence.id}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{selectedEvidence.title}</h3>
                <div className="text-[11px] font-mono text-forge-cyan">Source: {selectedEvidence.source}</div>
              </div>

              {/* SHA-256 Digital Seal */}
              <div className="p-3 bg-forge-card rounded-md border border-forge-border space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-forge-text-muted">
                  <span>CRYPTOGRAPHIC DIGITAL SEAL (SHA-256)</span>
                  <button
                    onClick={() => handleCopyHash(selectedEvidence.hash)}
                    className="flex items-center space-x-1 text-forge-cyan hover:underline"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-forge-bg border border-forge-border font-mono text-[10px] text-forge-emerald break-all">
                  {selectedEvidence.hash}
                </div>
              </div>

              {/* Full Modal Viewer CTA */}
              <button
                onClick={() => openEvidenceModal(selectedEvidence)}
                className="w-full py-2 rounded bg-forge-cyan/15 hover:bg-forge-cyan/25 border border-forge-cyan/40 text-forge-cyan font-mono text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <FileSearch className="w-4 h-4" />
                <span>OPEN FULL EVIDENCE VIEWER</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-forge-text-muted space-y-2">
              <FileSearch className="w-8 h-8 mx-auto text-forge-border" />
              <p className="text-xs">No evidence item selected</p>
              <p className="text-[11px]">Select an evidence file from the Evidence Vault or Entity dossier.</p>
            </div>
          )
        )}

        {/* TAB 4: ALERT DETAILS */}
        {activeContextTab === 'ALERT' && (
          selectedAlert ? (
            <div className="space-y-4">
              <div className="bg-forge-card p-3.5 rounded-md border border-forge-border space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      selectedAlert.severity === 'CRITICAL'
                        ? 'bg-forge-rose/20 text-forge-rose border border-forge-rose/40'
                        : selectedAlert.severity === 'HIGH'
                        ? 'bg-forge-amber/20 text-forge-amber border border-forge-amber/40'
                        : 'bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40'
                    }`}
                  >
                    {selectedAlert.severity} PRIORITY
                  </span>
                  <span className="font-mono text-[10px] text-forge-text-muted">{selectedAlert.id}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{selectedAlert.title}</h3>
                <p className="text-forge-text-secondary leading-relaxed text-xs">{selectedAlert.description}</p>
              </div>

              {selectedAlert.recommendedAction && (
                <div className="p-3 bg-forge-cyan/10 border border-forge-cyan/30 rounded-md space-y-1">
                  <div className="text-[10px] font-mono text-forge-cyan font-bold uppercase">
                    RECOMMENDED INVESTIGATIVE ACTION
                  </div>
                  <p className="text-xs text-white">{selectedAlert.recommendedAction}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-forge-text-muted space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-forge-border" />
              <p className="text-xs">No alert selected</p>
              <p className="text-[11px]">Select an alert from the Proactive Alerts feed to review findings.</p>
            </div>
          )
        )}

        {/* TAB 5: AI MULTI-AGENT SWARM */}
        {activeContextTab === 'AI' && (
          aiResult ? (
            <div className="space-y-4">
              {/* Question & Answer Card */}
              <div className="bg-forge-card p-3.5 rounded-md border border-forge-cyan/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40">
                    AI CASE ANSWER
                  </span>
                  <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-forge-emerald/20 text-forge-emerald font-bold">
                      {aiResult.confidence}% CONF.
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-forge-bg text-forge-text-muted border border-forge-border">
                      {aiResult.verificationStatus}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-forge-text-muted">
                  <strong className="text-forge-text-secondary">QUERY:</strong> &ldquo;{aiResult.query}&rdquo;
                </div>

                <div className="text-xs text-white font-medium leading-relaxed bg-forge-bg p-2.5 rounded border border-forge-border">
                  {aiResult.answer}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-[10px] font-mono text-forge-text-muted uppercase font-bold">
                    REASONING SUMMARY:
                  </div>
                  <p className="text-[11px] text-forge-text-secondary leading-relaxed font-sans">
                    {aiResult.reasoningSummary}
                  </p>
                </div>
              </div>

              {/* Supporting Evidence References */}
              {aiResult.evidenceIds.length > 0 && (
                <div className="bg-forge-card p-3.5 rounded-md border border-forge-border space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-forge-text-muted uppercase">
                    <span>SUPPORTING EVIDENCE ({aiResult.evidenceIds.length})</span>
                    <span className="text-forge-emerald">AUTHENTICATED</span>
                  </div>

                  <div className="space-y-1.5">
                    {aiResult.evidenceIds.map((evId) => {
                      const evd = evidenceService.getEvidenceById(evId);
                      return (
                        <div
                          key={evId}
                          className="p-2 rounded bg-forge-bg border border-forge-border flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-mono text-forge-cyan font-bold text-[11px]">{evId}</div>
                            <div className="text-[10px] text-forge-text-muted truncate max-w-[180px]">
                              {evd ? evd.title : 'Forensic Exhibit'}
                            </div>
                          </div>
                          <button
                            onClick={() => evd && openEvidenceModal(evd)}
                            className="px-2 py-1 rounded bg-forge-card hover:bg-forge-cyan/20 hover:text-forge-cyan text-forge-text-secondary font-mono text-[10px] border border-forge-border transition"
                          >
                            View Evidence
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Graph Path Action Card */}
              {aiResult.pathNodeIds.length > 0 && (
                <div className="bg-forge-card p-3 rounded-md border border-forge-border space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-white uppercase">ACTIVE GRAPH PATH</span>
                    <span className="text-forge-cyan">{aiResult.pathNodeIds.length} Nodes</span>
                  </div>

                  <button
                    onClick={() => navigate('/graph')}
                    className="w-full py-1.5 px-3 rounded bg-forge-cyan/15 hover:bg-forge-cyan/30 text-forge-cyan border border-forge-cyan/40 font-mono text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                  >
                    <span>Show Graph Path</span>
                  </button>
                </div>
              )}

              {/* Specialist Agent Swarm Execution Log */}
              <div className="p-3 bg-forge-card rounded-md border border-forge-border space-y-2 font-mono">
                <div className="text-[10px] text-forge-text-muted uppercase font-bold">
                  SPECIALIST AGENT SWARM EXECUTION
                </div>
                <div className="space-y-2 text-[11px]">
                  {aiResult.agentSteps.map((step, idx) => (
                    <div key={idx} className="p-2 rounded bg-forge-bg border border-forge-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-forge-cyan font-bold">{step.agentName}</span>
                        <span className="text-[9px] text-forge-emerald font-semibold">
                          {step.durationMs}ms
                        </span>
                      </div>
                      <div className="text-[10px] text-forge-text-muted">{step.action}</div>
                      <div className="text-white text-[10px]">{step.finding}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Follow-Ups */}
              {aiResult.suggestedFollowUps && aiResult.suggestedFollowUps.length > 0 && (
                <div className="space-y-1.5 font-mono">
                  <div className="text-[10px] text-forge-text-muted uppercase">SUGGESTED FOLLOW-UPS:</div>
                  <div className="space-y-1">
                    {aiResult.suggestedFollowUps.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => runAiQuery(prompt)}
                        className="w-full text-left p-1.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-[10px] text-forge-text-secondary hover:text-white transition"
                      >
                        ⚡ {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-forge-text-muted space-y-2">
              <Cpu className="w-8 h-8 mx-auto text-forge-border" />
              <p className="text-xs">No active AI query</p>
              <p className="text-[11px]">
                Enter a question in the top command bar to view swarm decomposition.
              </p>
            </div>
          )
        )}
      </div>
    </aside>
    </>
  );
};
