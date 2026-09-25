import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Network,
  FileSearch,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  Layers,
  FolderOpen,
  HeartHandshake,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import {
  investigationService,
  alertService,
  evidenceService,
  auditService,
} from '../services';
import { truncateHash } from '../lib/utils';
import { Entity } from '../types';
import {
  SeverityBadge,
  CaseStatusBadge,
  CaseFlagBadge,
  EntityRoleBadge,
} from '../components/common/SeverityBadge';
import { CrimeStatisticsCharts } from '../components/dashboard/CrimeStatisticsCharts';
import { CriticalCasesSegment } from '../components/dashboard/CriticalCasesSegment';
import { PredictiveInsightsPanel } from '../components/dashboard/PredictiveInsightsPanel';

export const CommandCentrePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentCase,
    selectedCaseId,
    selectCase,
    selectEntity,
    selectEvidence,
    selectAlert,
    selectRelationship,
    runAiQuery,
    verifyRelationshipAction,
  } = useInvestigationStore();

  const isPortfolioView = currentCase.id === 'ALL' || selectedCaseId === 'ALL';

  // Get data scoped to the current view
  const allCases = investigationService.getCases();
  const entities = investigationService.getEntities(isPortfolioView ? 'ALL' : currentCase.id);
  const relationships = investigationService.getRelationships(isPortfolioView ? 'ALL' : currentCase.id);
  const alerts = alertService.getAlerts(undefined, isPortfolioView ? 'ALL' : currentCase.id);
  const evidenceList = evidenceService.getEvidence(undefined, isPortfolioView ? 'ALL' : currentCase.id);
  const recentAuditBlocks = auditService.getBlocks().slice(-5).reverse();

  // Metrics calculations
  const highRiskEntities = entities
    .filter((e) => e.riskScore >= 75)
    .sort((a, b) => b.riskScore - a.riskScore);

  const unverifiedRelationships = relationships.filter(
    (r) => r.verificationStatus === 'AI_SUGGESTED'
  );

  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'CRITICAL' || a.severity === 'HIGH'
  );

  // High priority targets across cases (with associated case metadata)
  const highPriorityTargetsAcrossCases = investigationService.getHighRiskTargets(
    isPortfolioView ? 'ALL' : currentCase.id,
    75
  );

  // Portfolio level recent critical updates across all operations
  const portfolioCriticalUpdates = [
    {
      id: 'UPD-001',
      caseCode: 'IF-2026-0741',
      caseName: 'Operation Rakshak',
      title: 'Urgent threat message dispatched to protected witness Kavita Nair',
      time: '12m ago',
      severity: 'CRITICAL',
      type: 'WOMEN_THREAT',
    },
    {
      id: 'UPD-002',
      caseCode: 'IF-2026-0882',
      caseName: 'Operation Falcon',
      title: '3-Hop telecom bridge identified between Rajesh Kumar and Amit Sharma',
      time: '2h ago',
      severity: 'HIGH',
      type: 'TELECOM_FUSION',
    },
    {
      id: 'UPD-003',
      caseCode: 'IF-2026-0741',
      caseName: 'Operation Rakshak',
      title: 'Canara Bank mule account registered rapid ATM withdrawals in Rohini',
      time: '3h ago',
      severity: 'HIGH',
      type: 'FINANCIAL_ANOMALY',
    },
    {
      id: 'UPD-004',
      caseCode: 'IF-2026-0519',
      caseName: 'Operation Chimera',
      title: 'Synthetic e-KYC velocity alert: 340 loan applications spawned within 1 hour',
      time: '6h ago',
      severity: 'HIGH',
      type: 'IDENTITY_BURST',
    },
    {
      id: 'UPD-005',
      caseCode: 'IF-2026-0310',
      caseName: 'Operation DarkVessel',
      title: 'Contraband seizure panchnama sealed into blockchain audit ledger',
      time: '1d ago',
      severity: 'LOW',
      type: 'AUDIT_SEAL',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Portfolio / Case Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-forge-border pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-forge-cyan font-mono text-xs">
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-bold tracking-wider">
              {isPortfolioView
                ? 'EXECUTIVE OPERATIONS COMMAND · MULTI-CASE PORTFOLIO'
                : 'CASE INVESTIGATION COMMAND HEADQUARTERS'}
            </span>
            {isPortfolioView ? (
              <span className="bg-forge-cyan/20 text-forge-cyan px-2 py-0.5 rounded border border-forge-cyan/40 font-bold">
                PORTFOLIO OVERVIEW
              </span>
            ) : (
              <CaseStatusBadge status={currentCase.status} />
            )}
            {!isPortfolioView && currentCase.priority && (
              <SeverityBadge level={currentCase.priority} />
            )}
            {!isPortfolioView && currentCase.caseFlags?.includes('WOMEN_RELATED') && (
              <CaseFlagBadge flag="WOMEN_RELATED" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mt-1.5 flex items-center gap-2">
            {isPortfolioView ? 'Executive Investigation Dashboard' : currentCase.name}
          </h1>

          <p className="text-xs text-forge-text-muted mt-0.5">
            {isPortfolioView
              ? 'Consolidated intelligence oversight across 4 active criminal operations, cross-case targets, and threat alerts.'
              : `${currentCase.assignedUnit} · Lead: ${currentCase.leadInvestigator}`}
          </p>
        </div>

        {/* View Switcher & Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Toggle Button between All Cases and Single Case */}
          {isPortfolioView ? (
            <div className="flex items-center space-x-1.5 bg-forge-card p-1 rounded-md border border-forge-border">
              <span className="text-[10px] font-mono text-forge-text-muted px-2">QUICK JUMP:</span>
              {allCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCase(c.id)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded hover:bg-forge-panel hover:text-white text-forge-text-secondary transition"
                  title={c.name}
                >
                  {c.code.split('-')[2] || c.code}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => selectCase('ALL')}
              className="flex items-center space-x-2 bg-forge-card hover:bg-forge-cardHover border border-forge-cyan/40 text-forge-cyan font-mono text-xs px-3.5 py-2 rounded transition shadow-sm font-semibold"
              title="Return to consolidated Executive Portfolio Dashboard"
            >
              <Layers className="w-4 h-4" />
              <span>← EXECUTIVE OVERVIEW (ALL CASES)</span>
            </button>
          )}

          <button
            onClick={() => navigate('/graph')}
            className="flex items-center space-x-2 bg-forge-cyan hover:bg-forge-cyan/80 text-slate-900 font-mono text-xs font-bold px-3.5 py-2 rounded transition shadow-cyan-glow"
          >
            <Network className="w-4 h-4" />
            <span>{isPortfolioView ? 'PORTFOLIO GRAPH' : 'LAUNCH NETWORK GRAPH'}</span>
          </button>

          <button
            onClick={() => navigate('/ai')}
            className="flex items-center space-x-1.5 bg-forge-card hover:bg-forge-cardHover border border-forge-border text-forge-text-secondary hover:text-white font-mono text-xs px-3 py-2 rounded transition"
          >
            <Sparkles className="w-4 h-4 text-forge-cyan" />
            <span>AI COPILOT</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-text-muted flex items-center justify-between">
            <span>{isPortfolioView ? 'TOTAL CASES' : 'CASE NODES'}</span>
            <FolderOpen className="w-3.5 h-3.5 text-forge-cyan" />
          </div>
          <div className="text-xl font-bold text-white mt-1">
            {isPortfolioView ? allCases.length : entities.length}
          </div>
          <div className="text-[9px] text-forge-text-muted">
            {isPortfolioView ? '4 Distinct Operations' : 'Indexed Entities'}
          </div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-rose flex items-center justify-between">
            <span>HIGH RISK</span>
            <Shield className="w-3.5 h-3.5 text-forge-rose" />
          </div>
          <div className="text-xl font-bold text-forge-rose mt-1">
            {highRiskEntities.length}
          </div>
          <div className="text-[9px] text-forge-rose/80">
            {isPortfolioView ? 'Cross-Case Suspects' : 'Score ≥ 75'}
          </div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-amber flex items-center justify-between">
            <span>AI LEADS</span>
            <Sparkles className="w-3.5 h-3.5 text-forge-amber" />
          </div>
          <div className="text-xl font-bold text-forge-amber mt-1">
            {unverifiedRelationships.length}
          </div>
          <div className="text-[9px] text-forge-amber/80">Pending Verification</div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-emerald flex items-center justify-between">
            <span>EVIDENCE</span>
            <FileSearch className="w-3.5 h-3.5 text-forge-emerald" />
          </div>
          <div className="text-xl font-bold text-white mt-1">{evidenceList.length}</div>
          <div className="text-[9px] text-forge-emerald">Sealed Exhibits</div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-text-muted flex items-center justify-between">
            <span>CONNECTIONS</span>
            <UserCheck className="w-3.5 h-3.5 text-forge-cyan" />
          </div>
          <div className="text-xl font-bold text-white mt-1">{relationships.length}</div>
          <div className="text-[9px] text-forge-text-muted">Graph Edges</div>
        </div>

        <div className="bg-forge-card/80 border border-forge-border rounded-md p-3">
          <div className="text-[10px] text-forge-rose flex items-center justify-between">
            <span>ACTIVE ALERTS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-forge-rose" />
          </div>
          <div className="text-xl font-bold text-white mt-1">{alerts.length}</div>
          <div className="text-[9px] text-forge-rose font-bold">
            {criticalAlerts.length} High Severity
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1 (REQUIREMENT 5): DEDICATED SEGMENT FOR WOMEN-RELATED & CRITICAL CASES */}
      {/* ===================================================================== */}
      <CriticalCasesSegment
        cases={allCases}
        onSelectCase={(caseId) => selectCase(caseId)}
      />

      {/* ===================================================================== */}
      {/* SECTION 2 (REQUIREMENT 4): VISUAL CRIME STATISTICS CHARTS */}
      {/* ===================================================================== */}
      <CrimeStatisticsCharts
        cases={allCases}
        evidenceList={evidenceList}
        alerts={alerts}
      />

      {/* ===================================================================== */}
      {/* SECTION 3: MAIN OPERATIONAL GRID */}
      {/* ===================================================================== */}
      {isPortfolioView ? (
        /* ------------------------------------------------------------------ */
        /* EXECUTIVE PORTFOLIO VIEW (ALL CASES)                               */
        /* ------------------------------------------------------------------ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): High-Priority Targets Across Cases & Operations Directory */}
          <div className="lg:col-span-2 space-y-6">
            {/* High-Priority Targets Across ALL Cases */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
                <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
                  <Shield className="w-4 h-4" />
                  <span>HIGH-PRIORITY TARGETS ACROSS OPERATIONS ({highPriorityTargetsAcrossCases.length})</span>
                </div>
                <span className="text-[10px] font-mono text-forge-text-muted">
                  SORTED BY RISK SCORE (≥ 75)
                </span>
              </div>

              <div className="space-y-2.5">
                {highPriorityTargetsAcrossCases.slice(0, 6).map((target) => (
                  <div
                    key={target.id}
                    onClick={() => {
                      if (target.caseInfo) {
                        selectCase(target.caseInfo.id);
                      }
                      selectEntity(target);
                    }}
                    className="p-3 bg-forge-bg rounded-lg border border-forge-border hover:border-forge-cyan/50 hover:bg-forge-cardHover cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{target.name}</span>
                        <span className="text-[10px] font-mono text-forge-text-muted">[{target.id}]</span>
                        <EntityRoleBadge role={target.role} />
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-forge-text-muted">
                        <span>Case:</span>
                        <span className="text-forge-cyan font-medium">
                          {target.caseInfo?.name || 'Assigned Operation'}
                        </span>
                        {target.caseInfo?.caseFlags?.includes('WOMEN_RELATED') && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 font-bold">
                            WOMEN-RELATED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[9px] font-mono text-forge-text-muted">THREAT INDEX</div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          {target.riskScore} / 100
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (target.caseInfo) {
                            selectCase(target.caseInfo.id);
                          }
                          selectEntity(target);
                          navigate('/graph');
                        }}
                        className="px-2.5 py-1.5 rounded bg-forge-panel border border-forge-border text-forge-cyan hover:text-white hover:border-forge-cyan transition text-xs font-mono font-medium flex items-center space-x-1"
                        title="Jump to target in Network Graph"
                      >
                        <span>Graph</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Case Directory Portfolio Table */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
                <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
                  <FolderOpen className="w-4 h-4" />
                  <span>INVESTIGATION OPERATIONS DIRECTORY</span>
                </div>
                <span className="text-[10px] font-mono text-forge-text-muted">CENTRAL REGISTRY</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allCases.map((c) => {
                  const isWomen = c.caseFlags?.includes('WOMEN_RELATED');

                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 bg-forge-bg rounded-lg border transition space-y-2.5 flex flex-col justify-between ${
                        isWomen
                          ? 'border-rose-700/50 hover:border-rose-500/60'
                          : 'border-forge-border hover:border-forge-cyan/40'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-white">{c.code}</span>
                            {isWomen && (
                              <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold text-rose-400 bg-rose-950/50 border border-rose-700/40 px-1.5 py-0.5 rounded">
                                <HeartHandshake className="w-2.5 h-2.5" />
                                W-PROT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <CaseStatusBadge status={c.status} />
                            <SeverityBadge level={c.priority} />
                          </div>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{c.name}</h4>
                        <p className="text-[11px] text-forge-text-secondary line-clamp-2">
                          {c.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-forge-border/40 flex items-center justify-between text-xs">
                        <div className="text-[10px] text-forge-text-muted font-mono">
                          {c.metrics.totalEntities} Nodes · {c.evidenceCount} Exhibits
                        </div>
                        <button
                          onClick={() => selectCase(c.id)}
                          className="text-xs font-mono font-bold text-forge-cyan hover:underline flex items-center space-x-1"
                        >
                          <span>Enter Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Critical Portfolio Updates & Live Threat Radar */}
          <div className="space-y-6">
            {/* Critical Updates Across Portfolio */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
                <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
                  <Clock className="w-4 h-4" />
                  <span>CRITICAL RECENT UPDATES (ALL CASES)</span>
                </div>
                <span className="text-[9px] font-mono text-forge-emerald animate-pulse">LIVE</span>
              </div>

              <div className="space-y-2.5">
                {portfolioCriticalUpdates.map((update) => (
                  <div
                    key={update.id}
                    onClick={() => {
                      const matchedCase = allCases.find((c) => c.code === update.caseCode);
                      if (matchedCase) selectCase(matchedCase.id);
                    }}
                    className="p-2.5 bg-forge-bg rounded border border-forge-border hover:border-forge-cyan/40 cursor-pointer transition space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-forge-cyan font-bold">{update.caseName}</span>
                      <span className="text-forge-text-muted">{update.time}</span>
                    </div>
                    <div className="text-white text-xs font-medium leading-snug">
                      {update.title}
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[9px] font-mono">
                      <SeverityBadge level={update.severity} size="xs" />
                      <span className="text-forge-text-muted">Action required</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================= */}
            {/* PREDICTIVE INSIGHTS — Things to Watch (Phase C)               */}
            {/* ============================================================= */}
            <PredictiveInsightsPanel />

            {/* Active Threats Feed Across All Cases */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
                <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>HIGH PRIORITY THREAT RADAR</span>
                </div>
                <button
                  onClick={() => navigate('/alerts')}
                  className="text-[10px] font-mono text-forge-cyan hover:underline"
                >
                  VIEW ALL ({alerts.length})
                </button>
              </div>

              <div className="space-y-2">
                {criticalAlerts.slice(0, 4).map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => selectAlert(alt)}
                    className="p-2.5 bg-forge-bg rounded border border-forge-border hover:border-forge-borderLight cursor-pointer transition space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <SeverityBadge level={alt.severity} size="xs" />
                      <span className="text-forge-text-muted">{alt.id}</span>
                    </div>
                    <div className="font-bold text-white text-xs">{alt.title}</div>
                    <p className="text-[11px] text-forge-text-muted line-clamp-2 leading-relaxed">
                      {alt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Audit Trail Summary */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
                <div className="flex items-center space-x-2 text-forge-emerald font-mono text-xs font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>IMMUTABLE EVIDENCE LEDGER</span>
                </div>
                <button
                  onClick={() => navigate('/audit')}
                  className="text-[10px] font-mono text-forge-cyan hover:underline"
                >
                  AUDIT
                </button>
              </div>

              <div className="space-y-2 text-[11px] font-mono">
                {recentAuditBlocks.map((b) => (
                  <div key={b.id} className="p-2 bg-forge-bg rounded border border-forge-border space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-forge-emerald font-bold">BLOCK #{b.blockIndex}</span>
                      <span className="text-forge-text-muted">{b.timestamp.slice(11, 19)}</span>
                    </div>
                    <div className="text-white text-xs font-sans font-medium">{b.action}</div>
                    <div className="text-[10px] text-forge-text-muted truncate">
                      Hash: {truncateHash(b.blockHash, 8, 8)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* SINGLE CASE COMMAND CENTRE VIEW                                    */
        /* ------------------------------------------------------------------ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Discoveries & Quarantine Review Queue */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Recent Intelligence Discoveries for Current Case */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
                <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>KEY INTELLIGENCE DISCOVERIES ({currentCase.code})</span>
                </div>
                <span className="text-[10px] font-mono text-forge-text-muted">
                  AUTO-GROUNDED BY AGENT SWARM
                </span>
              </div>

              <div className="space-y-3">
                {currentCase.id === 'IF-CASE-2026-0741' ? (
                  /* Operation Rakshak Discoveries */
                  <>
                    <div className="p-3.5 bg-forge-bg rounded-md border border-rose-500/30 hover:border-rose-400 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          CYBER STALKING &amp; VOIP INTERCEPT
                        </span>
                        <span className="font-mono text-[10px] text-forge-emerald font-bold">96% Confidence</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Admin Link Identified: Vicky Rawat &harr; VoIP Virtual Number &harr; Complainant
                      </h4>
                      <p className="text-xs text-forge-text-secondary leading-relaxed">
                        Telegram server backup reveals suspect Rawat configuring virtual Frankfurt VoIP exit gateway to dispatch extortion calls directly to college students.
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-forge-border/40 text-xs font-mono">
                        <span className="text-forge-text-muted text-[10px]">Citations: IF-EVD-020, IF-EVD-023</span>
                        <button
                          onClick={() => {
                            runAiQuery('Show connections for Vicky Rawat');
                            navigate('/graph');
                          }}
                          className="text-forge-cyan hover:underline flex items-center space-x-1 font-semibold"
                        >
                          <span>Highlight in Network Graph</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-forge-bg rounded-md border border-forge-border hover:border-forge-cyan/50 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          UPI TRAIL &amp; MULE AGGREGATOR
                        </span>
                        <span className="font-mono text-[10px] text-forge-emerald font-bold">94% Confidence</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Canara Bank Extortion Remittances Traced to Sameer Merchant
                      </h4>
                      <p className="text-xs text-forge-text-secondary leading-relaxed">
                        ₹12.4 Lakh in student UPI extortion remittances funneled through student mule accounts, followed by immediate cash dispersion at Rohini ATMs.
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-forge-border/40 text-xs font-mono">
                        <span className="text-forge-text-muted text-[10px]">Citations: IF-EVD-021, IF-EVD-022</span>
                        <button
                          onClick={() => {
                            const ev = evidenceService.getEvidenceById('IF-EVD-022');
                            if (ev) selectEvidence(ev);
                          }}
                          className="text-forge-cyan hover:underline flex items-center space-x-1 font-semibold"
                        >
                          <span>Inspect Financial Exhibit</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Standard / Falcon Discoveries */
                  <>
                    <div className="p-3.5 bg-forge-bg rounded-md border border-forge-border hover:border-forge-cyan/50 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
                          TELECOM + FINANCIAL FUSION
                        </span>
                        <span className="font-mono text-[10px] text-forge-emerald font-bold">94% Confidence</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        3-Hop Bridge Discovered: Rajesh Kumar &harr; Burner Phone &harr; Amit Sharma
                      </h4>
                      <p className="text-xs text-forge-text-secondary leading-relaxed">
                        Sequential calls from Vasant Vihar tower to Karol Bagh tower via burner hardware IMEI 861092049182091 occurred 15 minutes before ₹1.85 Cr RTGS Hawala remittance.
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-forge-border/40 text-xs font-mono">
                        <span className="text-forge-text-muted text-[10px]">Citations: IF-EVD-002, IF-EVD-005</span>
                        <button
                          onClick={() => {
                            runAiQuery('Show the strongest connection between Rajesh Kumar and Amit Sharma');
                            navigate('/graph');
                          }}
                          className="text-forge-cyan hover:underline flex items-center space-x-1 font-semibold"
                        >
                          <span>Highlight in Network Graph</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-forge-bg rounded-md border border-forge-border hover:border-forge-cyan/50 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-forge-amber/15 text-forge-amber border border-forge-amber/30">
                          DOCUMENT + AUDIO WIRE INTERCEPT
                        </span>
                        <span className="font-mono text-[10px] text-forge-emerald font-bold">92% Confidence</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Cross-Border Hawala Token Match (500,000 AED)
                      </h4>
                      <p className="text-xs text-forge-text-secondary leading-relaxed">
                        Seized handwritten chit #CH-992 from Surya Bullion matched intercepted phone wiretap #WT-26-088 where Mohd. Tariq confirmed settlement at Deira Gold Souk desk.
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-forge-border/40 text-xs font-mono">
                        <span className="text-forge-text-muted text-[10px]">Citations: IF-EVD-006, IF-EVD-007</span>
                        <button
                          onClick={() => {
                            const ev = evidenceService.getEvidenceById('IF-EVD-006');
                            if (ev) selectEvidence(ev);
                          }}
                          className="text-forge-cyan hover:underline flex items-center space-x-1 font-semibold"
                        >
                          <span>Inspect Token Exhibit</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section 2: Human-in-the-Loop Quarantine Review Queue */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
                <div className="flex items-center space-x-2 text-forge-amber font-mono text-xs font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>HUMAN-IN-THE-LOOP QUARANTINE QUEUE ({unverifiedRelationships.length})</span>
                </div>
                <span className="text-[10px] font-mono text-forge-text-muted">AWAITING INVESTIGATOR APPROVAL</span>
              </div>

              <div className="space-y-3">
                {unverifiedRelationships.map((rel) => {
                  const source = investigationService.getEntityDetails(rel.sourceId);
                  const target = investigationService.getEntityDetails(rel.targetId);

                  return (
                    <div
                      key={rel.id}
                      className="p-3.5 bg-forge-bg rounded-md border border-forge-amber/30 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">
                          {source?.name || rel.sourceId} &rarr; {target?.name || rel.targetId}
                        </span>
                        <span className="text-forge-amber text-[11px] font-bold">
                          {rel.confidence}% Confidence
                        </span>
                      </div>

                      <div className="text-[11px] text-forge-cyan font-sans">{rel.type.replace(/_/g, ' ')}</div>
                      {rel.aiReasoning && (
                        <p className="text-[11px] text-forge-text-secondary font-sans leading-relaxed">
                          {rel.aiReasoning}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-forge-border/40">
                        <button
                          onClick={() => selectRelationship(rel)}
                          className="text-[11px] text-forge-text-muted hover:text-white underline"
                        >
                          Inspect Supporting Evidence ({rel.evidenceIds.length})
                        </button>
                        <button
                          onClick={() => verifyRelationshipAction(rel.id)}
                          className="px-3 py-1 bg-forge-emerald/20 hover:bg-forge-emerald/30 border border-forge-emerald/50 text-forge-emerald rounded text-[11px] font-bold flex items-center space-x-1 transition"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>VERIFY &amp; MINT BLOCK</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Single Case Threats & Watchlist */}
          <div className="space-y-6">
            {/* High-Priority Alerts */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
                <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>CASE THREAT ALERTS</span>
                </div>
                <button
                  onClick={() => navigate('/alerts')}
                  className="text-[10px] font-mono text-forge-cyan hover:underline"
                >
                  VIEW ALL ({alerts.length})
                </button>
              </div>

              <div className="space-y-2">
                {criticalAlerts.slice(0, 4).map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => selectAlert(alt)}
                    className="p-2.5 bg-forge-bg rounded border border-forge-border hover:border-forge-borderLight cursor-pointer transition space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <SeverityBadge level={alt.severity} size="xs" />
                      <span className="text-forge-text-muted">{alt.id}</span>
                    </div>
                    <div className="font-bold text-white text-xs">{alt.title}</div>
                    <p className="text-[11px] text-forge-text-muted line-clamp-2 leading-relaxed">
                      {alt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Suspects Watchlist */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
                <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
                  <Shield className="w-4 h-4" />
                  <span>SUSPECTS WATCHLIST</span>
                </div>
                <span className="text-[10px] font-mono text-forge-text-muted">RISK INDEX ≥ 75</span>
              </div>

              <div className="space-y-2">
                {highRiskEntities.slice(0, 5).map((person: Entity) => (
                  <div
                    key={person.id}
                    onClick={() => selectEntity(person)}
                    className="p-2.5 bg-forge-bg rounded border border-forge-border hover:border-forge-cyan/40 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span>{person.name}</span>
                        <span className="text-[9px] font-mono text-forge-text-muted">[{person.id}]</span>
                      </div>
                      <div className="text-[10px] text-forge-cyan truncate max-w-[170px]">{person.role}</div>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-forge-rose/20 text-forge-rose border border-forge-rose/40">
                      {person.riskScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log Feed */}
            <div className="bg-forge-card border border-forge-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-2.5">
                <div className="flex items-center space-x-2 text-forge-emerald font-mono text-xs font-bold">
                  <Clock className="w-4 h-4" />
                  <span>BLOCKCHAIN ACTIVITY FEED</span>
                </div>
                <button
                  onClick={() => navigate('/audit')}
                  className="text-[10px] font-mono text-forge-cyan hover:underline"
                >
                  LEDGER
                </button>
              </div>

              <div className="space-y-2 text-[11px] font-mono">
                {recentAuditBlocks.map((b) => (
                  <div key={b.id} className="p-2 bg-forge-bg rounded border border-forge-border space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-forge-emerald font-bold">BLOCK #{b.blockIndex}</span>
                      <span className="text-forge-text-muted">{b.timestamp.slice(11, 19)}</span>
                    </div>
                    <div className="text-white text-xs font-sans font-medium">{b.action}</div>
                    <div className="text-[10px] text-forge-text-muted truncate">
                      Hash: {truncateHash(b.blockHash, 8, 8)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
