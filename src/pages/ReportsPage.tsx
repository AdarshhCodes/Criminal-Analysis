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
  Users,
  Landmark,
  Share2,
  BarChart3,
  MapPin,
  Clock,
  ShieldAlert,
  Layers,
  CheckCircle2,
  FolderKanban,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { reportService, CourtReadyReportDossier, auditService } from '../services';

const GENERATION_STEPS = [
  'Extracting legal statutes & executive synopsis...',
  'Compiling person threat rankings & aliases...',
  'Analyzing Hawala financial smurfing & shell ledgers...',
  'Traversing network graph centrality & bottlenecks...',
  'Aggregating crime statistics & risk distribution...',
  'Mapping geographic safehouses & transit corridors...',
  'Sequencing chronological timeline milestones...',
  'Validating Section 65B exhibits & blockchain seals...',
];

type ReportSectionTab =
  | 'all'
  | 'summary'
  | 'persons'
  | 'financial'
  | 'connections'
  | 'crime_stats'
  | 'geographic'
  | 'timeline'
  | 'evidence'
  | 'environment';

export const ReportsPage: React.FC = () => {
  const { cases, currentCase, selectCase, currentInvestigator } = useInvestigationStore();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(currentCase.id);
  const [dossier, setDossier] = useState<CourtReadyReportDossier | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<ReportSectionTab>('all');

  // Progressive generation state machine
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating) {
      if (currentStepIndex < GENERATION_STEPS.length - 1) {
        timer = setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, 380);
      } else {
        timer = setTimeout(() => {
          const report = reportService.generateReport(selectedCaseId, currentInvestigator.name);
          setDossier(report);
          setIsGenerating(false);
          setCurrentStepIndex(0);

          // Log report generation in audit ledger
          auditService.logReportGeneration(report.caseInfo.code, report.caseInfo.name);
        }, 450);
      }
    }
    return () => clearTimeout(timer);
  }, [isGenerating, currentStepIndex, selectedCaseId, currentInvestigator.name]);

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

1. CASE SUMMARY:
Status: ${dossier.caseSummary.status} | Priority: ${dossier.caseSummary.priority}
Jurisdiction: ${dossier.caseSummary.jurisdiction}
Applicable Acts:
${dossier.caseSummary.applicableActs.map((act) => ` - ${act}`).join('\n')}
Executive Synopsis:
${dossier.caseSummary.executiveNarrative}

2. PERSON SUMMARY (${dossier.personSummary.totalEntities} Persons):
Accused Targets (${dossier.personSummary.accusedCount}):
${dossier.personSummary.accusedRoster
  .map(
    (t) =>
      ` - [${t.id}] ${t.name} (${t.role}) | Risk: ${t.riskScore}/100 | Primary ID: ${t.primaryIdentifier} | Aliases: ${t.aliases.join(', ') || 'None'}`
  )
  .join('\n')}

3. FINANCIAL ACTIVITY SUMMARY:
Total Tracked Flow: ${dossier.financialSummary.totalVolume}
Transaction Count: ${dossier.financialSummary.transactionCount} | Suspicious Accounts: ${dossier.financialSummary.suspiciousAccountsCount}
Primary Hawala Corridor: ${dossier.financialSummary.primaryCorridor}
Flagged Smurfing & Layering Transactions:
${dossier.financialSummary.flaggedTransactions
  .map(
    (tx) =>
      ` - [${tx.id}] ${tx.flow} | Amount: ${tx.amount} (${tx.transferType}) | Status: ${tx.status} | Time: ${tx.timestamp}`
  )
  .join('\n')}

4. CONNECTION ANALYSIS:
Total Nodes: ${dossier.networkAnalysis.totalNodes} | Edges: ${dossier.networkAnalysis.totalEdges} | Density: ${dossier.networkAnalysis.graphDensity}
Critical Bottleneck Nodes:
${dossier.networkAnalysis.criticalHubNodes
  .map((h) => ` - ${h.name} (${h.id}): ${h.degree} Connections (${h.centrality})`)
  .join('\n')}
Syndicate Sub-Clusters:
${dossier.networkAnalysis.syndicateClusters
  .map((c) => ` - ${c.clusterName} (${c.memberCount} Nodes): ${c.primaryRole}`)
  .join('\n')}

