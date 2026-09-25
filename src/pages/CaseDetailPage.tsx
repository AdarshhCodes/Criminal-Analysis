import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useInvestigationStore } from '../stores';

export const CaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { cases, selectCase } = useInvestigationStore();

  const caseData = cases.find((c) => c.id === caseId || c.code === caseId) || cases[0];

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center space-x-3 text-xs font-mono text-forge-text-muted">
        <Link to="/investigations" className="flex items-center space-x-1 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ALL INVESTIGATIONS</span>
        </Link>
        <span>/</span>
        <span className="text-forge-cyan">{caseData.code}</span>
      </div>

      <div className="bg-forge-card border border-forge-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-forge-cyan font-bold">{caseData.code}</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-forge-rose/20 text-forge-rose font-bold">
            {caseData.priority} PRIORITY
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white">{caseData.name}</h1>
        <p className="text-sm text-forge-text-secondary leading-relaxed">{caseData.description}</p>

        <div className="pt-4 border-t border-forge-border grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <div className="text-forge-text-muted text-[10px]">LEAD OFFICER</div>
            <div className="text-white font-medium">{caseData.leadInvestigator}</div>
          </div>
          <div>
            <div className="text-forge-text-muted text-[10px]">ASSIGNED UNIT</div>
            <div className="text-white font-medium">{caseData.assignedUnit}</div>
          </div>
          <div>
            <div className="text-forge-text-muted text-[10px]">TOTAL TARGETS</div>
            <div className="text-forge-cyan font-bold">{caseData.metrics.totalEntities} entities</div>
          </div>
          <div>
            <div className="text-forge-text-muted text-[10px]">EVIDENCE VAULT</div>
            <div className="text-forge-emerald font-bold">{caseData.evidenceCount} verified files</div>
          </div>
        </div>

        <div className="pt-4 flex items-center space-x-3">
          <button
            onClick={() => selectCase(caseData.id)}
            className="px-4 py-2 rounded bg-forge-cyan hover:bg-forge-cyan/80 text-slate-900 font-mono font-bold text-xs transition"
          >
            SET AS ACTIVE WORKSPACE CASE
          </button>
          <Link
            to="/graph"
            className="px-4 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white font-mono text-xs transition"
          >
            OPEN IN NETWORK GRAPH
          </Link>
        </div>
      </div>
    </div>
  );
};
