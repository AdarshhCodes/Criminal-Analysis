import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Send,
  Sparkles,
  Share2,
  FileSearch,
  ShieldAlert,
  FolderKanban,
  CheckCircle2,
  Trash2,
  Download,
  Terminal,
  Activity,
  User,
  Zap,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { aiAssistantService, AiAssistantMessage, AiCapabilityType } from '../services';

const QUICK_CAPABILITIES = [
  {
    type: 'PATTERN_DETECTION' as AiCapabilityType,
    label: 'Identify Unusual Patterns',
    icon: Activity,
    prompt: 'Identify unusual patterns and anomalies in this investigation',
  },
  {
    type: 'CONNECTION_DISCOVERY' as AiCapabilityType,
    label: 'Highlight Possible Connections',
    icon: Share2,
    prompt: 'Show me the strongest connection between Rajesh Kumar and Amit Sharma',
  },
  {
    type: 'CASE_SUMMARY' as AiCapabilityType,
    label: 'Summarize Current Case',
    icon: FolderKanban,
    prompt: 'Generate an executive case summary of Operation Falcon with legal statutes',
  },
  {
    type: 'PERSON_INVOLVEMENT' as AiCapabilityType,
    label: "Summarize Person's Involvement",
    icon: User,
    prompt: 'Summarize the involvement and threat score of Rajesh Kumar',
  },
  {
    type: 'REPEATED_ENTITIES' as AiCapabilityType,
    label: 'Find Repeated Entities Across Cases',
    icon: Cpu,
    prompt: 'Identify repeated names and entities across multiple cases in the portfolio',
  },
  {
    type: 'TRANSACTION_ANOMALIES' as AiCapabilityType,
    label: 'Detect Unusual Transaction Patterns',
    icon: Zap,
    prompt: 'Detect unusual transaction patterns and Hawala cash smurfing',
  },
  {
    type: 'INVESTIGATION_AREAS' as AiCapabilityType,
    label: 'Suggest Investigation Areas',
    icon: FileSearch,
    prompt: 'Suggest priority investigation areas and actionable next steps',
  },
];

