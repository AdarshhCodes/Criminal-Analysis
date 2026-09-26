import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Users,
  HeartHandshake,
  Landmark,
  ArrowRight,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { investigationService } from '../services';
import { Entity } from '../types';
import {
  SeverityBadge,
  CaseStatusBadge,
  CaseFlagBadge,
} from '../components/common/SeverityBadge';
import { OmniInvestigationSearch } from '../components/investigation/OmniInvestigationSearch';
import { CrossCasePeopleSection } from '../components/investigation/CrossCasePeopleSection';
import { PeopleAnalyticsSection } from '../components/investigation/PeopleAnalyticsSection';
import { FinancialConnectionsSection } from '../components/investigation/FinancialConnectionsSection';
import { PersonProfileModal } from '../components/investigation/PersonProfileModal';

type InvestigationTab = 'SEARCH' | 'CROSS_CASE' | 'PEOPLE_ANALYTICS' | 'FINANCIAL' | 'CASES';

export const InvestigationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { cases, currentCase, selectCase, selectEntity } = useInvestigationStore();

  const [activeTab, setActiveTab] = useState<InvestigationTab>('SEARCH');
  const [selectedPersonForModal, setSelectedPersonForModal] = useState<Entity | null>(null);

  const handleInspectInGraph = (entityId: string) => {
    // If we have an entity, select it and navigate
    const ent =
      investigationService.getEntityById(entityId) ||
      investigationService.getEntities().find((e: Entity) => e.name === entityId);
    if (ent) selectEntity(ent);
    navigate('/graph');
  };

  const tabs: { id: InvestigationTab; label: string; icon: React.ElementType }[] = [
    { id: 'SEARCH', label: 'Investigation Search', icon: Search },
    { id: 'CROSS_CASE', label: 'Cross-Case People', icon: Users },
    { id: 'PEOPLE_ANALYTICS', label: 'People Analytics (Victims / Accused)', icon: HeartHandshake },
    { id: 'FINANCIAL', label: 'Financial Connections', icon: Landmark },
    { id: 'CASES', label: 'Case Dockets Registry', icon: FolderKanban },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 select-none font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
            <FolderKanban className="w-4 h-4" />
            <span>INVESTIGATION OPERATIONS COMMAND &amp; SEARCH</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Investigation Intelligence Workspace
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Cross-case individual linkages, financial transaction conduits, victim safeguard files, and multi-entity discovery.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/graph')}
            className="px-3.5 py-1.5 rounded-lg bg-forge-cyan hover:bg-forge-cyanLight text-slate-950 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <span>Launch Network Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Investigation Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl glass-card border border-white/[0.08] text-xs font-mono">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg flex items-center space-x-2 transition text-xs ${
                isActive
                  ? 'bg-forge-cyan text-slate-950 font-bold shadow-sm'
                  : 'text-forge-text-secondary hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Omni Investigation Search */}
      {activeTab === 'SEARCH' && (
        <OmniInvestigationSearch
          cases={cases}
          onSelectCase={(id) => {
            selectCase(id);
            navigate(`/investigations/${id}`);
          }}
          onSelectPerson={(p) => setSelectedPersonForModal(p)}
          onInspectInGraph={handleInspectInGraph}
        />
      )}

      {/* Tab 2: Cross-Case People Connections */}
      {activeTab === 'CROSS_CASE' && (
        <CrossCasePeopleSection
          onSelectPerson={(p) => setSelectedPersonForModal(p)}
          onSelectCase={(id) => {
            selectCase(id);
            navigate(`/investigations/${id}`);
          }}
          onInspectInGraph={handleInspectInGraph}
        />
      )}

      {/* Tab 3: People Analytics (Victims vs. Accused) */}
      {activeTab === 'PEOPLE_ANALYTICS' && (
        <PeopleAnalyticsSection
          onSelectPerson={(p) => setSelectedPersonForModal(p)}
          onSelectCase={(id) => {
            selectCase(id);
            navigate(`/investigations/${id}`);
          }}
          onInspectInGraph={handleInspectInGraph}
        />
      )}

      {/* Tab 4: Financial & Transaction Connections */}
      {activeTab === 'FINANCIAL' && (
        <FinancialConnectionsSection
          onInspectInGraph={handleInspectInGraph}
          onSelectCase={(id) => {
            selectCase(id);
            navigate(`/investigations/${id}`);
          }}
        />
      )}

      {/* Tab 5: Case Dockets Registry */}
      {activeTab === 'CASES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className={`glass-card rounded-xl p-5 space-y-3 transition flex flex-col justify-between border ${
                c.id === currentCase.id
                  ? 'border-forge-cyan/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-mono text-xs font-bold text-forge-cyan">{c.code}</span>
                  <div className="flex items-center space-x-1.5">
                    <CaseStatusBadge status={c.status} size="xs" />
                    <SeverityBadge level={c.priority} size="xs" />
                    {c.caseFlags?.includes('WOMEN_RELATED') && (
                      <CaseFlagBadge flag="WOMEN_RELATED" size="xs" />
                    )}
                  </div>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{c.name}</h3>
                <p className="text-xs text-forge-text-secondary line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                  <div className="bg-forge-bg/60 p-1.5 rounded-lg border border-white/[0.04]">
                    <div className="text-white font-bold">{c.metrics.totalEntities}</div>
                    <div className="text-[9px] text-forge-text-muted">ENTITIES</div>
                  </div>
                  <div className="bg-forge-bg/60 p-1.5 rounded-lg border border-white/[0.04]">
                    <div className="text-forge-rose font-bold">{c.metrics.highRiskEntities}</div>
                    <div className="text-[9px] text-forge-text-muted">HIGH RISK</div>
                  </div>
                  <div className="bg-forge-bg/60 p-1.5 rounded-lg border border-white/[0.04]">
                    <div className="text-forge-emerald font-bold">{c.evidenceCount}</div>
                    <div className="text-[9px] text-forge-text-muted">EVIDENCE</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => selectCase(c.id)}
                    className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-semibold transition ${
                      c.id === currentCase.id
                        ? 'bg-forge-cyan text-slate-950 font-bold'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08]'
                    }`}
                  >
                    {c.id === currentCase.id ? 'ACTIVE CASE' : 'LOAD CASE'}
                  </button>
                  <Link
                    to={`/investigations/${c.id}`}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-forge-text-muted hover:text-white transition"
                    title="View Case Docket"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Person Profile Modal */}
      <PersonProfileModal
        person={selectedPersonForModal}
        cases={cases}
        onClose={() => setSelectedPersonForModal(null)}
        onSelectCase={(id) => {
          setSelectedPersonForModal(null);
          selectCase(id);
          navigate(`/investigations/${id}`);
        }}
        onInspectInGraph={(id) => {
          setSelectedPersonForModal(null);
          handleInspectInGraph(id);
        }}
      />
    </div>
  );
};