5. CRIME STATISTICS:
Risk Distribution: Critical: ${dossier.crimeStatistics.riskScoreDistribution.critical} | High: ${dossier.crimeStatistics.riskScoreDistribution.high} | Elevated: ${dossier.crimeStatistics.riskScoreDistribution.elevated} | Low: ${dossier.crimeStatistics.riskScoreDistribution.low}
Recovery: ${dossier.crimeStatistics.recoveryRate.recoveredOrFrozen} of ${dossier.crimeStatistics.recoveryRate.totalIntercepted} (${dossier.crimeStatistics.recoveryRate.recoveryPercentage}%)
Top Offense Categories:
${dossier.crimeStatistics.crimeCategories
  .map((c) => ` - ${c.category}: ${c.count} Incidents (${c.percentage}%)`)
  .join('\n')}

6. GEOGRAPHIC ANALYSIS:
Operational Jurisdictions:
${dossier.geographicAnalysis.operationalJurisdictions
  .map((j) => ` - ${j.jurisdiction} (${j.type}): ${j.nodesMapped} Nodes | Risk: ${j.riskRating}`)
  .join('\n')}
Key Safehouses & Seized Facilities:
${dossier.geographicAnalysis.keyLocations
  .map((loc) => ` - [${loc.id}] ${loc.name} (${loc.type}) | Coords: ${loc.coordinates} | Status: ${loc.raidStatus}`)
  .join('\n')}

7. TIMELINE HIGHLIGHTS:
Total Events: ${dossier.timelineSummary.totalEvents} (${dossier.timelineSummary.startDate} to ${dossier.timelineSummary.latestEventDate})
Critical Milestones:
${dossier.timelineSummary.criticalMilestones
  .map((m) => ` - [${m.date}] ${m.title}: ${m.significance}`)
  .join('\n')}

8. EVIDENCE EXHIBITS SUMMARY (${dossier.evidenceSummary.totalExhibits} Exhibits):
Section 65B Certified: ${dossier.evidenceSummary.certifiedSection65BCount} Exhibits
${dossier.evidenceSummary.exhibits
  .map((e) => ` - [${e.exhibitCode}] ${e.title} (${e.type}) | SHA-256: ${e.hash} | Status: ${e.section65BStatus}`)
  .join('\n')}

