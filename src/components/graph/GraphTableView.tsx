import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RotateCcw,
  Shield,
  Network,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { investigationService } from '../../services';

export const GraphTableView: React.FC = () => {
  const { currentCase, selectEntity, selectRelationship } = useInvestigationStore();
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'RELATIONSHIPS'>('ENTITIES');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const entities = useMemo(() => {
    return investigationService.getEntities(currentCase.id);
  }, [currentCase.id]);

  const relationships = useMemo(() => {
    return investigationService.getRelationships(currentCase.id);
  }, [currentCase.id]);

  const entityNameMap = useMemo(() => {
    const map = new Map<string, string>();
    entities.forEach((e) => map.set(e.id, e.name));
    return map;
  }, [entities]);

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      const matchesSearch =
        searchQuery === '' ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.role && e.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.primaryIdentifier && e.primaryIdentifier.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'ALL' || e.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [entities, searchQuery, typeFilter, statusFilter]);

  const filteredRelationships = useMemo(() => {
    return relationships.filter((r) => {
      const sourceName = entityNameMap.get(r.sourceId) || r.sourceId;
      const targetName = entityNameMap.get(r.targetId) || r.targetId;
      const predicate = r.label || r.type;

      const matchesSearch =
        searchQuery === '' ||
        sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        predicate.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || r.verificationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [relationships, entityNameMap, searchQuery, statusFilter]);

  return (
    <div className="w-full h-full flex flex-col bg-forge-bg overflow-hidden p-4 space-y-4 font-sans">
      {/* Top Filter & Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-forge-card border border-forge-border rounded-lg p-3">
        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('ENTITIES')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 transition ${
              activeTab === 'ENTITIES'
                ? 'bg-forge-cyan text-slate-900 font-bold'
                : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>MAPPED ENTITIES ({entities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('RELATIONSHIPS')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 transition ${
              activeTab === 'RELATIONSHIPS'
                ? 'bg-forge-cyan text-slate-900 font-bold'
                : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>NETWORK EDGES ({relationships.length})</span>
          </button>
        </div>

        {/* Search & Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-forge-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'ENTITIES' ? 'Search entity name, role, ID...' : 'Search source, target, link...'}
              className="w-full bg-forge-bg border border-forge-border rounded pl-8 pr-3 py-1 text-xs text-white placeholder:text-forge-text-muted focus:outline-none focus:border-forge-cyan font-mono"
            />
          </div>

          {/* Type Filter for Entities */}
          {activeTab === 'ENTITIES' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-forge-bg border border-forge-border text-white text-xs rounded px-2.5 py-1 focus:outline-none focus:border-forge-cyan font-mono"
            >
              <option value="ALL">All Types</option>
              <option value="PERSON">Persons</option>
              <option value="PHONE">Phones</option>
              <option value="BANK_ACCOUNT">Bank Accounts</option>
              <option value="LOCATION">Locations</option>
              <option value="VEHICLE">Vehicles</option>
              <option value="ORGANIZATION">Organizations</option>
            </select>
          )}

          {/* Reset Filters */}
          {(searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="p-1 rounded bg-forge-bg hover:bg-forge-cardHover text-forge-text-muted hover:text-white border border-forge-border transition"
              title="Reset Table Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 bg-forge-card border border-forge-border rounded-lg overflow-hidden flex flex-col shadow-panel">
        <div className="flex-1 overflow-auto">
          {activeTab === 'ENTITIES' ? (
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-forge-panel border-b border-forge-border text-forge-text-muted font-mono text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="p-3">ENTITY ID</th>
                  <th className="p-3">NAME &amp; ALIASES</th>
                  <th className="p-3">TYPE</th>
                  <th className="p-3">OPERATIONAL ROLE</th>
                  <th className="p-3">PRIMARY IDENTIFIER</th>
                  <th className="p-3 text-right">RISK SCORE</th>
                  <th className="p-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forge-border/40 font-mono text-[11px]">
                {filteredEntities.length > 0 ? (
                  filteredEntities.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => selectEntity(e)}
                      className="hover:bg-forge-cardHover cursor-pointer transition"
                    >
                      <td className="p-3 text-forge-cyan font-bold">{e.id}</td>
                      <td className="p-3 text-white font-semibold font-sans">
                        {e.name}
                        {e.aliases && e.aliases.length > 0 && (
                          <div className="text-[10px] text-forge-text-muted font-normal">
                            a.k.a. {e.aliases.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded bg-forge-bg border border-forge-border text-[10px] text-forge-text-secondary">
                          {e.type}
                        </span>
                      </td>
                      <td className="p-3 text-forge-text-secondary font-sans">{e.role || '—'}</td>
                      <td className="p-3 text-forge-text-muted">{e.primaryIdentifier || '—'}</td>
                      <td className="p-3 text-right font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            e.riskScore >= 75
                              ? 'bg-forge-rose/20 text-forge-rose'
                              : e.riskScore >= 50
                              ? 'bg-forge-amber/20 text-forge-amber'
                              : 'bg-forge-emerald/20 text-forge-emerald'
                          }`}
                        >
                          {e.riskScore}/100
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            selectEntity(e);
                          }}
                          className="px-2 py-1 rounded bg-forge-bg hover:bg-forge-panel border border-forge-border text-forge-cyan text-[10px] inline-flex items-center space-x-1"
                        >
                          <span>DOSSIER</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-forge-text-muted font-mono">
                      No entities match the current query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-forge-panel border-b border-forge-border text-forge-text-muted font-mono text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="p-3">SOURCE ENTITY</th>
                  <th className="p-3">RELATIONSHIP NEXUS</th>
                  <th className="p-3">TARGET ENTITY</th>
                  <th className="p-3">VERIFICATION STATUS</th>
                  <th className="p-3 text-right">CONFIDENCE</th>
                  <th className="p-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forge-border/40 font-mono text-[11px]">
                {filteredRelationships.length > 0 ? (
                  filteredRelationships.map((r) => {
                    const sourceName = entityNameMap.get(r.sourceId) || r.sourceId;
                    const targetName = entityNameMap.get(r.targetId) || r.targetId;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => selectRelationship(r)}
                        className="hover:bg-forge-cardHover cursor-pointer transition"
                      >
                        <td className="p-3 text-white font-semibold">{sourceName}</td>
                        <td className="p-3">
                          <span className="font-bold text-forge-cyan px-2 py-0.5 rounded bg-forge-bg border border-forge-border text-[10px]">
                            {r.label || r.type}
                          </span>
                        </td>
                        <td className="p-3 text-white font-semibold">{targetName}</td>
                        <td className="p-3">
                          {r.verificationStatus === 'HUMAN_VERIFIED' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-forge-emerald/15 text-forge-emerald text-[10px] font-bold border border-forge-emerald/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>HUMAN VERIFIED</span>
                            </span>
                          ) : r.verificationStatus === 'REJECTED' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 text-[10px] font-bold border border-rose-800/40">
                              <XCircle className="w-3 h-3" />
                              <span>REJECTED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-forge-amber/15 text-forge-amber text-[10px] font-bold border border-forge-amber/30">
                              <AlertTriangle className="w-3 h-3" />
                              <span>AI SUGGESTED</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-forge-cyan">{r.confidence}%</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              selectRelationship(r);
                            }}
                            className="px-2 py-1 rounded bg-forge-bg hover:bg-forge-panel border border-forge-border text-forge-cyan text-[10px] inline-flex items-center space-x-1"
                          >
                            <span>INSPECT</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-forge-text-muted font-mono">
                      No relationships match the current query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
