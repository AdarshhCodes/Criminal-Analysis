import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Network,
  ArrowRight,
  Layers,
  FolderOpen,
  Search,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import {
  investigationService,
  alertService,
  evidenceService,
} from '../services';
import { Case } from '../types';
import {
  SeverityBadge,
  CaseStatusBadge,
  CaseFlagBadge,
  EntityRoleBadge,
} from '../components/common/SeverityBadge';
import { ExecutiveKpiRibbon } from '../components/dashboard/ExecutiveKpiRibbon';
import { CriticalCasesSegment } from '../components/dashboard/CriticalCasesSegment';
import { WomenCrimeSection } from '../components/dashboard/WomenCrimeSection';
import { IndiaCrimeMap } from '../components/dashboard/IndiaCrimeMap';
import { CrimeStatisticsCharts } from '../components/dashboard/CrimeStatisticsCharts';
import { PredictiveInsightsPanel } from '../components/dashboard/PredictiveInsightsPanel';

export const CommandCentrePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentCase,
    selectedCaseId,
    selectCase,
    selectEntity,
  } = useInvestigationStore();

  const isPortfolioView = currentCase.id === 'ALL' || selectedCaseId === 'ALL';

  // Filters & Search state for Multi-Case Management
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'CRITICAL' | 'WOMEN_RELATED' | 'UNDER_REVIEW' | 'CLOSED'
  >('ALL');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'NEWEST' | 'EVIDENCE' | 'TARGETS' | 'VOLUME'>('PRIORITY');

  // Load all operational datasets
  const allCases = investigationService.getCases();
  const entities = investigationService.getEntities(isPortfolioView ? 'ALL' : currentCase.id);
  const relationships = investigationService.getRelationships(isPortfolioView ? 'ALL' : currentCase.id);
  const alerts = alertService.getAlerts(undefined, isPortfolioView ? 'ALL' : currentCase.id);
  const evidenceList = evidenceService.getEvidence(undefined, isPortfolioView ? 'ALL' : currentCase.id);

  // Metrics calculations for Executive KPI Ribbon
  const activeCasesCount = allCases.filter((c) => c.status === 'ACTIVE').length;
  const criticalCasesCount = allCases.filter((c) => c.priority === 'CRITICAL').length;
  const peopleCount = entities.filter((e) => e.type === 'PERSON').length;
  const evidenceCount = evidenceList.length;
  const recentActivityCount = 38; // 24-hr activity count
  const connectionsCount = relationships.length;
  const highRiskLocationsCount = entities.filter((e) => e.type === 'LOCATION' || e.riskScore >= 75).length;
  const pendingReviewsCount = relationships.filter((r) => r.verificationStatus === 'AI_SUGGESTED').length;

  // High priority targets across cases
  const highPriorityTargetsAcrossCases = investigationService.getHighRiskTargets(
    isPortfolioView ? 'ALL' : currentCase.id,
    75
  );

  // Filtered & Sorted Cases list for the Operations Directory
  const filteredAndSortedCases = useMemo(() => {
    let result = allCases;

    // Filter by State if selected from India Map
    if (selectedState) {
      result = result.filter(
        (c) =>
          c.state?.toLowerCase() === selectedState.toLowerCase() ||
          c.location?.toLowerCase().includes(selectedState.toLowerCase())
      );
    }

    // Filter by Status / Flag
    if (statusFilter === 'ACTIVE') {
      result = result.filter((c) => c.status === 'ACTIVE');
    } else if (statusFilter === 'CRITICAL') {
      result = result.filter((c) => c.priority === 'CRITICAL');
    } else if (statusFilter === 'WOMEN_RELATED') {
      result = result.filter(
        (c) =>
          c.caseFlags?.includes('WOMEN_RELATED') ||
          c.category?.toLowerCase().includes('women')
      );
    } else if (statusFilter === 'UNDER_REVIEW') {
      result = result.filter((c) => c.status === 'UNDER_REVIEW');
    } else if (statusFilter === 'CLOSED') {
      result = result.filter((c) => c.status === 'CLOSED');
    }

    // Search query filter (matches title, code, category, location, people, lead officer)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.leadInvestigator.toLowerCase().includes(q) ||
          (c.importantPeople && c.importantPeople.some((p) => p.name.toLowerCase().includes(q)))
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'PRIORITY') {
        const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'EVIDENCE') {
        return b.evidenceCount - a.evidenceCount;
      }
      if (sortBy === 'TARGETS') {
        return b.metrics.totalEntities - a.metrics.totalEntities;
      }
      if (sortBy === 'VOLUME') {
        const getVol = (c: Case) => {
          if (!c.financialActivity?.totalVolume) return 0;
          const match = c.financialActivity.totalVolume.match(/₹([\d.]+)\s*(Crore|Lakh)/i);
          if (!match) return 0;
          const val = parseFloat(match[1]);
          return match[2].toLowerCase() === 'crore' ? val * 100 : val;
        };
        return getVol(b) - getVol(a);
      }
      return 0;
    });
  }, [allCases, selectedState, statusFilter, searchQuery, sortBy]);

  const handleKpiFilterClick = (kpiId: string) => {
    if (kpiId === 'active-cases') setStatusFilter('ACTIVE');
    else if (kpiId === 'critical-cases') setStatusFilter('CRITICAL');
    else if (kpiId === 'people-investigation') navigate('/graph');
    else if (kpiId === 'open-evidence') navigate('/evidence');
    else if (kpiId === 'recent-activity') navigate('/timeline');
    else if (kpiId === 'important-connections') navigate('/graph');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 select-none font-sans">
      {/* ===================================================================== */}
      {/* 1. TOP COMMAND HEADER & SCOPE SWITCHER                                */}
      {/* ===================================================================== */}
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
              ? `Unified surveillance intelligence across ${allCases.length} active operations, inter-state corridors, and threat alerts.`
              : `${currentCase.assignedUnit} · Lead: ${currentCase.leadInvestigator} · ${currentCase.location}`}
          </p>
        </div>

        {/* View Switcher & Action Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Case Switcher Strip */}
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
            className="flex items-center space-x-2 bg-forge-cyan hover:bg-forge-cyanLight text-slate-900 font-mono text-xs font-bold px-3.5 py-2 rounded transition shadow-cyan-glow"
          >
            <Network className="w-4 h-4" />
            <span>{isPortfolioView ? 'PORTFOLIO GRAPH' : 'LAUNCH NETWORK GRAPH'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. EXECUTIVE DASHBOARD KPI SUMMARY CARDS (8 PURPOSEFUL METRICS)       */}
      {/* ===================================================================== */}
      <ExecutiveKpiRibbon
        activeCasesCount={activeCasesCount}
        criticalCasesCount={criticalCasesCount}
        peopleCount={peopleCount}
        evidenceCount={evidenceCount}
        recentActivityCount={recentActivityCount}
        connectionsCount={connectionsCount}
        highRiskLocationsCount={highRiskLocationsCount}
        pendingReviewsCount={pendingReviewsCount}
        onFilterClick={handleKpiFilterClick}
      />

      {/* ===================================================================== */}
      {/* 3. DEDICATED SECTION: CRITICAL & HOT CASES                            */}
      {/* ===================================================================== */}
      <CriticalCasesSegment
        cases={allCases}
        onSelectCase={(caseId) => selectCase(caseId)}
      />

      {/* ===================================================================== */}
      {/* 4. DEDICATED SECTION: WOMEN-RELATED CRIME & PROTECTION                */}
      {/* ===================================================================== */}
      <WomenCrimeSection
        cases={allCases}
        onSelectCase={(caseId) => selectCase(caseId)}
      />

      {/* ===================================================================== */}
      {/* 5. FULL INDIA MAP: NATIONAL GEOGRAPHIC SURVEILLANCE                   */}
      {/* ===================================================================== */}
      <IndiaCrimeMap
        cases={allCases}
        selectedState={selectedState}
        onSelectState={setSelectedState}
        onSelectCase={(caseId) => selectCase(caseId)}
      />

      {/* ===================================================================== */}
      {/* 6. CRIME STATISTICS VISUAL ANALYTICS (CHARTS)                         */}
      {/* ===================================================================== */}
      <CrimeStatisticsCharts
        cases={allCases}
        evidenceList={evidenceList}
        alerts={alerts}
      />

      {/* ===================================================================== */}
      {/* 7. MULTI-CASE MANAGEMENT & OPERATIONS DIRECTORY                       */}
      {/* ===================================================================== */}
      <div className="bg-forge-card border border-forge-border rounded-xl p-5 space-y-4 shadow-xl">
        {/* Directory Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-forge-border/60 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
              <FolderOpen className="w-4 h-4" />
              <span>INVESTIGATION OPERATIONS DIRECTORY</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-forge-cyan/15 text-forge-cyan border border-forge-cyan/30">
                {filteredAndSortedCases.length} Cases
              </span>
            </div>
            <p className="text-xs text-forge-text-muted mt-0.5">
              Comprehensive registry carrying case identifiers, financial volumes, lead teams, key targets, and progress.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-forge-cyan absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases, targets, lead teams..."
              className="w-full bg-forge-bg border border-forge-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan font-mono"
            />
          </div>
        </div>

        {/* Filter Pills & Sort Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-forge-text-muted text-[10px] mr-1">FILTER:</span>
            {[
              { id: 'ALL', label: 'All Cases' },
              { id: 'ACTIVE', label: 'Active Only' },
              { id: 'CRITICAL', label: 'Critical Priority' },
              { id: 'WOMEN_RELATED', label: 'Women-Safety' },
              { id: 'UNDER_REVIEW', label: 'Under Review' },
              { id: 'CLOSED', label: 'Closed / Sealed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded transition text-[11px] ${
                  statusFilter === tab.id
                    ? 'bg-forge-cyan text-slate-900 font-bold shadow-cyan-glow'
                    : 'bg-forge-bg text-forge-text-secondary hover:text-white border border-forge-border'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {selectedState && (
              <span className="px-2 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 text-[11px] flex items-center space-x-1">
                <span>State: {selectedState}</span>
                <button onClick={() => setSelectedState(null)} className="ml-1 hover:text-white">
                  &times;
                </button>
              </span>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-forge-text-muted flex items-center space-x-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>SORT:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-forge-bg border border-forge-border rounded px-2.5 py-1 text-white focus:outline-none focus:border-forge-cyan font-mono text-[11px]"
            >
              <option value="PRIORITY">Priority (Highest First)</option>
              <option value="NEWEST">Start Date (Newest)</option>
              <option value="EVIDENCE">Evidence Exhibit Count</option>
              <option value="TARGETS">Number of Targets</option>
              <option value="VOLUME">Financial Volume</option>
            </select>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedCases.map((caseItem) => {
            const isWomen = caseItem.caseFlags?.includes('WOMEN_RELATED');
            const isCritical = caseItem.priority === 'CRITICAL';

            return (
              <div
                key={caseItem.id}
                className={`p-4 rounded-xl bg-forge-bg border transition space-y-3.5 flex flex-col justify-between group shadow-sm ${
                  isWomen
                    ? 'border-rose-500/40 hover:border-rose-400'
                    : isCritical
                    ? 'border-rose-500/30 hover:border-rose-400'
                    : 'border-forge-border hover:border-forge-cyan/60'
                }`}
              >
                {/* Header: Code, Badges */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="font-mono text-xs font-bold text-white bg-forge-card px-2 py-0.5 rounded border border-forge-border">
                      {caseItem.code}
                    </span>
                    <div className="flex items-center space-x-1">
                      <CaseStatusBadge status={caseItem.status} size="xs" />
                      <SeverityBadge level={caseItem.priority} size="xs" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-forge-cyan transition leading-snug pt-1">
                    {caseItem.name}
                  </h3>

                  <div className="flex items-center space-x-1 text-[11px] font-mono text-forge-text-muted">
                    <MapPin className="w-3 h-3 text-forge-cyan" />
                    <span className="truncate">{caseItem.location}</span>
                  </div>

                  <p className="text-xs text-forge-text-secondary line-clamp-2 leading-relaxed">
                    {caseItem.description}
                  </p>
                </div>

                {/* Important People Chips */}
                {caseItem.importantPeople && caseItem.importantPeople.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-forge-border/40">
                    <div className="text-[10px] font-mono text-forge-text-muted uppercase">
                      Important People:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {caseItem.importantPeople.slice(0, 3).map((p) => (
                        <span
                          key={p.id}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center space-x-1 ${
                            p.classification === 'VICTIM'
                              ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                              : p.classification === 'ACCUSED'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-forge-card text-forge-text-secondary border-forge-border'
                          }`}
                        >
                          <span className="font-bold">{p.name.split(' ')[0]}</span>
                          <span className="opacity-75">({p.classification})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics & Financial Activity */}
                <div className="pt-2 border-t border-forge-border/40 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-forge-text-muted">
                    <span>Evidence Exhibits:</span>
                    <strong className="text-forge-cyan">{caseItem.evidenceCount} Files</strong>
                  </div>

                  {caseItem.financialActivity && (
                    <div className="flex items-center justify-between text-[11px] text-forge-text-muted">
                      <span>Tracked Volume:</span>
                      <strong className="text-forge-amber font-bold">
                        {caseItem.financialActivity.totalVolume}
                      </strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-forge-text-muted">
                    <span>Assigned Unit:</span>
                    <span className="text-white truncate max-w-[160px]">
                      {caseItem.assignedTeam || caseItem.assignedUnit.split(',')[0]}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 border-t border-forge-border/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => selectCase(caseItem.id)}
                    className="flex-1 py-1.5 rounded font-mono text-xs font-semibold bg-forge-card hover:bg-forge-panel text-forge-cyan border border-forge-cyan/40 transition flex items-center justify-center space-x-1"
                  >
                    <span>Load Case</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      selectCase(caseItem.id);
                      navigate('/graph');
                    }}
                    className="p-1.5 rounded bg-forge-card hover:bg-forge-panel border border-forge-border text-forge-text-muted hover:text-white transition"
                    title="Inspect in Network Graph"
                  >
                    <Network className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 8. HIGH-PRIORITY TARGETS & PREDICTIVE INSIGHTS SPLIT GRID             */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: High-Priority Targets Across Cases (7 Cols) */}
        <div className="lg:col-span-7 bg-forge-card border border-forge-border rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
            <div className="flex items-center space-x-2 text-forge-rose font-mono text-xs font-bold">
              <Shield className="w-4 h-4" />
              <span>HIGH-PRIORITY TARGETS ACROSS OPERATIONS ({highPriorityTargetsAcrossCases.length})</span>
            </div>
            <span className="text-[10px] font-mono text-forge-text-muted">SORTED BY THREAT SCORE (≥ 75)</span>
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
                  <div className="flex items-center space-x-2 text-[11px] text-forge-text-muted font-mono">
                    <span>Operation:</span>
                    <span className="text-forge-cyan font-medium">
                      {target.caseInfo?.name || 'Assigned Syndicate'}
                    </span>
                    {target.caseInfo?.caseFlags?.includes('WOMEN_RELATED') && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 font-bold">
                        WOMEN-SAFETY
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 font-mono">
                  <div className="text-right">
                    <div className="text-[9px] text-forge-text-muted">THREAT INDEX</div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
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
                    className="px-2.5 py-1.5 rounded bg-forge-panel border border-forge-border text-forge-cyan hover:text-white hover:border-forge-cyan transition text-xs font-medium flex items-center space-x-1"
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

        {/* Right Column: Predictive Insights & Anomaly Radar (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <PredictiveInsightsPanel />
        </div>
      </div>
    </div>
  );
};
