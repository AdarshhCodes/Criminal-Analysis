import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Send,
  Sparkles,
  Share2,
  FileSearch,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { evidenceService } from '../services';

export const AICopilotPage: React.FC = () => {
  const navigate = useNavigate();
  const { aiQuery, aiResult, isAiThinking, runAiQuery, openEvidenceModal } =
    useInvestigationStore();
  const [localQuery, setLocalQuery] = useState(
    aiQuery || 'Show me the strongest connection between Rajesh Kumar and Amit Sharma.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      runAiQuery(localQuery.trim());
    }
  };

  const samplePrompts = [
    'Show me the strongest connection between Rajesh Kumar and Amit Sharma.',
    'Who is connected to this phone within three hops?',
    'Find suspicious transactions involving these suspects.',
    'Why is this person considered high risk?',
    'Show relationships established after January 2025.',
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6 select-none font-mono">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-forge-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan text-xs">
            <Cpu className="w-4 h-4" />
            <span>AUTONOMOUS MULTI-AGENT INVESTIGATION REASONING</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-sans">
            AI Copilot &amp; Swarm Architecture
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5 font-sans">
            Grounded local intelligence: Orchestrator, Telecom, Financial, Vision, and Graph specialist agents with mathematical evidence verification.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="ASK INTEL-FORGE ABOUT THIS INVESTIGATION..."
            className="w-full bg-forge-card border border-forge-border rounded-lg pl-4 pr-28 py-3 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan font-mono"
          />
          <button
            type="submit"
            disabled={isAiThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded bg-forge-cyan hover:bg-forge-cyanLight text-slate-900 font-mono font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            {isAiThinking ? <span>ANALYZING...</span> : <span>INQUIRE</span>}
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-forge-text-muted uppercase">RECOMMENDED CASE QUERIES:</div>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setLocalQuery(prompt);
                  runAiQuery(prompt);
                }}
                className="px-2.5 py-1 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-secondary hover:text-white transition"
              >
                ⚡ {prompt}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* AI Swarm Response Card */}
      {aiResult ? (
        <div className="space-y-5">
          {/* Grounded Answer Card */}
          <div className="bg-forge-card border border-forge-cyan/40 rounded-lg p-5 space-y-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forge-border/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-forge-cyan uppercase">
                  Grounded Investigation Answer
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-forge-emerald/20 text-forge-emerald font-bold border border-forge-emerald/40">
                  {aiResult.confidence}% CONFIDENCE
                </span>
                <span className="px-2 py-0.5 rounded bg-forge-bg text-forge-text-muted border border-forge-border text-[10px]">
                  {aiResult.verificationStatus}
                </span>
              </div>
            </div>

            <div className="text-xs text-forge-text-muted">
              <strong>QUERY:</strong> &ldquo;{aiResult.query}&rdquo;
            </div>

            <p className="text-sm text-white font-medium leading-relaxed font-sans bg-forge-bg p-3 rounded border border-forge-border">
              {aiResult.answer}
            </p>

            <div className="pt-2 border-t border-forge-border/60 text-xs text-forge-text-secondary leading-relaxed">
              <strong className="text-forge-text-muted block text-[10px] uppercase font-bold">
                REASONING SUMMARY:
              </strong>
              <p className="font-sans text-xs text-forge-text-primary mt-0.5">
                {aiResult.reasoningSummary}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-forge-border/40">
              <div className="flex items-center space-x-2 text-xs">
                {aiResult.pathNodeIds.length > 0 && (
                  <button
                    onClick={() => navigate('/graph')}
                    className="px-3 py-1.5 rounded bg-forge-cyan hover:bg-forge-cyanLight text-black font-bold flex items-center space-x-1.5 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Show Graph Path ({aiResult.pathNodeIds.length} Nodes)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Supporting Evidence References Grid */}
          {aiResult.evidenceIds.length > 0 && (
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase text-forge-text-muted font-bold flex items-center space-x-1.5">
                  <FileSearch className="w-3.5 h-3.5 text-forge-cyan" />
                  <span>SUPPORTING EVIDENCE CITATIONS ({aiResult.evidenceIds.length})</span>
                </h3>
                <span className="text-[10px] text-forge-emerald">SECTION 65B READY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {aiResult.evidenceIds.map((evId) => {
                  const exhibit = evidenceService.getEvidenceById(evId);
                  return (
                    <div
                      key={evId}
                      className="p-3 bg-forge-bg rounded border border-forge-border hover:border-forge-cyan/40 transition space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-forge-cyan">{evId}</span>
                          <span className="px-1.5 py-0.2 rounded bg-forge-card text-forge-text-muted">
                            {exhibit ? exhibit.type : 'EXHIBIT'}
                          </span>
                        </div>
                        <h4 className="text-xs font-sans font-bold text-white mt-1 line-clamp-1">
                          {exhibit ? exhibit.title : 'Forensic Record'}
                        </h4>
                        <p className="text-[10px] text-forge-text-muted mt-0.5 line-clamp-2">
                          {exhibit ? exhibit.description : 'Archived evidence item.'}
                        </p>
                      </div>

                      <button
                        onClick={() => exhibit && openEvidenceModal(exhibit)}
                        className="w-full py-1 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-cyan text-[10px] font-bold transition flex items-center justify-center space-x-1"
                      >
                        <span>View Evidence</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Specialist Agents Execution Grid */}
          <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
            <h3 className="text-xs uppercase text-forge-text-muted font-bold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-forge-amber" />
              <span>Specialist Agent Swarm Execution Trace</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiResult.agentSteps.map((step, idx) => (
                <div key={idx} className="p-3 bg-forge-bg rounded border border-forge-border space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-forge-cyan">{step.agentName}</span>
                    <span className="text-forge-emerald text-[10px]">{step.durationMs}ms</span>
                  </div>
                  <div className="text-[11px] text-forge-text-muted">{step.action}</div>
                  <div className="text-[11px] text-white pt-1 font-sans">{step.finding}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-forge-text-muted bg-forge-card/40 border border-forge-border rounded-lg">
          <Cpu className="w-10 h-10 mx-auto mb-3 text-forge-border" />
          <h3 className="text-sm font-bold text-white font-sans">Awaiting Case Inquiry</h3>
          <p className="text-xs mt-1 max-w-md mx-auto font-sans">
            Ask any question above or click one of the recommended case queries to execute multi-agent analysis.
          </p>
        </div>
      )}
    </div>
  );
};
