import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  User,
  FolderKanban,
  FileSearch,
  MapPin,
  Landmark,
  Shield,
  ArrowRight,
  Activity,
  Network,
} from 'lucide-react';
import { Case, Entity } from '../../types';
import { investigationService, auditService } from '../../services';
import {
  SeverityBadge,
  CaseStatusBadge,
  PersonClassificationBadge,
  EntityRoleBadge,
} from '../common/SeverityBadge';

interface OmniInvestigationSearchProps {
  cases: Case[];
  onSelectCase: (caseId: string) => void;
  onSelectPerson: (person: Entity) => void;
  onInspectInGraph: (entityId: string) => void;
}

type SearchCategory = 'ALL' | 'CASE' | 'PERSON' | 'EVIDENCE' | 'LOCATION' | 'TRANSACTION' | 'ORGANIZATION';

export const OmniInvestigationSearch: React.FC<OmniInvestigationSearchProps> = ({
  cases,
  onSelectCase,
  onSelectPerson,
  onInspectInGraph,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL');
  const [selectedCaseScope, setSelectedCaseScope] = useState<string>('ALL');

  // Perform omni search
  const searchResults = useMemo(() => {
    return investigationService.omniSearch(
      searchQuery,
      activeCategory,
      selectedCaseScope === 'ALL' ? undefined : selectedCaseScope
    );
  }, [searchQuery, activeCategory, selectedCaseScope]);

  // Audit log search execution
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => {
        auditService.logSearch(searchQuery.trim(), searchResults.totalCount);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, searchResults.totalCount]);

  const categories: { id: SearchCategory; label: string; icon: React.ElementType }[] = [
    { id: 'ALL', label: 'All Results', icon: Activity },
    { id: 'CASE', label: 'Cases', icon: FolderKanban },
    { id: 'PERSON', label: 'People', icon: User },
    { id: 'EVIDENCE', label: 'Evidence', icon: FileSearch },
    { id: 'LOCATION', label: 'Locations', icon: MapPin },
    { id: 'TRANSACTION', label: 'Transactions', icon: Landmark },
    { id: 'ORGANIZATION', label: 'Organizations', icon: Shield },
  ];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Search Header Bar */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs font-bold">
              <Search className="w-4 h-4" />
              <span>UNIVERSAL INVESTIGATION SEARCH &amp; CROSS-ENTITY DISCOVERY</span>
            </div>
            <p className="text-xs text-forge-text-muted mt-0.5">
              Query cases, individuals, evidence exhibits, transit locations, financial transactions, and shell entities.
            </p>
          </div>

          {/* Scope Selector */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-forge-text-muted text-[11px]">SCOPE:</span>
            <select
              value={selectedCaseScope}
              onChange={(e) => setSelectedCaseScope(e.target.value)}
              className="bg-forge-bg border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-forge-cyan"
            >
              <option value="ALL">All Operations (Pan-India)</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name.slice(0, 28)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-forge-cyan absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type person name, bank account, location, case code, IMEI, vehicle number, or tag..."
            className="w-full bg-forge-bg/90 border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan font-mono transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-forge-text-muted hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.06] text-xs font-mono">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition text-xs ${
                  isActive
                    ? 'bg-forge-cyan text-slate-950 font-bold shadow-sm'
                    : 'bg-white/[0.03] text-forge-text-secondary hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}

          <span className="ml-auto text-[11px] font-mono text-forge-text-muted">
            Found <strong className="text-white">{searchResults.totalCount}</strong> matching records
          </span>
        </div>
      </div>

      {/* Search Results Sections */}
      <div className="space-y-6">
        {/* Section 1: Cases */}
        {searchResults.cases.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 font-mono text-xs font-bold text-forge-cyan">
              <FolderKanban className="w-4 h-4" />
              <span>CASES &amp; OPERATIONS ({searchResults.cases.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className="glass-card p-4 rounded-xl space-y-3 border border-white/[0.06] hover:border-forge-cyan/40 hover:bg-white/[0.02] cursor-pointer transition flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                        {c.code}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <CaseStatusBadge status={c.status} size="xs" />
                        <SeverityBadge level={c.priority} size="xs" />
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-forge-cyan transition leading-snug">
                      {c.name}
                    </h4>
                    <div className="flex items-center space-x-1 text-xs text-forge-text-muted font-mono">
                      <MapPin className="w-3 h-3 text-forge-amber" />
                      <span className="truncate">{c.location}</span>
                    </div>
                    <p className="text-xs text-forge-text-secondary line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <span className="text-forge-text-muted">{c.evidenceCount} Exhibits</span>
                    <span className="text-forge-cyan flex items-center space-x-1 group-hover:text-white transition">
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: People */}
        {searchResults.people.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 font-mono text-xs font-bold text-sky-400">
              <User className="w-4 h-4" />
              <span>PEOPLE &amp; TARGETS ({searchResults.people.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.people.map((p) => {
                const ownerCase = investigationService.getCaseForEntity(p.id);
                const isCross = ['IF-P-063', 'IF-P-001', 'IF-P-004', 'IF-P-005'].includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPerson(p)}
                    className="glass-card p-4 rounded-xl space-y-3 border border-white/[0.06] hover:border-sky-400/40 hover:bg-white/[0.02] cursor-pointer transition flex flex-col justify-between group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">
                          {p.name}
                        </span>
                        <div className="flex items-center space-x-1">
                          <PersonClassificationBadge classification={p.personClassification} size="xs" />
                          {isCross && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                              CROSS-CASE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <EntityRoleBadge role={p.role} size="xs" />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-forge-text-muted border border-white/[0.06]">
                          {p.id}
                        </span>
                      </div>

                      <div className="text-xs text-forge-text-secondary font-mono flex items-center justify-between pt-1">
                        <span>Case: <strong className="text-forge-cyan">{ownerCase?.code || 'Falcon IF-0882'}</strong></span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            p.riskScore >= 80
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-teal-500/20 text-teal-400'
                          }`}
                        >
                          Threat: {p.riskScore}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectInGraph(p.id);
                        }}
                        className="text-forge-cyan hover:text-white flex items-center space-x-1"
                      >
                        <Network className="w-3 h-3" />
                        <span>Graph</span>
                      </button>
                      <span className="text-forge-text-muted group-hover:text-white transition flex items-center space-x-1">
                        <span>View Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Locations & Organizations */}
        {(searchResults.locations.length > 0 || searchResults.organizations.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Locations */}
            {searchResults.locations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold text-amber-400">
                  <MapPin className="w-4 h-4" />
                  <span>MONITORED LOCATIONS ({searchResults.locations.length})</span>
                </div>
                <div className="space-y-2">
                  {searchResults.locations.map((loc) => (
                    <div
                      key={loc.id}
                      onClick={() => onInspectInGraph(loc.id)}
                      className="glass-card p-3 rounded-xl border border-white/[0.06] hover:border-amber-400/40 cursor-pointer transition flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center space-x-2.5">
                        <MapPin className="w-4 h-4 text-forge-amber shrink-0" />
                        <div>
                          <div className="font-bold text-white">{loc.name}</div>
                          <div className="text-[10px] text-forge-text-muted">{loc.id}</div>
                        </div>
                      </div>
                      <span className="text-forge-cyan flex items-center space-x-1 text-[11px]">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organizations */}
            {searchResults.organizations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold text-indigo-400">
                  <Shield className="w-4 h-4" />
                  <span>ORGANIZATIONS &amp; SHELL ENTITIES ({searchResults.organizations.length})</span>
                </div>
                <div className="space-y-2">
                  {searchResults.organizations.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => onInspectInGraph(org.id)}
                      className="glass-card p-3 rounded-xl border border-white/[0.06] hover:border-indigo-400/40 cursor-pointer transition flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white">{org.name}</div>
                          <div className="text-[10px] text-forge-text-muted">{org.role}</div>
                        </div>
                      </div>
                      <span className="text-forge-cyan flex items-center space-x-1 text-[11px]">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {searchResults.totalCount === 0 && (
          <div className="p-12 text-center glass-card rounded-xl border border-white/[0.06] space-y-3 font-mono">
            <Search className="w-8 h-8 text-forge-text-muted mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-white">No Matching Investigation Records</h4>
            <p className="text-xs text-forge-text-muted max-w-sm mx-auto">
              No results found for &quot;{searchQuery}&quot;. Try adjusting your keywords or changing the entity filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('ALL');
                setSelectedCaseScope('ALL');
              }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-forge-cyan/20 hover:bg-forge-cyan/30 text-forge-cyan border border-forge-cyan/40 text-xs font-bold transition"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
