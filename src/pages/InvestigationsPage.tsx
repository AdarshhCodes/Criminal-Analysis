import { FolderKanban, ArrowRight } from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { Link } from 'react-router-dom';

export const InvestigationsPage: React.FC = () => {
  const { cases, currentCase, selectCase } = useInvestigationStore();

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between border-b border-forge-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs">
            <FolderKanban className="w-4 h-4" />
            <span>CASE REGISTRY</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Active Investigations</h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Operational case files, syndicate targets, and inter-agency intelligence dockets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c) => (
          <div
            key={c.id}
            className={`bg-forge-card border rounded-lg p-5 space-y-3 transition flex flex-col justify-between ${
              c.id === currentCase.id
                ? 'border-forge-cyan/60 shadow-cyan-glow'
                : 'border-forge-border hover:border-forge-borderLight'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-forge-cyan">{c.code}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    c.priority === 'CRITICAL'
                      ? 'bg-forge-rose/20 text-forge-rose border border-forge-rose/40'
                      : 'bg-forge-amber/20 text-forge-amber border border-forge-amber/40'
                  }`}
                >
                  {c.priority}
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-snug">{c.name}</h3>
              <p className="text-xs text-forge-text-secondary line-clamp-3 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="pt-3 border-t border-forge-border/60 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                  <div className="text-white font-bold">{c.metrics.totalEntities}</div>
                  <div className="text-[9px] text-forge-text-muted">ENTITIES</div>
                </div>
                <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                  <div className="text-forge-rose font-bold">{c.metrics.highRiskEntities}</div>
                  <div className="text-[9px] text-forge-text-muted">HIGH RISK</div>
                </div>
                <div className="bg-forge-bg p-1.5 rounded border border-forge-border">
                  <div className="text-forge-emerald font-bold">{c.evidenceCount}</div>
                  <div className="text-[9px] text-forge-text-muted">EVIDENCE</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => selectCase(c.id)}
                  className={`flex-1 py-1.5 rounded font-mono text-xs font-semibold transition ${
                    c.id === currentCase.id
                      ? 'bg-forge-cyan text-slate-900 font-bold'
                      : 'bg-forge-card hover:bg-forge-cardHover text-white border border-forge-border'
                  }`}
                >
                  {c.id === currentCase.id ? 'ACTIVE CASE' : 'LOAD CASE'}
                </button>
                <Link
                  to={`/investigations/${c.id}`}
                  className="p-1.5 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-muted hover:text-white transition"
                  title="View Case Docket"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
