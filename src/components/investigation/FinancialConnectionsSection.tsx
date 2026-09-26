import React from 'react';
import {
  Landmark,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Network,
} from 'lucide-react';
import { investigationService } from '../../services';

interface FinancialConnectionsSectionProps {
  onInspectInGraph: (entityId: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const FinancialConnectionsSection: React.FC<FinancialConnectionsSectionProps> = ({
  onInspectInGraph,
  onSelectCase,
}) => {
  const financialTrails = investigationService.getFinancialConnectionsList();

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Financial Intelligence Header Banner */}
      <div className="glass-card rounded-xl p-5 border border-amber-500/25 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Financial &amp; Transaction Linkages
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                  Multi-Hop Hawala &amp; Asset Tracing
                </span>
              </div>
              <p className="text-xs text-forge-text-muted mt-0.5">
                Mapping hidden proxy pathways connecting money transfers, bank/UPI accounts, shell business entities, and acquired real properties.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <div className="text-right">
              <div className="text-[10px] text-forge-text-muted">TRACKED PORTFOLIO VOLUME</div>
              <div className="text-sm font-bold text-forge-amber">₹202.00 Crore</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Connection Trails List */}
      <div className="space-y-4">
        {financialTrails.map((trail) => {
          const isConfirmed = trail.status === 'CONFIRMED';
          return (
            <div
              key={trail.id}
              className="glass-card p-5 rounded-xl border border-white/[0.08] hover:border-amber-400/50 hover:bg-white/[0.02] transition space-y-4"
            >
              {/* Header Row: ID, Transfer Type, Amount, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-white bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                    {trail.id}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">
                    {trail.transferType}
                  </span>
                  <span className="text-xs font-mono text-forge-text-muted">&middot;</span>
                  <button
                    onClick={() => onSelectCase(trail.linkedCaseId)}
                    className="text-xs font-mono text-forge-cyan hover:underline hover:text-white transition"
                    title="Switch to this operation"
                  >
                    {trail.connectedCase}
                  </button>
                </div>

                <div className="flex items-center space-x-3 font-mono">
                  <div className="text-right">
                    <span className="text-sm font-bold text-forge-amber font-mono">
                      {trail.amount}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold border flex items-center space-x-1 ${
                      isConfirmed
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    <span>{trail.status}</span>
                  </span>
                </div>
              </div>

              {/* Visual Multi-Hop Trail Flow */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider">
                  DISCOVERED TRANSACTION &amp; ASSET CONDUIT PATH:
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  {trail.flowPath.map((step, idx) => {
                    const isLast = idx === trail.flowPath.length - 1;
                    const isFirst = idx === 0;
                    return (
                      <React.Fragment key={idx}>
                        <div
                          className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center space-x-1.5 ${
                            isFirst
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 font-bold'
                              : isLast
                              ? 'bg-forge-cyan/15 text-forge-cyan border-forge-cyan/30 font-bold'
                              : 'bg-white/[0.03] text-white border-white/[0.08]'
                          }`}
                        >
                          <span>{step}</span>
                        </div>
                        {!isLast && (
                          <ArrowRight className="w-3.5 h-3.5 text-forge-text-muted shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Breakdown Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-forge-bg/60 border border-white/[0.04] text-xs font-mono">
                <div>
                  <div className="text-[10px] text-forge-text-muted">SOURCE ACTOR:</div>
                  <div className="text-white font-semibold mt-0.5">{trail.sourceEntity}</div>
                  <div className="text-[10px] text-forge-text-muted">{trail.sourceType}</div>
                </div>

                <div>
                  <div className="text-[10px] text-forge-text-muted">INTERMEDIARY ENTITY / BANK:</div>
                  <div className="text-white font-semibold mt-0.5">{trail.targetEntity}</div>
                  <div className="text-[10px] text-forge-text-muted">{trail.targetType}</div>
                </div>

                <div>
                  <div className="text-[10px] text-forge-text-muted">ACQUIRED PROPERTY / CONDUIT:</div>
                  <div className="text-forge-amber font-semibold mt-0.5 truncate">{trail.propertyOrAsset}</div>
                  <div className="text-[10px] text-forge-text-muted">Evidence: {trail.evidenceId}</div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between text-xs font-mono text-forge-text-muted pt-1">
                <span>Timestamp: {trail.timestamp}</span>

                <button
                  onClick={() => onInspectInGraph(trail.sourceEntity)}
                  className="px-3 py-1 rounded bg-forge-card hover:bg-forge-panel border border-white/[0.08] hover:border-forge-cyan text-forge-cyan font-bold transition flex items-center space-x-1"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Trace Path in Graph</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
