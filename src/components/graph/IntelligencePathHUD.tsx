import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileSearch,
  X,
  Share2,
  ChevronDown,
  Layers,
  Zap,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { investigationService, evidenceService } from '../../services';

export const IntelligencePathHUD: React.FC = () => {
  const {
    intelligencePathData,
    clearGraphHighlights,
    openEvidenceModal,
    selectEntity,
    traceIntelligencePath,
    verifyRelationshipAction,
    currentCase,
  } = useInvestigationStore();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [sourceId, setSourceId] = useState('IF-P-001'); // Rajesh Kumar
  const [targetId, setTargetId] = useState('IF-P-007'); // Amit Sharma

  const entities = investigationService.getEntities(currentCase.id);
  const personsAndOrgs = entities.filter((e) =>
    ['PERSON', 'ORGANIZATION', 'PHONE', 'BANK_ACCOUNT'].includes(e.type)
  );

  const presets = [
    { label: 'Rajesh Kumar ➔ Amit Sharma (Hawala Core)', s: 'IF-P-001', t: 'IF-P-007' },
    { label: 'Rajesh Kumar ➔ Mohd. Tariq (Dubai Channel)', s: 'IF-P-001', t: 'IF-P-033' },
    { label: 'Amit Sharma ➔ Suresh Raina (Cash Handover)', s: 'IF-P-007', t: 'IF-P-022' },
    { label: 'Pooja Verma ➔ Vikram Malhotra (Burner Conduit)', s: 'IF-P-018', t: 'IF-P-012' },
  ];

  const handleRunTrace = (sId: string, tId: string) => {
    traceIntelligencePath(sId, tId);
    setIsSelectorOpen(false);
  };

  const handleVerifyBridge = async () => {
    if (intelligencePathData?.edgeIds && intelligencePathData.edgeIds.length > 0) {
      // Verify the central bridge edge (or first AI suggested edge)
      const edgeToVerify = intelligencePathData.edgeIds.find((id) => {
        const rel = investigationService.getRelationshipById(id);
        return rel && rel.verificationStatus !== 'HUMAN_VERIFIED';
      }) || intelligencePathData.edgeIds[0];

      await verifyRelationshipAction(edgeToVerify);
    }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl pointer-events-auto">
      {/* Path HUD Bar */}
      {intelligencePathData ? (
        <div className="bg-forge-panel/95 backdrop-blur-md border border-forge-cyan/50 rounded-xl p-3.5 shadow-2xl space-y-2.5 animate-in fade-in slide-in-from-top-4 duration-300 font-mono text-xs">
          {/* Top Metric Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forge-border/60 pb-2">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-white tracking-wide text-xs">
                  INTELLIGENCE PATH DISCOVERED
                </span>
                <span className="text-[10px] text-forge-cyan ml-2">
                  [SIGNATURE MULTI-HOP CORRELATION]
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-forge-card border border-forge-border text-white text-[11px] font-bold">
                {intelligencePathData.hopCount} HOPS
              </span>
              <span className="px-2 py-0.5 rounded bg-forge-card border border-forge-border text-forge-cyan text-[11px] font-bold">
                {intelligencePathData.evidenceCount} EVIDENCE SOURCES
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-forge-emerald text-[11px] font-bold">
                {intelligencePathData.overallConfidence}% CONFIDENCE
              </span>

              <button
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="p-1 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-muted hover:text-white transition"
                title="Change Source / Target"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearGraphHighlights}
                className="p-1 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-muted hover:text-rose-400 transition"
                title="Dismiss Path Highlight"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Node Progression Sequence Ribbon */}
          <div className="overflow-x-auto pb-1">
            <div className="flex items-center space-x-2 min-w-max text-[11px]">
              {intelligencePathData.nodeIds.map((nodeId, idx) => {
                const ent = investigationService.getEntityById(nodeId);
                const isLast = idx === intelligencePathData.nodeIds.length - 1;

                return (
                  <React.Fragment key={nodeId}>
                    <button
                      onClick={() => ent && selectEntity(ent)}
                      className="px-2.5 py-1 rounded bg-forge-bg hover:bg-forge-cyan/20 hover:text-forge-cyan border border-forge-border text-white font-semibold transition flex items-center space-x-1.5 shadow-sm"
                      title={ent ? `${ent.name} (${ent.type})` : nodeId}
                    >
                      <span className="text-[9px] text-forge-text-muted uppercase">
                        {ent?.type || 'ENTITY'}:
                      </span>
                      <span>{ent?.name || nodeId}</span>
                    </button>
                    {!isLast && (
                      <div className="flex items-center space-x-1 text-forge-cyan">
                        <span className="w-2 h-[1px] bg-forge-cyan/60" />
                        <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Bottom Narrative & Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-forge-border/40 text-[11px]">
            {/* Supporting Evidence Chips */}
            <div className="flex flex-wrap items-center gap-1.5 font-sans">
              <span className="text-[10px] font-mono text-forge-text-muted font-bold">
                EVIDENCE CITATIONS:
              </span>
              {intelligencePathData.evidenceIds.map((evId) => {
                const exhibit = evidenceService.getEvidenceById(evId);
                return (
                  <button
                    key={evId}
                    onClick={() => exhibit && openEvidenceModal(exhibit)}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-forge-cyan/15 hover:bg-forge-cyan/30 border border-forge-cyan/40 text-forge-cyan font-mono text-[10px] font-bold transition"
                  >
                    <FileSearch className="w-3 h-3" />
                    <span>{evId}</span>
                  </button>
                );
              })}
            </div>

            {/* Verification Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleVerifyBridge}
                className="px-3 py-1 rounded bg-forge-emerald hover:bg-emerald-400 text-black font-bold font-mono text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFY BRIDGE CONNECTION</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Minimized Launcher Button when no path is selected */
        <div className="flex justify-center">
          <button
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="px-4 py-2 rounded-full bg-forge-card/95 hover:bg-forge-card border border-forge-cyan/40 text-forge-cyan hover:text-white font-mono text-xs flex items-center space-x-2 shadow-xl backdrop-blur transition"
          >
            <Zap className="w-4 h-4 text-forge-cyan fill-forge-cyan/30" />
            <span className="font-bold">TRACE INTELLIGENCE PATH (PRIMARY NEXUS)</span>
            <ChevronDown className="w-3.5 h-3.5 text-forge-text-muted" />
          </button>
        </div>
      )}

      {/* Selector Drawer for custom Source & Target */}
      {isSelectorOpen && (
        <div className="mt-2 p-4 bg-forge-card/95 backdrop-blur border border-forge-border rounded-xl shadow-2xl font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-forge-border pb-2">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-forge-cyan" />
              <span>Select Entities for Multi-Hop Intelligence Path</span>
            </span>
            <button
              onClick={() => setIsSelectorOpen(false)}
              className="p-1 rounded text-forge-text-muted hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-forge-text-muted uppercase">Recommended Demo Pathways:</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleRunTrace(p.s, p.t)}
                  className="px-2.5 py-1 rounded bg-forge-bg hover:bg-forge-cyan/20 hover:text-forge-cyan border border-forge-border text-forge-text-secondary text-[10px] transition"
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] text-forge-text-muted block mb-1">SOURCE ENTITY (ORIGIN)</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full bg-forge-bg border border-forge-border rounded p-2 text-white text-xs focus:outline-none focus:border-forge-cyan"
              >
                {personsAndOrgs.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.type}) - {e.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-forge-text-muted block mb-1">TARGET ENTITY (DESTINATION)</label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-forge-bg border border-forge-border rounded p-2 text-white text-xs focus:outline-none focus:border-forge-cyan"
              >
                {personsAndOrgs.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.type}) - {e.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => handleRunTrace(sourceId, targetId)}
              className="px-4 py-1.5 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Trace Strongest Connection</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
