import React from 'react';
import { TrendingUp, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { intelligenceService } from '../../services/intelligenceService';
import { SeverityBadge } from '../common/SeverityBadge';
import { useInvestigationStore } from '../../stores';
import { useNavigate } from 'react-router-dom';

/**
 * PredictiveInsightsPanel — Dashboard "Things to Watch" panel.
 *
 * Generates 2-3 real, data-grounded flags by calling
 * intelligenceService.generatePredictiveInsights() which derives its output
 * entirely from the existing multi-case dataset (no canned text, no external AI).
 *
 * Every insight includes a "Based on: ..." citation that mirrors the pattern
 * already used in the Investigation Search AI results.
 */
export const PredictiveInsightsPanel: React.FC = () => {
  const navigate = useNavigate();
  const { runAiQuery } = useInvestigationStore();

  // Fully deterministic — derived from real data in intelligenceService
  const insights = intelligenceService.generatePredictiveInsights();

  const handleInsightClick = async () => {
    await runAiQuery('What is likely to happen next and what connections should we watch?');
    navigate('/ai');
  };

  return (
    <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
        <div className="flex items-center space-x-2 text-forge-amber font-mono text-xs font-bold">
          <TrendingUp className="w-4 h-4" />
          <span>THINGS TO WATCH</span>
          <span className="px-1.5 py-0.5 rounded bg-forge-amber/15 border border-forge-amber/30 text-forge-amber text-[9px] font-bold tracking-widest">
            AI INSIGHTS
          </span>
        </div>
        <button
          onClick={() => {
            runAiQuery('What is likely to happen next in this investigation?');
            navigate('/ai');
          }}
          className="flex items-center space-x-1 text-[10px] font-mono text-forge-cyan hover:underline"
        >
          <Sparkles className="w-3 h-3" />
          <span>Ask AI</span>
        </button>
      </div>

      <p className="text-[11px] text-forge-text-muted font-sans leading-relaxed">
        Auto-generated flags derived from cross-case data, escalating severity patterns, and
        financial trail analysis. Every flag is traceable to specific evidence.
      </p>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-3.5 bg-forge-bg rounded-lg border border-forge-border hover:border-forge-amber/40 transition space-y-2 text-xs"
          >
            {/* Top row: severity + title */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-3.5 h-3.5 shrink-0 ${
                    insight.severity === 'CRITICAL' ? 'text-forge-rose' : 'text-forge-amber'
                  }`}
                />
                <span className="font-bold text-white text-[13px] leading-tight font-sans">
                  {insight.title}
                </span>
              </div>
              <SeverityBadge level={insight.severity} size="xs" />
            </div>

            {/* Case reference */}
            <div className="font-mono text-[10px] text-forge-cyan font-bold">
              {insight.caseCode} &middot; {insight.caseName}
            </div>

            {/* Plain-language description */}
            <p className="text-[11px] text-forge-text-secondary leading-relaxed font-sans">
              {insight.description}
            </p>

            {/* "Based on" citation — mirrors Investigation Search result pattern */}
            <div className="pt-2 border-t border-forge-border/40">
              <p className="text-[10px] font-mono text-forge-text-muted leading-relaxed">
                {insight.basedOn}
              </p>
            </div>

            {/* Action row */}
            <div className="flex items-center justify-end pt-1">
              <button
                onClick={handleInsightClick}
                className="flex items-center space-x-1 text-[11px] font-mono font-semibold text-forge-cyan hover:underline transition"
              >
                <span>Investigate</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-[10px] text-forge-text-muted font-mono border-t border-forge-border/40 pt-2">
        {insights.length} insight{insights.length !== 1 ? 's' : ''} derived from real cross-case
        patterns &middot; No external AI calls
      </div>
    </div>
  );
};