9. INVESTIGATION ENVIRONMENT SNAPSHOT:
Total Active Operations: ${dossier.environmentSummary.totalActiveCases}
Portfolio Financial Tracked: ${dossier.environmentSummary.totalFinancialTracked}
Blockchain Audit Integrity: ${dossier.environmentSummary.auditLedgerIntegrity.verified ? '100% SEALED' : 'INTEGRITY FLAGGED'} (${dossier.environmentSummary.auditLedgerIntegrity.totalBlocks} Blocks)
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

  const navSectionTabs: { id: ReportSectionTab; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'Master Dossier', icon: Layers },
    { id: 'summary', label: '1. Case Summary', icon: FileText },
    { id: 'persons', label: '2. Person Summary', icon: Users },
    { id: 'financial', label: '3. Financial Activity', icon: Landmark },
    { id: 'connections', label: '4. Connection Analysis', icon: Share2 },
    { id: 'crime_stats', label: '5. Crime Statistics', icon: BarChart3 },
    { id: 'geographic', label: '6. Geographic Analysis', icon: MapPin },
    { id: 'timeline', label: '7. Timeline', icon: Clock },
    { id: 'evidence', label: '8. Evidence Summary', icon: ShieldCheck },
    { id: 'environment', label: '★ Environment Snapshot', icon: FolderKanban },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 select-none font-sans">
      {/* Top Banner: Synthetic Data Disclaimer */}
      <div className="bg-forge-amber/10 border border-forge-amber/30 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-2 print:hidden">
        <div className="flex items-center space-x-2 text-forge-amber">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="font-bold tracking-wide">
            DEMONSTRATION REPORT / SYNTHETIC DATA · NOT FOR OPERATIONAL DEPLOYMENT
          </span>
        </div>
        <span className="text-forge-text-muted text-[11px]">
          Compliant with Section 65B Indian Evidence Act Standards
        </span>
      </div>

      {/* Main Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/[0.08] pb-4 gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
            <FileText className="w-4 h-4" />
            <span>INVESTIGATION REPORTING &amp; FORENSIC DOSSIER GENERATION</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Investigation Reports &amp; Environment Summary
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Automated court-ready briefs covering case summaries, person profiles, financial tracing, connection topology, crime stats, geography, timeline, and exhibits.
          </p>
        </div>

        {/* Action Buttons & Case Selector */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Case Dropdown */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg glass-card border border-white/[0.08] text-xs font-mono">
            <span className="text-forge-text-muted text-[11px]">TARGET CASE:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                selectCase(e.target.value);
              }}
              disabled={isGenerating}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">ALL OPERATIONS (Portfolio)</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.code} · {c.name.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-forge-cyan hover:bg-forge-cyanLight disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center space-x-2 transition shadow-[0_0_12px_rgba(6,182,212,0.3)] focus:outline-none"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isGenerating ? 'ASSEMBLING DOSSIER...' : 'GENERATE INVESTIGATION REPORT'}</span>
          </button>

          {dossier && !isGenerating && (
            <>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded-lg glass-card hover:bg-white/[0.06] border border-white/[0.08] text-white font-mono text-xs flex items-center space-x-1.5 transition"
                title="Print or Save PDF"
              >
                <Printer className="w-4 h-4 text-forge-cyan" />
                <span className="hidden sm:inline">PRINT / PDF</span>
              </button>

              <button
                onClick={handleCopyJson}
                className="px-3 py-2 rounded-lg glass-card hover:bg-white/[0.06] border border-white/[0.08] text-white font-mono text-xs flex items-center space-x-1.5 transition"
                title="Copy Complete Report JSON"
              >
                {copied ? <Check className="w-4 h-4 text-forge-emerald" /> : <Copy className="w-4 h-4 text-forge-text-muted" />}
                <span className="hidden sm:inline">{copied ? 'COPIED' : 'JSON'}</span>
              </button>

              <button
                onClick={handleDownloadBrief}
                className="px-3 py-2 rounded-lg glass-card hover:bg-white/[0.06] border border-white/[0.08] text-white font-mono text-xs flex items-center space-x-1.5 transition"
                title="Download Plaintext Investigation Brief"
              >
                <Download className="w-3.5 h-3.5 text-forge-text-muted" />
                <span className="hidden sm:inline">EXPORT TXT</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progressive Generation Progress State */}
      {isGenerating && (
        <div className="glass-card rounded-2xl p-8 border border-forge-cyan/40 space-y-6 shadow-panel">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forge-cyan/15 text-forge-cyan font-mono text-xs font-bold border border-forge-cyan/30 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMPILING MULTI-SECTION FORENSIC REPORT</span>
            </div>
            <h3 className="text-base font-bold text-white font-sans">
              {GENERATION_STEPS[currentStepIndex]}
            </h3>
            <p className="text-xs text-forge-text-muted font-mono">
              Synthesizing legal statutes, person rosters, financial smurfing trails, network graph topology, and 65B exhibits for Case {selectedCaseId}
            </p>
          </div>

          {/* Progress Bar & Indicators */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/[0.08]">
              <div
                className="bg-forge-cyan h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentStepIndex + 1) / GENERATION_STEPS.length) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
              {GENERATION_STEPS.map((step, idx) => (
                <div
                  key={step}
                  className={`p-2 rounded-lg transition ${
                    idx < currentStepIndex
                      ? 'text-forge-emerald bg-forge-emerald/10 font-bold border border-forge-emerald/20'
                      : idx === currentStepIndex
                      ? 'text-forge-cyan bg-forge-cyan/15 font-bold animate-pulse border border-forge-cyan/40'
                      : 'text-forge-text-muted bg-slate-900/60 border border-white/[0.04]'
                  }`}
                >
                  {idx < currentStepIndex ? '✓' : idx + 1}. {step.slice(0, 24)}...
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generated Report Content */}
      {dossier && !isGenerating ? (
        <div className="glass-card rounded-2xl border border-white/[0.08] shadow-panel overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Header Card */}
          <div className="p-6 sm:p-8 border-b border-white/[0.08] bg-forge-panel/70 print:bg-white print:border-b-2 print:border-black space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div className="font-mono text-[11px] tracking-widest text-forge-rose font-bold uppercase print:text-red-700">
                {dossier.classification}
              </div>
              <div className="font-mono text-xs px-2.5 py-0.5 rounded bg-forge-amber/15 text-forge-amber border border-forge-amber/30 print:border-black print:text-black">
                SECTION 65B READY · STATUTORY INTELLIGENCE DOSSIER
              </div>
            </div>

            <div className="text-center space-y-1.5 pt-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase print:text-black">
                CRIMINAL INVESTIGATION INTELLIGENCE DOSSIER
              </h2>
              <div className="text-sm font-mono text-forge-cyan print:text-black font-semibold">
                CASE: {dossier.caseInfo.name} ({dossier.caseInfo.code})
              </div>
              <div className="text-xs font-mono text-forge-text-muted print:text-gray-700 flex flex-wrap items-center justify-center gap-4 pt-1">
                <span>PREPARED BY: <strong className="text-white print:text-black">{dossier.preparedBy}</strong></span>
                <span>•</span>
                <span>AGENCY: <strong className="text-white print:text-black">{dossier.caseInfo.assignedUnit}</strong></span>
                <span>•</span>
                <span>DATE: <strong className="text-white print:text-black">{dossier.generatedAt.slice(0, 19).replace('T', ' ')} UTC</strong></span>
              </div>
            </div>

            {/* Dedicated 9-Tab Section Switcher Bar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4 font-mono text-xs print:hidden">
              {navSectionTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition text-xs ${
                      isActive
                        ? 'bg-forge-cyan text-slate-950 font-bold shadow-sm'
                        : 'glass-card hover:bg-white/[0.06] text-forge-text-secondary hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8 font-sans">
            {/* SECTION 1: Case Summary */}
            {(activeSection === 'all' || activeSection === 'summary') && (
              <section className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-2">
                  <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2.5 py-0.5 rounded border border-forge-cyan/30 print:text-black">
                    SECTION 1
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    CASE SUMMARY &amp; STATUTORY CHARGES
                  </h3>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-4 print:bg-gray-50 print:border-gray-300">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-forge-text-muted">DOCKET CODE</div>
                      <div className="font-bold text-white print:text-black">{dossier.caseSummary.caseCode}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-forge-text-muted">OPERATIONAL STATUS</div>
                      <div className="font-bold text-forge-emerald print:text-black">{dossier.caseSummary.status}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-forge-text-muted">PRIORITY RATING</div>
                      <div className="font-bold text-forge-rose print:text-red-700">{dossier.caseSummary.priority}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-forge-text-muted">LEAD INVESTIGATOR</div>
                      <div className="font-bold text-white print:text-black">{dossier.caseSummary.leadInvestigator}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                      APPLICABLE STATUTORY ACTS &amp; CHARGES:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                      {dossier.caseSummary.applicableActs.map((act, i) => (
                        <div key={i} className="p-2 rounded bg-forge-panel border border-white/[0.06] text-forge-cyan print:text-black">
                          § {act}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                      EXECUTIVE NARRATIVE:
                    </span>
                    <p className="text-xs text-forge-text-secondary print:text-black leading-relaxed">
                      {dossier.caseSummary.executiveNarrative}
                    </p>
                  </div>

                  {/* Investigation Milestones */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                      INVESTIGATION PROCEDURAL MILESTONES:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
                      {dossier.caseSummary.investigationMilestones.map((m, i) => (
                        <div key={i} className="p-2.5 rounded bg-forge-panel border border-white/[0.06] flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white print:text-black">{m.stage}</div>
                            <div className="text-[10px] text-forge-text-muted">{m.date}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            m.status === 'COMPLETED'
                              ? 'bg-forge-emerald/20 text-forge-emerald'
                              : m.status === 'IN_PROGRESS'
                              ? 'bg-forge-cyan/20 text-forge-cyan'
                              : 'bg-slate-800 text-forge-text-muted'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: Person Summary */}
            {(activeSection === 'all' || activeSection === 'persons') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2.5 py-0.5 rounded border border-forge-cyan/30 print:text-black">
                      SECTION 2
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      PERSON SUMMARY &amp; SUSPECT ROSTER ({dossier.personSummary.totalEntities})
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-mono text-forge-text-muted">
                    <span>Accused: <strong className="text-forge-rose">{dossier.personSummary.accusedCount}</strong></span>
                    <span>Witnesses: <strong className="text-forge-emerald">{dossier.personSummary.witnessCount}</strong></span>
                  </div>
                </div>

                <div className="border border-white/[0.08] rounded-xl overflow-hidden print:border-black">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-forge-panel print:bg-gray-100 font-mono text-[10px] text-forge-text-muted print:text-black">
                      <tr>
                        <th className="p-3">TARGET ID</th>
                        <th className="p-3">NAME &amp; ALIASES</th>
                        <th className="p-3">OPERATIONAL ROLE</th>
                        <th className="p-3">PRIMARY ID</th>
                        <th className="p-3">ASSOCIATES</th>
                        <th className="p-3 text-right">RISK SCORE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] font-mono text-[11px] print:divide-black">
                      {dossier.personSummary.accusedRoster.map((p) => (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-forge-cyan font-bold">{p.id}</td>
                          <td className="p-3">
                            <span className="font-bold text-white print:text-black font-sans block">{p.name}</span>
                            {p.aliases.length > 0 && (
                              <span className="text-[10px] text-forge-text-muted">a.k.a. {p.aliases.join(', ')}</span>
                            )}
                          </td>
                          <td className="p-3 text-forge-text-secondary font-sans">{p.role}</td>
                          <td className="p-3 text-forge-text-muted">{p.primaryIdentifier}</td>
                          <td className="p-3 text-forge-text-muted font-sans text-[10px]">
                            {p.knownAssociates.join(', ') || 'Independent'}
                          </td>
                          <td className="p-3 text-right font-bold text-forge-rose print:text-red-700">
                            {p.riskScore} / 100
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Victims & Complainants */}
                {dossier.personSummary.victimsAndWitnesses.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                      PROTECTED COMPLAINANTS &amp; WITNESS TESTIMONY:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      {dossier.personSummary.victimsAndWitnesses.map((v) => (
                        <div key={v.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-white print:text-black font-sans">{v.name} ({v.id})</span>
                            <span className="text-forge-emerald text-[10px]">{v.protectionStatus}</span>
                          </div>
                          <p className="text-forge-text-secondary font-sans text-xs">{v.statementSummary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* SECTION 3: Financial Activity Summary */}
            {(activeSection === 'all' || activeSection === 'financial') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2.5 py-0.5 rounded border border-forge-cyan/30 print:text-black">
                      SECTION 3
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      FINANCIAL ACTIVITY SUMMARY &amp; HAWALA CORRIDORS
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-forge-cyan font-bold">
                    Total Volume: {dossier.financialSummary.totalVolume}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="text-[10px] text-forge-text-muted">TOTAL TRANSACTIONS</div>
                    <div className="text-lg font-bold text-white print:text-black">{dossier.financialSummary.transactionCount} Wires</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="text-[10px] text-forge-text-muted">SUSPICIOUS ACCOUNTS</div>
                    <div className="text-lg font-bold text-forge-rose print:text-red-700">{dossier.financialSummary.suspiciousAccountsCount} Accounts</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="text-[10px] text-forge-text-muted">IDENTIFIED MULES</div>
                    <div className="text-lg font-bold text-forge-amber print:text-black">{dossier.financialSummary.muleCount} Mules</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="text-[10px] text-forge-text-muted">PRIMARY CORRIDOR</div>
                    <div className="text-xs font-bold text-forge-cyan print:text-black truncate mt-1">
                      {dossier.financialSummary.primaryCorridor}
                    </div>
                  </div>
                </div>

                {/* Flagged Transactions Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                    FLAGGED SMURFING &amp; OFFSHORE TRANSACTIONS:
                  </span>
                  <div className="border border-white/[0.08] rounded-xl overflow-hidden print:border-black font-mono text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-forge-panel print:bg-gray-100 text-[10px] text-forge-text-muted print:text-black">
                        <tr>
                          <th className="p-2.5">TX ID</th>
                          <th className="p-2.5">TRANSACTION FLOW</th>
                          <th className="p-2.5">AMOUNT &amp; TYPE</th>
                          <th className="p-2.5">TIMESTAMP</th>
                          <th className="p-2.5 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06] text-[11px]">
                        {dossier.financialSummary.flaggedTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/[0.02]">
                            <td className="p-2.5 text-forge-cyan font-bold">{tx.id}</td>
                            <td className="p-2.5 text-white font-sans">{tx.flow}</td>
                            <td className="p-2.5">
                              <span className="font-bold text-forge-rose">{tx.amount}</span>
                              <span className="text-[10px] text-forge-text-muted block">{tx.transferType}</span>
                            </td>
                            <td className="p-2.5 text-forge-text-muted">{tx.timestamp}</td>
                            <td className="p-2.5 text-right font-bold text-forge-emerald">{tx.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shell Companies & Asset Freezes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-2">
                    <span className="text-[10px] text-forge-cyan uppercase tracking-wider font-bold block">
                      SHELL CORPORATE VEHICLES MAPPED:
                    </span>
                    {dossier.financialSummary.shellCompanies.map((sc) => (
                      <div key={sc.id} className="p-2 rounded bg-forge-panel/70 border border-white/[0.06] space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-white print:text-black font-sans">{sc.name}</span>
                          <span className="text-forge-rose">{sc.estimatedFlow}</span>
                        </div>
                        <div className="text-[10px] text-forge-text-muted">Reg: {sc.registrationState} · Beneficial: {sc.beneficialOwner}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-2">
                    <span className="text-[10px] text-forge-rose uppercase tracking-wider font-bold block">
                      STATUTORY ASSET FREEZES (SECTION 102 CRPC):
                    </span>
                    {dossier.financialSummary.assetFreezingOrders.map((af, i) => (
                      <div key={i} className="p-2 rounded bg-forge-panel/70 border border-white/[0.06] space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-white print:text-black">{af.accountNumber}</span>
                          <span className="text-forge-emerald text-[10px]">{af.status}</span>
                        </div>
                        <div className="text-[10px] text-forge-text-muted">{af.bank} · Basis: {af.statutoryBasis}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: Connection Analysis */}
            {(activeSection === 'all' || activeSection === 'connections') && (
              <section className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-2">
                  <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2.5 py-0.5 rounded border border-forge-cyan/30 print:text-black">
                    SECTION 4
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    NETWORK TOPOLOGY &amp; CONNECTION ANALYSIS
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="text-[10px] text-forge-text-muted">MAPPED NODES</div>
                    <div className="text-lg font-bold text-white print:text-black">{dossier.connectionAnalysis.totalNodes} Nodes</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="text-[10px] text-forge-text-muted">RELATIONSHIP EDGES</div>
                    <div className="text-lg font-bold text-forge-cyan print:text-black">{dossier.connectionAnalysis.totalEdges} Edges</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="text-[10px] text-forge-text-muted">GRAPH DENSITY</div>
                    <div className="text-lg font-bold text-forge-amber print:text-black">{dossier.connectionAnalysis.graphDensity}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08]">
                    <div className="text-[10px] text-forge-text-muted">AVERAGE DEGREE</div>
                    <div className="text-lg font-bold text-forge-emerald print:text-black">{dossier.connectionAnalysis.averageDegree} / node</div>
                  </div>
                </div>

                {/* Critical Hub Bottlenecks */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                    KEY INTERMEDIARY BOTTLENECK NODES:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                    {dossier.connectionAnalysis.criticalHubNodes.map((h) => (
                      <div key={h.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08] flex items-center justify-between">
                        <div>
                          <div className="text-white print:text-black font-sans font-bold">{h.name} ({h.id})</div>
                          <div className="text-[10px] text-forge-text-muted">{h.role}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-forge-cyan font-bold">{h.degree} Links</span>
                          <span className="block text-[9px] text-forge-amber">{h.centrality}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cross-Case Bridges */}
                {dossier.connectionAnalysis.crossCaseBridges && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-forge-cyan uppercase tracking-wider font-bold block">
                      CROSS-CASE CONDUIT BRIDGES:
                    </span>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-forge-cyan/30 text-xs font-mono space-y-1">
                      {dossier.connectionAnalysis.crossCaseBridges.map((b, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-white font-bold">{b.sourceEntity} ──[{b.linkType}]──➔ {b.targetEntity}</span>
                          <span className="text-forge-cyan text-[10px]">{b.caseA} ⟷ {b.caseB} ({b.confidence}% Confidence)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* SECTION 5: Crime Statistics */}
            {(activeSection === 'all' || activeSection === 'crime_stats') && (
              <section className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-2">
                  <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2.5 py-0.5 rounded border border-forge-cyan/30 print:text-black">
                    SECTION 5
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    CRIME STATISTICS &amp; RISK SPECTRUM
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
                    <div className="text-[10px] text-forge-text-muted">RECOVERY RATIO</div>
                    <div className="text-lg font-bold text-forge-emerald">
                      {dossier.crimeStatistics.recoveryRate.recoveredOrFrozen}
                    </div>
                    <div className="text-[10px] text-forge-text-muted">
                      of {dossier.crimeStatistics.recoveryRate.totalIntercepted} ({dossier.crimeStatistics.recoveryRate.recoveryPercentage}%)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
                    <div className="text-[10px] text-forge-text-muted">RESOLUTION VELOCITY</div>
                    <div className="text-lg font-bold text-white">
                      {dossier.crimeStatistics.resolutionVelocity.leadsClosed} Leads Closed
                    </div>
                    <div className="text-[10px] text-forge-text-muted">
                      in {dossier.crimeStatistics.resolutionVelocity.daysActive} active investigation days
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
                    <div className="text-[10px] text-forge-text-muted">RISK SPECTRUM</div>
                    <div className="text-xs text-white space-y-0.5 pt-1">
                      <div>Critical (80+): <strong className="text-forge-rose">{dossier.crimeStatistics.riskScoreDistribution.critical}</strong></div>
                      <div>High (60-79): <strong className="text-forge-amber">{dossier.crimeStatistics.riskScoreDistribution.high}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Categorical Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                    CRIME CLASSIFICATION BREAKDOWN:
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {dossier.crimeStatistics.crimeCategories.map((c, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold">{c.category}</span>
                          <span className="text-[10px] text-forge-text-muted">({c.count} records)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-forge-cyan">{c.percentage}%</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                            c.severity === 'CRITICAL' ? 'bg-forge-rose/20 text-forge-rose' : 'bg-forge-amber/20 text-forge-amber'
                          }`}>
                            {c.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 6: Geographic Analysis */}
            {(activeSection === 'all' || activeSection === 'geographic') && (
              <section className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-2">
                  <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2.5 py-0.5 rounded border border-forge-cyan/30 print:text-black">
                    SECTION 6
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    GEOGRAPHIC ANALYSIS &amp; TRANSIT CORRIDORS
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                  {dossier.geographicAnalysis.operationalJurisdictions.map((j, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-white print:text-black">{j.jurisdiction}</span>
                        <span className="text-forge-cyan">{j.nodesMapped} Nodes</span>
                      </div>
                      <div className="text-[10px] text-forge-text-muted">Type: {j.type} · Risk: {j.riskRating}</div>
                    </div>
                  ))}
                </div>

                {/* Key Safehouses */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                    SEIZED OPERATIONAL SAFEHOUSES &amp; FACILITIES:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    {dossier.geographicAnalysis.keyLocations.map((loc) => (
                      <div key={loc.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08] space-y-1.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-white print:text-black font-sans">{loc.name}</span>
                          <span className="text-forge-emerald text-[10px]">{loc.raidStatus}</span>
                        </div>
                        <div className="text-[10px] text-forge-text-muted font-sans">{loc.address} ({loc.coordinates})</div>
                        <p className="text-forge-text-secondary text-[11px] font-sans">{loc.significance}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transit Corridors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                    TRANSIT LINES &amp; LOGISTICS ROUTES:
                  </span>
                  <div className="space-y-1 font-mono text-xs">
                    {dossier.geographicAnalysis.transitCorridors.map((tc, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-white font-bold">{tc.route}</span>
                        <span className="text-forge-text-muted text-[10px]">{tc.primaryContrabandOrAsset} ({tc.transportMode})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 7: Timeline */}
            {(activeSection === 'all' || activeSection === 'timeline') && (
              <section className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-2">
                  <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2.5 py-0.5 rounded border border-forge-cyan/30 print:text-black">
                    SECTION 7
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    CHRONOLOGICAL FORENSIC TIMELINE ({dossier.timelineSummary.totalEvents} EVENTS)
                  </h3>
                </div>

                <div className="space-y-2">
                  {dossier.timelineSummary.criticalMilestones.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-white print:text-black font-sans">{m.title}</div>
                        <p className="text-forge-text-secondary text-xs">{m.significance}</p>
                      </div>
                      <span className="font-mono text-xs text-forge-cyan font-bold shrink-0">{m.date}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 8: Evidence Summary */}
            {(activeSection === 'all' || activeSection === 'evidence') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-forge-cyan bg-forge-cyan/10 px-2.5 py-0.5 rounded border border-forge-cyan/30 print:text-black">
                      SECTION 8
                    </span>
                    <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                      SECTION 65B EVIDENCE REGISTER ({dossier.evidenceSummary.totalExhibits} EXHIBITS)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-forge-emerald font-bold">
                    {dossier.evidenceSummary.certifiedSection65BCount} Sealed &amp; Certified
                  </span>
                </div>

                <div className="border border-white/[0.08] rounded-xl overflow-hidden print:border-black font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-forge-panel print:bg-gray-100 text-[10px] text-forge-text-muted print:text-black">
                      <tr>
                        <th className="p-3">EXHIBIT CODE</th>
                        <th className="p-3">TYPE</th>
                        <th className="p-3">EVIDENCE TITLE &amp; SOURCE</th>
                        <th className="p-3">SHA-256 HASH</th>
                        <th className="p-3 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-[11px]">
                      {dossier.evidenceSummary.exhibits.map((ref) => (
                        <tr key={ref.exhibitCode} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-forge-cyan font-bold">{ref.exhibitCode}</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.08] text-[10px]">
                              {ref.type}
                            </span>
                          </td>
                          <td className="p-3 font-sans">
                            <div className="font-semibold text-white print:text-black">{ref.title}</div>
                            <div className="text-[10px] text-forge-text-muted font-mono">{ref.source}</div>
                          </td>
                          <td className="p-3 text-forge-text-muted text-[10px] truncate max-w-[160px]">{ref.hash}</td>
                          <td className="p-3 text-right font-bold text-forge-emerald text-[10px]">
                            {ref.section65BStatus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Formal Certificate */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-white/[0.08] font-mono text-xs space-y-3">
                  <div className="font-bold text-white print:text-black uppercase text-[11px]">
                    STATUTORY CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872
                  </div>
                  <p className="text-forge-text-secondary font-sans leading-relaxed text-xs">
                    {dossier.evidenceSummary.section65BCertificate.statutoryText}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between pt-3 border-t border-white/[0.06] text-[10px] text-forge-text-muted gap-2">
                    <div>
                      <div>CERTIFYING OFFICER: {dossier.evidenceSummary.section65BCertificate.certifyingOfficer}</div>
                      <div>BADGE ID: {dossier.evidenceSummary.section65BCertificate.badgeNumber}</div>
                    </div>
                    <div className="sm:text-right">
                      <div>TIMESTAMP: {dossier.evidenceSummary.section65BCertificate.timestamp}</div>
                      <div className="text-forge-emerald font-bold">
                        {dossier.evidenceSummary.section65BCertificate.integrityStatus}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 9: Investigation Environment Summary Snapshot */}
            {(activeSection === 'all' || activeSection === 'environment') && (
              <section className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-2">
                  <span className="font-mono text-xs font-bold text-forge-amber bg-forge-amber/10 px-2.5 py-0.5 rounded border border-forge-amber/30 print:text-black">
                    OVERVIEW
                  </span>
                  <h3 className="font-mono text-sm uppercase text-white font-bold tracking-wide print:text-black">
                    INVESTIGATION ENVIRONMENT SNAPSHOT (MULTI-CASE PORTFOLIO)
                  </h3>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-forge-panel to-slate-900 border border-white/[0.1] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">Investigation Environment Portfolio Overview</h4>
                      <p className="text-xs text-forge-text-muted font-mono mt-0.5">
                        Consolidated status across all active taskforces and criminal networks
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-forge-emerald/20 text-forge-emerald font-bold border border-forge-emerald/40 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{dossier.environmentSummary.systemReadiness.operationalStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Portfolio High-Level KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                      <div className="text-[10px] text-forge-text-muted">ACTIVE OPERATIONS</div>
                      <div className="text-xl font-bold text-white print:text-black">
                        {dossier.environmentSummary.totalActiveCases} Dockets
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                      <div className="text-[10px] text-forge-text-muted">INDEXED ENTITIES</div>
                      <div className="text-xl font-bold text-forge-cyan print:text-black">
                        {dossier.environmentSummary.totalEntitiesInSystem} Entities
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                      <div className="text-[10px] text-forge-text-muted">TRACKED FINANCIAL FLOW</div>
                      <div className="text-xl font-bold text-forge-rose print:text-red-700">
                        {dossier.environmentSummary.totalFinancialTracked}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                      <div className="text-[10px] text-forge-text-muted">AUDIT TRAIL INTEGRITY</div>
                      <div className="text-xl font-bold text-forge-emerald flex items-center space-x-1">
                        <Lock className="w-4 h-4" />
                        <span>100% SEALED</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Dockets List */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-forge-text-muted uppercase tracking-wider block">
                      ACTIVE INVESTIGATIVE OPERATIONS:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
                      {dossier.environmentSummary.activeCaseList.map((c) => (
                        <div key={c.id} className="p-3 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-forge-cyan">{c.code}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                              c.priority === 'CRITICAL' ? 'bg-forge-rose/20 text-forge-rose' : 'bg-forge-amber/20 text-forge-amber'
                            }`}>
                              {c.priority}
                            </span>
                          </div>
                          <div className="text-white font-sans font-semibold line-clamp-1">{c.name}</div>
                          <div className="text-[10px] text-forge-text-muted font-sans">
                            Lead: {c.lead} · {c.entities} Entities
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cross-Case Interlocks Highlight */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-forge-amber uppercase tracking-wider font-bold block flex items-center space-x-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>CRITICAL CROSS-CASE INTERLOCKS DETECTED:</span>
                    </span>
                    <div className="space-y-1.5 font-mono text-xs">
                      {dossier.environmentSummary.crossCaseInterlocks.map((interlock, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-forge-amber/10 border border-forge-amber/30 space-y-1 text-forge-amber">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold gap-1">
                            <span>{interlock.sourceEntity} ──➔ {interlock.targetEntity}</span>
                            {interlock.amount && <span className="text-white">{interlock.amount}</span>}
                          </div>
                          <div className="text-[11px] text-forge-text-secondary font-sans">
                            {interlock.linkType} · Connecting [{interlock.sourceCase}] to [{interlock.targetCase}]
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      ) : !isGenerating ? (
        <div className="p-12 text-center text-forge-text-muted glass-card border border-white/[0.08] rounded-2xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-forge-cyan/10 border border-forge-cyan/20 flex items-center justify-center text-forge-cyan">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto font-sans">
            <h3 className="text-base font-bold text-white">No Investigation Dossier Generated</h3>
            <p className="text-xs text-forge-text-muted leading-relaxed">
              Click &quot;Generate Investigation Report&quot; above to assemble the 8 forensic sections and environment summary for Case {selectedCaseId}.
            </p>
          </div>
          <button
            onClick={handleStartGeneration}
            className="px-4 py-2 rounded-lg bg-forge-cyan hover:bg-forge-cyanLight text-slate-950 font-mono font-bold text-xs inline-flex items-center space-x-2 transition shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>GENERATE INVESTIGATION REPORT</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};