export const AICopilotPage: React.FC = () => {
  const navigate = useNavigate();
  const { cases, currentCase, selectCase, currentInvestigator, openEvidenceModal, selectEntity } =
    useInvestigationStore();

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<AiAssistantMessage[]>([]);
  const [selectedCaseScope, setSelectedCaseScope] = useState<string>(currentCase.id);
  const [expandedTraceIds, setExpandedTraceIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-001',
          sender: 'ASSISTANT',
          timestamp: new Date().toISOString(),
          text:
            `**Welcome to the INTEL-FORGE AI Investigation Assistant.**\n\n` +
            `I am your decision-support copilot grounded in the active investigation dataset (${currentCase.name}). I can analyze transaction velocity, discover multi-hop operational bridges, profile target entities, identify cross-case overlaps, and synthesize court-ready case summaries.\n\n` +
            `*Select a quick capability below or type any investigative inquiry to begin.*`,
          decisionSupportDisclaimer:
            'INVESTIGATIVE DECISION SUPPORT ONLY · NON-AUTHORITATIVE HYPOTHESIS · REQUIRES HUMAN OFFICER VERIFICATION UNDER SECTION 65B IEA',
          suggestedActions: [
            'Identify unusual patterns in active dockets',
            'Highlight possible connections between primary targets',
            'Find repeated entities across cases',
          ],
          followUpQuestions: [
            'Show the strongest connection between Rajesh Kumar and Amit Sharma',
            'Detect unusual transaction patterns in Operation Falcon',
            'What should our next investigative steps be?',
          ],
        },
      ]);
    }
  }, [currentCase, messages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isThinking) return;

    // Add user message
    const userMsg: AiAssistantMessage = {
      id: `USR-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toISOString(),
      text: q,
      decisionSupportDisclaimer: '',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const response = await aiAssistantService.mockGenerateAiInvestigationResponse(
        q,
        selectedCaseScope,
        currentInvestigator.name
      );

      setMessages((prev) => [...prev, response]);
      // Automatically expand trace on the latest response
      setExpandedTraceIds((prev) => new Set([...prev, response.id]));
    } catch {
      // Fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: `ERR-${Date.now()}`,
          sender: 'ASSISTANT',
          timestamp: new Date().toISOString(),
          text: 'Encountered an issue processing query. Please rephrase or try one of the quick capability buttons.',
          decisionSupportDisclaimer:
            'INVESTIGATIVE DECISION SUPPORT ONLY · NON-AUTHORITATIVE HYPOTHESIS',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleTrace = (msgId: string) => {
    setExpandedTraceIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleExportBrief = () => {
    const briefContent = [
      '================================================================================',
      'INTEL-FORGE AI INVESTIGATION ASSISTANT — SESSION BRIEF',
      'NON-AUTHORITATIVE DECISION SUPPORT LOG',
      `CASE SCOPE: ${currentCase.name} (${currentCase.code})`,
      `LEAD INVESTIGATOR: ${currentInvestigator.name} (${currentInvestigator.badge})`,
      `TIMESTAMP: ${new Date().toISOString()}`,
      '================================================================================\n',
      ...messages.map((m) => {
        if (m.sender === 'USER') {
          return `[${m.timestamp.slice(11, 19)}] INVESTIGATOR QUERY:\n${m.text}\n`;
        } else {
          return (
            `[${m.timestamp.slice(11, 19)}] ASSISTANT FINDINGS [${m.capabilityType || 'GENERAL'}] (Confidence: ${m.confidence || 90}%):\n` +
            `${m.text}\n` +
            (m.reasoningSummary ? `REASONING: ${m.reasoningSummary}\n` : '') +
            `DISCLAIMER: ${m.decisionSupportDisclaimer}\n` +
            '--------------------------------------------------------------------------------\n'
          );
        }
      }),
    ].join('\n');

    const blob = new Blob([briefContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI-ASSISTANT-SESSION-${currentCase.code}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-5 select-none font-sans">
      {/* Non-Authoritative Decision Support Warning Banner */}
      <div className="p-3.5 rounded-xl bg-forge-amber/10 border border-forge-amber/30 text-forge-amber flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold tracking-wide block uppercase">
              INVESTIGATIVE DECISION SUPPORT SYSTEM · NOT A LEGAL AUTHORITY
            </span>
            <p className="text-[11px] text-forge-amber/80 font-sans">
              All pattern detections, entity links, and summaries are probabilistic decision-support hypotheses generated from local investigation data. They do not constitute judicial proof and require human officer attestation and Section 65B certification before court presentation.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-2 py-0.5 rounded bg-forge-amber/20 border border-forge-amber/40 text-[10px] font-bold">
            HUMAN-IN-THE-LOOP
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
            <Cpu className="w-4 h-4" />
            <span>AI INVESTIGATION ASSISTANT &amp; SWARM INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Intelligence Decision Support Copilot
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Pattern recognition, cross-case linkage discovery, transaction anomaly detection, and case brief synthesis grounded in local forensic records.
          </p>
        </div>

        {/* Controls: Case Scope & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg glass-card border border-white/[0.08] text-xs font-mono">
            <span className="text-forge-text-muted text-[11px]">CASE SCOPE:</span>
            <select
              value={selectedCaseScope}
              onChange={(e) => {
                setSelectedCaseScope(e.target.value);
                selectCase(e.target.value);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">ALL OPERATIONS (Portfolio)</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.code} · {c.name.slice(0, 26)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportBrief}
            className="px-3 py-1.5 rounded-lg glass-card hover:bg-white/[0.06] border border-white/[0.08] text-forge-text-secondary hover:text-white font-mono text-xs flex items-center space-x-1.5 transition"
            title="Download Plaintext Investigation Session Brief"
          >
            <Download className="w-3.5 h-3.5 text-forge-cyan" />
            <span>EXPORT BRIEF</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg glass-card hover:bg-white/[0.06] border border-white/[0.08] text-forge-text-muted hover:text-forge-rose transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Capability Accelerators */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-forge-cyan" />
          <span>INVESTIGATION CAPABILITY ACCELERATORS (CLICK TO RUN):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {QUICK_CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <button
                key={cap.label}
                onClick={() => handleSendQuery(cap.prompt)}
                disabled={isThinking}
                className="p-2.5 rounded-xl glass-card hover:bg-white/[0.05] border border-white/[0.08] hover:border-forge-cyan/40 text-left transition flex items-start space-x-2 group disabled:opacity-50"
              >
                <div className="p-1.5 rounded-lg bg-forge-cyan/10 border border-forge-cyan/20 text-forge-cyan group-hover:bg-forge-cyan group-hover:text-slate-950 transition shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white group-hover:text-forge-cyan transition leading-tight">
                    {cap.label}
                  </div>
                  <div className="text-[10px] text-forge-text-muted font-mono line-clamp-1">
                    {cap.prompt}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Chat Stream */}
      <div className="p-4 sm:p-6 rounded-2xl glass-card border border-white/[0.08] min-h-[460px] max-h-[640px] overflow-y-auto space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'USER' ? 'items-end' : 'items-start'
              } space-y-1.5`}
            >
              {/* Message Header */}
              <div className="flex items-center space-x-2 text-[10px] font-mono text-forge-text-muted px-1">
                {msg.sender === 'USER' ? (
                  <>
                    <span>{currentInvestigator.name}</span>
                    <span>•</span>
                    <span>{msg.timestamp.slice(11, 19)} IST</span>
                  </>
                ) : (
                  <>
                    <span className="text-forge-cyan font-bold flex items-center space-x-1">
                      <Cpu className="w-3 h-3" />
                      <span>INTEL-FORGE ASSISTANT</span>
                    </span>
                    {msg.capabilityType && (
                      <span className="px-1.5 py-0.2 rounded bg-forge-cyan/10 border border-forge-cyan/30 text-forge-cyan text-[9px] font-bold">
                        {msg.capabilityType}
                      </span>
                    )}
                    {msg.confidence && (
                      <span className="text-forge-emerald font-bold">
                        {msg.confidence}% CONFIDENCE
                      </span>
                    )}
                    <span>•</span>
                    <span>{msg.timestamp.slice(11, 19)} IST</span>
                  </>
                )}
              </div>

              {/* Message Bubble / Card */}
              {msg.sender === 'USER' ? (
                <div className="max-w-2xl p-3.5 rounded-2xl bg-forge-cyan/15 border border-forge-cyan/30 text-white text-xs leading-relaxed font-sans shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full max-w-4xl p-5 rounded-2xl bg-forge-panel/80 border border-white/[0.08] space-y-4 shadow-panel">
                  {/* Text Body */}
                  <div className="text-xs text-forge-text-secondary leading-relaxed font-sans space-y-2 whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Grounded Dataset Citations (Entities & Evidence) */}
                  {msg.citations && (
                    <div className="pt-3 border-t border-white/[0.06] space-y-3">
                      {/* Entity Chips */}
                      {msg.citations.entities.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                            CITED INVESTIGATION ENTITIES ({msg.citations.entities.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.entities.map((ent) => (
                              <button
                                key={ent.id}
                                onClick={() => {
                                  selectEntity(ent);
                                  navigate('/graph');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-forge-bg hover:bg-forge-cyan/15 border border-white/[0.08] hover:border-forge-cyan/40 text-xs font-mono text-white flex items-center space-x-1.5 transition group"
                                title={`Inspect ${ent.name} in Network Graph`}
                              >
                                <span className="font-bold text-forge-cyan">{ent.id}</span>
                                <span>{ent.name}</span>
                                <span className="text-[10px] text-forge-text-muted group-hover:text-forge-cyan font-normal">
                                  ({ent.role || ent.type})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence Citations */}
                      {msg.citations.evidence.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                            SECTION 65B FORENSIC EXHIBITS ({msg.citations.evidence.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.evidence.map((ev) => (
                              <button
                                key={ev.id}
                                onClick={() => openEvidenceModal(ev)}
                                className="px-2.5 py-1 rounded-lg bg-forge-bg hover:bg-forge-emerald/15 border border-white/[0.08] hover:border-forge-emerald/40 text-xs font-mono text-white flex items-center space-x-1.5 transition"
                                title={`View Evidence ${ev.id}: ${ev.title}`}
                              >
                                <FileSearch className="w-3 h-3 text-forge-emerald" />
                                <span className="font-bold text-forge-emerald">{ev.id}</span>
                                <span className="truncate max-w-[200px]">{ev.title}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-forge-emerald/10 text-forge-emerald">
                                  {ev.verificationStatus === 'HUMAN_VERIFIED' ? 'SEALED' : 'PENDING'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specialist Agent Reasoning Trace (Collapsible) */}
                  {msg.agentSteps && msg.agentSteps.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleTrace(msg.id)}
                          className="text-[10px] font-mono text-forge-text-muted hover:text-white uppercase flex items-center space-x-1.5 transition"
                        >
                          <Terminal className="w-3 h-3 text-forge-amber" />
                          <span>
                            SPECIALIST AGENT SWARM EXECUTION TRACE ({msg.agentSteps.length} AGENTS)
                          </span>
                          <span className="text-forge-cyan text-[10px]">
                            {expandedTraceIds.has(msg.id) ? '[HIDE TRACE]' : '[EXPAND TRACE]'}
                          </span>
                        </button>
                      </div>

                      {expandedTraceIds.has(msg.id) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                          {msg.agentSteps.map((step, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-forge-bg/80 border border-white/[0.06] space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-forge-cyan flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3 text-forge-emerald" />
                                  <span>{step.agentName}</span>
                                </span>
                                <span className="text-[10px] text-forge-text-muted">{step.durationMs}ms</span>
                              </div>
                              <p className="text-forge-text-secondary text-[11px] font-sans leading-snug">
                                {step.finding}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommended Next Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <span className="text-[10px] font-mono text-forge-cyan uppercase tracking-wider block">
                        RECOMMENDED INVESTIGATIVE ACTIONS:
                      </span>
                      <ul className="space-y-1 text-xs text-forge-text-secondary font-sans list-disc list-inside">
                        {msg.suggestedActions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Question Chips */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                        SUGGESTED FOLLOW-UP INQUIRIES:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUpQuestions.map((qText, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendQuery(qText)}
                            disabled={isThinking}
                            className="px-2.5 py-1 rounded-lg bg-forge-bg hover:bg-white/[0.06] border border-white/[0.08] text-[11px] text-forge-text-secondary hover:text-white transition flex items-center space-x-1"
                          >
                            <span>⚡</span>
                            <span>{qText}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Non-Authoritative Micro-Notice */}
                  <div className="text-[10px] font-mono text-forge-amber/70 border-t border-white/[0.04] pt-2 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span>{msg.decisionSupportDisclaimer}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking State */}
          {isThinking && (
            <div className="flex items-start space-y-1.5">
              <div className="p-4 rounded-2xl bg-forge-panel border border-forge-cyan/30 text-xs font-mono text-forge-cyan flex items-center space-x-3 shadow-panel">
                <div className="w-4 h-4 border-2 border-forge-cyan border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center space-x-1.5">
                    <span>MULTI-AGENT SWARM REASONING...</span>
                  </div>
                  <div className="text-[10px] text-forge-text-muted">
                    Parsing telecom call bursts, banking smurfing velocities, and cross-case graph paths for {currentCase.code}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery(inputQuery);
        }}
        className="relative"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about unusual patterns, cross-case links, transactions, or target involvement..."
            disabled={isThinking}
            className="w-full bg-forge-panel border border-white/[0.12] rounded-xl pl-4 pr-32 py-3.5 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan font-sans shadow-panel transition"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="absolute right-2 px-4 py-2 rounded-lg bg-forge-cyan hover:bg-forge-cyanLight disabled:opacity-40 text-slate-950 font-mono font-bold text-xs flex items-center space-x-1.5 transition shadow-[0_0_12px_rgba(6,182,212,0.3)] focus:outline-none"
          >
            <span>{isThinking ? 'ANALYZING' : 'INQUIRE'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-forge-text-muted px-1 mt-1.5">
          <span>Grounded in synthetic case records · Not connected to external public LLMs</span>
          <span className="flex items-center space-x-1 text-forge-emerald">
            <CheckCircle2 className="w-3 h-3" />
            <span>Audit Trail Logging Active</span>
          </span>
        </div>
      </form>
    </div>
  );
};
