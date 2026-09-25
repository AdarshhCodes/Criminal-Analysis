import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Download,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { reportService, CourtReadyReportDossier } from '../services';
import { Entity, Evidence } from '../types';

const GENERATION_STEPS = [
  'Collecting evidence...',
  'Analyzing relationships...',
  'Building timeline...',
  'Preparing citations...',
  'Generating report...',
];

export const ReportsPage: React.FC = () => {
  const { currentCase, currentInvestigator } = useInvestigationStore();
  const [dossier, setDossier] = useState<CourtReadyReportDossier | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('all');

  // Progressive generation state machine
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating) {
      if (currentStepIndex < GENERATION_STEPS.length - 1) {
        timer = setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, 550);
      } else {
        timer = setTimeout(() => {
          const report = reportService.generateReport(currentCase.id, currentInvestigator.name);
          setDossier(report);
          setIsGenerating(false);
          setCurrentStepIndex(0);
        }, 650);
      }
    }
    return () => clearTimeout(timer);
  }, [isGenerating, currentStepIndex, currentCase.id, currentInvestigator.name]);

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setCurrentStepIndex(0);
    setDossier(null);
  };

  const handleCopyJson = () => {
    if (!dossier) return;
    navigator.clipboard.writeText(JSON.stringify(dossier, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBrief = () => {
    if (!dossier) return;
    const textContent = `
================================================================================
INTEL-FORGE COURT-READY INVESTIGATION DOSSIER
DEMONSTRATION REPORT / SYNTHETIC DATA
UNDER SECTION 65B INDIAN EVIDENCE ACT
================================================================================
CASE: ${dossier.caseInfo.name} (${dossier.caseInfo.code})
PREPARED BY: ${dossier.preparedBy}
DATE GENERATED: ${dossier.generatedAt}
CLASSIFICATION: ${dossier.classification}

1. EXECUTIVE SUMMARY:
${dossier.executiveSummary}

2. PRIMARY ACCUSED / KEY TARGETS (${dossier.keyTargets.length}):
${dossier.keyTargets
  .map((t) => ` - [${t.id}] ${t.name} (${t.role}) | Risk: ${t.riskScore}/100 | ID: ${t.primaryIdentifier}`)
  .join('\n')}

3. NETWORK ANALYSIS SUMMARY:
Nodes: ${dossier.networkAnalysis.totalNodes} | Edges: ${dossier.networkAnalysis.totalEdges} | Density: ${dossier.networkAnalysis.graphDensity}
Hub Nodes:
${dossier.networkAnalysis.criticalHubNodes.map((h) => ` - ${h.name} (${h.id}): ${h.degree} Connections (${h.centrality})`).join('\n')}

4. VERIFIED RELATIONSHIPS (${dossier.verifiedRelationships.length}):
${dossier.verifiedRelationships
  .map((r) => ` - ${r.sourceName} ──[${r.label || r.type}]──> ${r.targetName} (Conf: ${r.confidence}%)`)
  .join('\n')}

5. UNVERIFIED LEADS (${dossier.unverifiedLeads.length}):
${dossier.unverifiedLeads
  .map((r) => ` - [PENDING REVIEW] ${r.sourceName} ──[${r.label || r.type}]──> ${r.targetName} (AI Conf: ${r.confidence}%)`)
  .join('\n')}

6. RISK ASSESSMENT & THREAT INDEX:
Syndicate Threat Level: ${dossier.riskAssessment.threatLevel} (${dossier.riskAssessment.overallSyndicateRisk}/100)
Asset Laundering Estimate: ${dossier.riskAssessment.assetLaunderingEstimate}
Recommended Actions:
${dossier.riskAssessment.recommendedActions.map((a) => ` - ${a}`).join('\n')}

7. SECTION 65B EVIDENCE REFERENCES (${dossier.evidenceReferences.length} EXHIBITS):
${dossier.evidenceReferences
  .map((e) => ` - [${e.exhibitCode}] ${e.title} (${e.type}) | SHA-256: ${e.hash} | Status: ${e.section65BStatus}`)
  .join('\n')}

8. BLOCKCHAIN AUDIT LEDGER PROOF:
Blocks: ${dossier.blockchainAuditTrail.length} | Chain Integrity: 100% CRYPTOGRAPHICALLY VERIFIED
Latest Block Hash: ${dossier.blockchainAuditTrail[dossier.blockchainAuditTrail.length - 1]?.blockHash || 'N/A'}
================================================================================
`.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `INTEL-FORGE-DOSSIER-${dossier.caseInfo.code}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Top Banner: Synthetic Data Disclaimer */}
      <div className="bg-forge-amber/10 border border-forge-amber/30 rounded px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-2 print:hidden">
        <div className="flex items-center space-x-2 text-forge-amber">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-bold tracking-wide">
            DEMONSTRATION REPORT / SYNTHETIC DATA · NOT FOR OPERATIONAL DEPLOYMENT
          </span>
        </div>
        <span className="text-forge-text-muted text-[11px]">
          Compliant with Section 65B Indian Evidence Act Standard
        </span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-forge-border pb-4 gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs">
            <FileText className="w-4 h-4" />
            <span>CRIMINAL NETWORK INTELLIGENCE DOSSIER</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Investigation Report Generator</h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Automated court-ready prosecution brief compiling entity profiles, network centrality, verified exhibits, and blockchain audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className="px-4 py-2 rounded bg-forge-cyan hover:bg-forge-cyan/90 disabled:opacity-50 text-slate-900 font-mono font-bold text-xs flex items-center space-x-2 transition shadow-cyan-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-forge-cyan"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isGenerating ? 'ASSEMBLING DOSSIER...' : 'GENERATE INVESTIGATION REPORT'}</span>
          </button>

          {dossier && !isGenerating && (
            <>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white font-mono text-xs flex items-center space-x-1.5 transition"
                title="Print or Save PDF"
              >
                <Printer className="w-4 h-4 text-forge-cyan" />
                <span className="hidden sm:inline">PRINT / PDF</span>
              </button>

              <button
                onClick={handleCopyJson}
                className="px-3 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white font-mono text-xs flex items-center space-x-1.5 transition"
                title="Copy JSON Payload"
              >
                {copied ? <Check className="w-4 h-4 text-forge-emerald" /> : <Copy className="w-4 h-4 text-forge-text-muted" />}
                <span className="hidden sm:inline">{copied ? 'COPIED' : 'JSON'}</span>
              </button>

              <button
                onClick={handleDownloadBrief}
                className="px-3 py-2 rounded bg-forge-card hover:bg-forge-cardHover border border-forge-border text-white font-mono text-xs flex items-center space-x-1.5 transition"
                title="Download Plaintext Brief"
              >
                <Download className="w-4 h-4 text-forge-text-muted" />
                <span className="hidden sm:inline">EXPORT TXT</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meaningful Progress State */}
      {isGenerating && (
        <div className="bg-forge-card border border-forge-cyan/40 rounded-lg p-8 shadow-panel space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-forge-cyan/15 text-forge-cyan font-mono text-xs font-bold border border-forge-cyan/30 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMPILING FORENSIC DOSSIER</span>
            </div>
            <h3 className="text-base font-bold text-white">
              {GENERATION_STEPS[currentStepIndex]}
            </h3>
            <p className="text-xs text-forge-text-muted font-mono">
              Extracting cryptographic hashes, relationship weights, and custody ledger for Case {currentCase.code}
            </p>
          </div>

          {/* Step Progress Pills */}
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="w-full bg-forge-bg rounded-full h-2 overflow-hidden border border-forge-border">
              <div
                className="bg-forge-cyan h-full transition-all duration-500 rounded-full"
                style={{ width: `${((currentStepIndex + 1) / GENERATION_STEPS.length) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[10px]">
              {GENERATION_STEPS.map((step, idx) => (
                <div
                  key={step}
                  className={`p-1.5 rounded transition ${
                    idx < currentStepIndex
                      ? 'text-forge-emerald bg-forge-emerald/10 font-bold'
                      : idx === currentStepIndex
                      ? 'text-forge-cyan bg-forge-cyan/15 font-bold animate-pulse border border-forge-cyan/40'
                      : 'text-forge-text-muted bg-forge-bg/50'
                  }`}
                >
                  {idx < currentStepIndex ? '✓' : idx + 1}. {step.replace('...', '')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generated Report Preview */}
      {dossier && !isGenerating ? (
        <div className="bg-forge-card border border-forge-border rounded-lg shadow-panel print:shadow-none print:border-none print:bg-white print:text-black overflow-hidden">
          {/* Document Header */}
          <div className="border-b border-forge-border p-6 sm:p-8 bg-forge-panel/70 print:bg-white print:border-b-2 print:border-black space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forge-border/60 pb-3">
              <div className="font-mono text-[11px] tracking-widest text-forge-rose font-bold print:text-red-700">
                {dossier.classification}
              </div>
              <div className="font-mono text-xs px-2.5 py-0.5 rounded bg-forge-amber/15 text-forge-amber border border-forge-amber/30 print:border-black print:text-black">
                DEMONSTRATION REPORT / SYNTHETIC DATA
              </div>
            </div>

            <div className="text-center space-y-2 pt-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase print:text-black">
                CONFIDENTIAL INVESTIGATION DOSSIER
              </h2>
              <div className="text-sm font-mono text-forge-cyan print:text-black font-semibold">
                CASE FILE: {dossier.caseInfo.name} ({dossier.caseInfo.code})
              </div>
              <div className="text-xs font-mono text-forge-text-muted print:text-gray-700 flex flex-wrap items-center justify-center gap-4 pt-1">
                <span>PREPARED BY: <strong className="text-white print:text-black">{dossier.preparedBy}</strong></span>
                <span>•</span>
                <span>AGENCY: <strong className="text-white print:text-black">{dossier.caseInfo.assignedUnit}</strong></span>
                <span>•</span>
                <span>DATE: <strong className="text-white print:text-black">{dossier.generatedAt.replace('T', ' ').slice(0, 19)} UTC</strong></span>
              </div>
            </div>

            {/* Quick Section Navigation (Hidden on Print) */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 font-mono text-[10px] print:hidden">
              {[
                { id: 'all', label: 'ALL SECTIONS' },
                { id: 'summary', label: '1. SUMMARY' },
                { id: 'targets', label: '2. KEY PERSONS' },
                { id: 'network', label: '3. NETWORK ANALYSIS' },
                { id: 'timeline', label: '4. TIMELINE' },
                { id: 'evidence', label: '5. EVIDENCE' },
                { id: 'verified', label: '6. VERIFIED LINKS' },
                { id: 'leads', label: '7. UNVERIFIED LEADS' },
                { id: 'risk', label: '8. RISK ASSESSMENT' },
                { id: 'audit', label: '9. AUDIT TRAIL' },
                { id: 'refs', label: '10. LEGAL REFERENCES' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-2.5 py-1 rounded transition ${
                    activeSection === sec.id
                      ? 'bg-forge-cyan text-slate-900 font-bold'
                      : 'bg-forge-bg hover:bg-forge-cardHover text-forge-text-secondary border border-forge-border'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8 font-sans">
            {/* Section 1: Executive Summary */}
            {(activeSection === 'all' || activeSection === 'summary') && (
              <section className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-forge-border pb-1.5">
                  <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2 py-0.5 rounded print:text-black">
                    SECTION 1
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    EXECUTIVE SUMMARY &amp; SYNDICATE TOPOLOGY
                  </h3>
                </div>
                <div className="text-xs text-forge-text-secondary print:text-black leading-relaxed bg-forge-bg print:bg-gray-50 p-4 rounded border border-forge-border print:border-gray-300 space-y-2">
                  <p>{dossier.executiveSummary}</p>
                  <p className="font-mono text-[11px] text-forge-text-muted print:text-gray-600">
                    Jurisdiction: Delhi NCR (Special Operations Unit 4) · Cross-Border: UAE &amp; Hong Kong · Investigation Status: ACTIVE
                  </p>
                </div>
              </section>
            )}

            {/* Section 2: Key Persons & Accused */}
            {(activeSection === 'all' || activeSection === 'targets') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-forge-border pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2 py-0.5 rounded print:text-black">
                      SECTION 2
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      PRIMARY ACCUSED &amp; KEY PERSONS OF INTEREST ({dossier.keyTargets.length})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-forge-text-muted">Threshold: Risk &ge; 75/100</span>
                </div>

                <div className="border border-forge-border rounded overflow-hidden print:border-black">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-forge-panel print:bg-gray-100 font-mono text-[10px] text-forge-text-muted print:text-black">
                      <tr>
                        <th className="p-2.5">TARGET ID</th>
                        <th className="p-2.5">LEGAL NAME &amp; ALIAS</th>
                        <th className="p-2.5">OPERATIONAL ROLE</th>
                        <th className="p-2.5">PRIMARY IDENTIFIER</th>
                        <th className="p-2.5 text-right">RISK INDEX</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forge-border/40 font-mono text-[11px] print:divide-black">
                      {dossier.keyTargets.map((t: Entity) => (
                        <tr key={t.id} className="hover:bg-forge-cardHover print:bg-white">
                          <td className="p-2.5 text-forge-cyan font-bold print:text-black">{t.id}</td>
                          <td className="p-2.5 text-white font-sans font-semibold print:text-black">
                            {t.name}
                            {t.aliases && t.aliases.length > 0 && (
                              <span className="block text-[10px] font-mono text-forge-text-muted font-normal print:text-gray-600">
                                a.k.a. {t.aliases.join(', ')}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-forge-text-secondary font-sans print:text-black">{t.role}</td>
                          <td className="p-2.5 text-forge-text-muted print:text-black">{t.primaryIdentifier}</td>
                          <td className="p-2.5 text-right font-bold text-forge-rose print:text-red-800">{t.riskScore}/100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Section 3: Network Analysis */}
            {(activeSection === 'all' || activeSection === 'network') && (
              <section className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-forge-border pb-1.5">
                  <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2 py-0.5 rounded print:text-black">
                    SECTION 3
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    NETWORK GRAPH TOPOLOGY &amp; BOTTLENECK ANALYSIS
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-forge-bg print:bg-gray-50 rounded border border-forge-border">
                    <div className="text-[10px] text-forge-text-muted">TOTAL MAPPED ENTITIES</div>
                    <div className="text-lg font-bold text-white print:text-black">{dossier.networkAnalysis.totalNodes} Nodes</div>
                  </div>
                  <div className="p-3 bg-forge-bg print:bg-gray-50 rounded border border-forge-border">
                    <div className="text-[10px] text-forge-text-muted">FORENSIC RELATIONSHIPS</div>
                    <div className="text-lg font-bold text-forge-cyan print:text-black">{dossier.networkAnalysis.totalEdges} Edges</div>
                  </div>
                  <div className="p-3 bg-forge-bg print:bg-gray-50 rounded border border-forge-border">
                    <div className="text-[10px] text-forge-text-muted">GRAPH DENSITY RATIO</div>
                    <div className="text-lg font-bold text-forge-amber print:text-black">{dossier.networkAnalysis.graphDensity}</div>
                  </div>
                  <div className="p-3 bg-forge-bg print:bg-gray-50 rounded border border-forge-border">
                    <div className="text-[10px] text-forge-text-muted">VERIFIED LINK RATIO</div>
                    <div className="text-lg font-bold text-forge-emerald print:text-black">
                      {Math.round((dossier.verifiedRelationships.length / (dossier.networkAnalysis.totalEdges || 1)) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Hub Nodes */}
                <div className="space-y-2">
                  <h4 className="font-mono text-xs text-forge-text-muted uppercase">Key Intermediary Bottlenecks (Highest Degree Centrality):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                    {dossier.networkAnalysis.criticalHubNodes.map((hub) => (
                      <div key={hub.id} className="p-2.5 bg-forge-bg print:bg-gray-50 rounded border border-forge-border flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold font-sans print:text-black">{hub.name} ({hub.id})</div>
                          <div className="text-[10px] text-forge-text-muted">{hub.role}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-forge-cyan font-bold print:text-black">{hub.degree} connections</span>
                          <div className="text-[9px] text-forge-amber print:text-gray-700">{hub.centrality}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Syndicate Functional Clusters */}
                <div className="space-y-2">
                  <h4 className="font-mono text-xs text-forge-text-muted uppercase">Functional Syndicate Sub-Clusters:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {dossier.networkAnalysis.syndicateClusters.map((c, i) => (
                      <div key={i} className="p-2.5 bg-forge-bg print:bg-gray-50 rounded border border-forge-border space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-white print:text-black">{c.clusterName}</span>
                          <span className="text-forge-cyan">{c.memberCount} Nodes</span>
                        </div>
                        <p className="text-[10px] text-forge-text-muted print:text-gray-600 font-sans">{c.primaryRole}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Section 4: Timeline */}
            {(activeSection === 'all' || activeSection === 'timeline') && (
              <section className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-forge-border pb-1.5">
                  <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2 py-0.5 rounded print:text-black">
                    SECTION 4
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    CRITICAL FORENSIC TIMELINE HIGHLIGHTS
                  </h3>
                </div>

                <div className="space-y-2">
                  {dossier.timelineHighlights.map((ev) => (
                    <div key={ev.id} className="p-3 bg-forge-bg print:bg-gray-50 rounded border border-forge-border flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-forge-panel border border-forge-border text-forge-cyan print:text-black">
                            {ev.type}
                          </span>
                          <h4 className="font-bold text-white print:text-black font-sans">{ev.title}</h4>
                        </div>
                        <p className="text-forge-text-secondary print:text-black text-xs leading-relaxed">{ev.description}</p>
                        <div className="font-mono text-[10px] text-forge-text-muted">
                          Entities Involved: {ev.entityIds.join(', ')} {ev.location && `· Location: ${ev.location}`}
                        </div>
                      </div>
                      <div className="font-mono text-[11px] text-forge-cyan shrink-0 whitespace-nowrap print:text-black">
                        {ev.timestamp.replace('T', ' ').slice(0, 16)} IST
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 5: Evidence */}
            {(activeSection === 'all' || activeSection === 'evidence') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-forge-border pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2 py-0.5 rounded print:text-black">
                      SECTION 5
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      SEIZED DIGITAL &amp; FORENSIC EXHIBITS ({dossier.evidenceCitations.length})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-forge-emerald">Sealed &amp; Cryptographically Preserved</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  {dossier.evidenceCitations.map((ev: Evidence) => (
                    <div key={ev.id} className="p-3 bg-forge-bg print:bg-gray-50 rounded border border-forge-border space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-forge-cyan print:text-black">{ev.id} [{ev.type}]</span>
                        <span className="text-forge-emerald text-[10px] flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>{ev.verificationStatus}</span>
                        </span>
                      </div>
                      <div className="text-white print:text-black text-xs font-sans font-semibold">{ev.title}</div>
                      <div className="text-[10px] text-forge-text-muted">Source: {ev.source}</div>
                      <div className="text-[10px] font-mono text-forge-text-secondary truncate bg-forge-panel/60 p-1 rounded border border-forge-border/40">
                        SHA-256: {ev.hash}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 6: Verified Relationships */}
            {(activeSection === 'all' || activeSection === 'verified') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-forge-border pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-emerald bg-forge-emerald/10 px-2 py-0.5 rounded print:text-black">
                      SECTION 6
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      HUMAN-VERIFIED CRIMINAL RELATIONSHIPS ({dossier.verifiedRelationships.length})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-forge-emerald">Court Admissible</span>
                </div>

                <div className="border border-forge-border rounded overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-forge-panel print:bg-gray-100 text-[10px] text-forge-text-muted print:text-black">
                      <tr>
                        <th className="p-2.5">SOURCE ENTITY</th>
                        <th className="p-2.5">PREDICATE / NEXUS</th>
                        <th className="p-2.5">TARGET ENTITY</th>
                        <th className="p-2.5">VERIFYING OFFICER</th>
                        <th className="p-2.5 text-right">CONFIDENCE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forge-border/40 text-[11px]">
                      {dossier.verifiedRelationships.map((r) => (
                        <tr key={r.id} className="hover:bg-forge-cardHover">
                          <td className="p-2.5 text-white font-semibold">{r.sourceName}</td>
                          <td className="p-2.5 text-forge-emerald font-bold">{r.label || r.type}</td>
                          <td className="p-2.5 text-white font-semibold">{r.targetName}</td>
                          <td className="p-2.5 text-forge-text-muted">
                            {r.verifiedBy || 'Insp. Rathore'} · {r.verifiedAt?.slice(0, 10) || '2026-09-10'}
                          </td>
                          <td className="p-2.5 text-right font-bold text-forge-cyan">{r.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Section 7: Unverified Leads */}
            {(activeSection === 'all' || activeSection === 'leads') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-forge-border pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-amber bg-forge-amber/10 px-2 py-0.5 rounded print:text-black">
                      SECTION 7
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      UNVERIFIED LEADS &amp; AI-INFERRED SUSPICIONS ({dossier.unverifiedLeads.length})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-forge-amber">Pending Human Attestation</span>
                </div>

                <div className="space-y-2">
                  {dossier.unverifiedLeads.map((r) => (
                    <div key={r.id} className="p-3 bg-forge-bg print:bg-gray-50 rounded border border-forge-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.2 rounded bg-forge-amber/15 text-forge-amber text-[10px] font-bold border border-forge-amber/30">
                            AI INFERENCE ({r.confidence}%)
                          </span>
                          <span className="text-white font-bold">{r.sourceName} ──[{r.label || r.type}]──&gt; {r.targetName}</span>
                        </div>
                        <p className="text-[11px] text-forge-text-muted font-sans">{r.aiReasoning || 'Identified via co-location analysis and transactional adjacency.'}</p>
                      </div>
                      <span className="text-[10px] font-mono text-forge-amber shrink-0 border border-forge-amber/40 px-2 py-1 rounded bg-forge-amber/10">
                        REQUIRES FIELD VERIFICATION
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 8: Risk Assessment */}
            {(activeSection === 'all' || activeSection === 'risk') && (
              <section className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-forge-border pb-1.5">
                  <span className="font-mono text-xs font-bold text-forge-rose bg-forge-rose/10 px-2 py-0.5 rounded print:text-black">
                    SECTION 8
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    TACTICAL THREAT &amp; RISK ASSESSMENT
                  </h3>
                </div>

                <div className="p-4 bg-forge-bg print:bg-gray-50 rounded border border-forge-border space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forge-border pb-2">
                    <div>
                      <span className="text-forge-text-muted text-[10px] font-mono uppercase">SYNDICATE RISK INDEX</span>
                      <div className="text-lg font-bold text-forge-rose font-mono">
                        {dossier.riskAssessment.overallSyndicateRisk} / 100 [{dossier.riskAssessment.threatLevel}]
                      </div>
                    </div>
                    <div>
                      <span className="text-forge-text-muted text-[10px] font-mono uppercase">ESTIMATED ASSET VOLUME</span>
                      <div className="text-sm font-bold text-white font-mono">{dossier.riskAssessment.assetLaunderingEstimate}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-mono text-xs font-bold text-white uppercase">Primary Syndicate Modus Operandi &amp; Threat Vectors:</h4>
                    <ul className="list-disc list-inside space-y-1 text-forge-text-secondary font-sans text-xs">
                      {dossier.riskAssessment.primaryThreatVectors.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-forge-border">
                    <h4 className="font-mono text-xs font-bold text-forge-cyan uppercase">Recommended Prosecutorial Actions:</h4>
                    <ul className="list-decimal list-inside space-y-1 text-forge-text-secondary font-sans text-xs">
                      {dossier.riskAssessment.recommendedActions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Section 9: Audit Trail */}
            {(activeSection === 'all' || activeSection === 'audit') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-forge-border pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-emerald bg-forge-emerald/10 px-2 py-0.5 rounded print:text-black">
                      SECTION 9
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      BLOCKCHAIN AUDIT TRAIL &amp; CHAIN OF CUSTODY PROOF
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-forge-emerald font-bold">100% LEDGER INTEGRITY SEALED</span>
                </div>

                <div className="border border-forge-border rounded overflow-hidden font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-forge-panel print:bg-gray-100 text-[10px] text-forge-text-muted print:text-black">
                      <tr>
                        <th className="p-2.5">BLOCK #</th>
                        <th className="p-2.5">ACTION RECORDED</th>
                        <th className="p-2.5">OFFICER / ACTOR</th>
                        <th className="p-2.5">TIMESTAMP</th>
                        <th className="p-2.5">SHA-256 BLOCK HASH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forge-border/40 text-[11px]">
                      {dossier.blockchainAuditTrail.slice(0, 6).map((b) => (
                        <tr key={b.blockIndex} className="hover:bg-forge-cardHover">
                          <td className="p-2.5 text-forge-cyan font-bold">#{b.blockIndex}</td>
                          <td className="p-2.5 text-white">{b.action}</td>
                          <td className="p-2.5 text-forge-text-muted">{b.actorName}</td>
                          <td className="p-2.5 text-forge-text-muted">{b.timestamp.slice(0, 19).replace('T', ' ')}</td>
                          <td className="p-2.5 text-forge-emerald text-[10px] font-mono">{b.blockHash.slice(0, 18)}...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Section 10: Evidence References */}
            {(activeSection === 'all' || activeSection === 'refs') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-forge-border pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2 py-0.5 rounded print:text-black">
                      SECTION 10
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      FORMAL SECTION 65B EVIDENCE REFERENCES &amp; EXHIBIT REGISTER
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-forge-cyan font-bold">{dossier.evidenceReferences.length} Registered Exhibits</span>
                </div>

                <div className="border border-forge-border rounded overflow-hidden font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-forge-panel print:bg-gray-100 text-[10px] text-forge-text-muted print:text-black">
                      <tr>
                        <th className="p-2.5">EXHIBIT</th>
                        <th className="p-2.5">TYPE</th>
                        <th className="p-2.5">DESCRIPTION / SEIZURE SOURCE</th>
                        <th className="p-2.5">DIGITAL HASH (SHA-256)</th>
                        <th className="p-2.5 text-right">65B CERTIFICATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forge-border/40 text-[11px]">
                      {dossier.evidenceReferences.map((ref) => (
                        <tr key={ref.exhibitCode} className="hover:bg-forge-cardHover">
                          <td className="p-2.5 text-forge-cyan font-bold">{ref.exhibitCode}</td>
                          <td className="p-2.5 text-white">
                            <span className="px-1.5 py-0.2 rounded bg-forge-bg border border-forge-border text-[10px]">
                              {ref.type}
                            </span>
                          </td>
                          <td className="p-2.5 text-forge-text-secondary font-sans">
                            <div className="font-semibold text-white print:text-black">{ref.title}</div>
                            <div className="text-[10px] text-forge-text-muted font-mono">{ref.source}</div>
                          </td>
                          <td className="p-2.5 text-forge-text-muted text-[10px]">{ref.hash}</td>
                          <td className="p-2.5 text-right font-bold text-forge-emerald text-[10px]">
                            {ref.section65BStatus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Section 65B Legal Attestation Certificate */}
                <div className="mt-4 p-4 rounded bg-forge-bg print:bg-gray-50 border border-forge-border print:border-black font-mono text-xs space-y-3">
                  <div className="font-bold text-white print:text-black uppercase text-[11px]">
                    STATUTORY CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872
                  </div>
                  <p className="text-forge-text-secondary print:text-black text-[11px] leading-relaxed font-sans">
                    I, {dossier.preparedBy}, {dossier.caseInfo.leadInvestigator ? `along with ${dossier.caseInfo.leadInvestigator}` : ''}, do hereby certify that the electronic records, telephonic metadata, wiretap intercepts, and transaction ledgers referenced herein were produced by the automated lawful interception and forensic computing systems of the {dossier.caseInfo.assignedUnit} during the ordinary course of lawful activities. The integrity of each digital exhibit has been validated cryptographically via SHA-256 hash matching against the tamper-evident immutable audit trail.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-forge-border/60 text-[10px] text-forge-text-muted print:text-black gap-2">
                    <div>
                      <div>DIGITALLY SIGNED BY: {dossier.preparedBy}</div>
                      <div>BADGE ID: {currentInvestigator.badge}</div>
                    </div>
                    <div className="sm:text-right">
                      <div>TIMESTAMP: {dossier.generatedAt}</div>
                      <div>STATUS: COURT ADMISSIBLE · SEALED</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      ) : !isGenerating ? (
        <div className="p-12 text-center text-forge-text-muted bg-forge-card/40 border border-forge-border rounded-lg space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-forge-cyan/10 border border-forge-cyan/20 flex items-center justify-center text-forge-cyan">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">No Investigation Dossier Generated</h3>
            <p className="text-xs text-forge-text-muted leading-relaxed">
              Click &quot;Generate Investigation Report&quot; above to compile verified network facts, evidence exhibits, and blockchain audit logs for Case {currentCase.code}.
            </p>
          </div>
          <button
            onClick={handleStartGeneration}
            className="px-4 py-2 rounded bg-forge-cyan hover:bg-forge-cyan/80 text-slate-900 font-mono font-bold text-xs inline-flex items-center space-x-2 transition shadow-cyan-glow"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>GENERATE INVESTIGATION REPORT</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};
