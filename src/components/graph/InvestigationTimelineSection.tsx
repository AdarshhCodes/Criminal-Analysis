import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  ArrowUpDown,
  PhoneCall,
  Video,
  Landmark,
  Shield,
  MapPin,
  Sparkles,
  ChevronRight,
  User,
  FileSearch,
  Layers,
  Activity,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { investigationService, evidenceService, timelineService } from '../../services';
import { TimelineEventType, Entity } from '../../types';
import { PersonProfileModal } from '../investigation/PersonProfileModal';

interface Props {
  onSwitchToSingleCase?: (caseId: string) => void;
  onSwitchToCrossCase?: () => void;
}

export const InvestigationTimelineSection: React.FC<Props> = ({
  onSwitchToSingleCase,
  onSwitchToCrossCase,
}) => {
  const { selectEvidence, openEvidenceModal } = useInvestigationStore();
  const allCases = investigationService.getCases();

  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<TimelineEventType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Entity | null>(null);

  // Filter tabs
  const categoryFilters: { id: TimelineEventType | 'ALL'; label: string; icon: React.ElementType }[] = [
    { id: 'ALL', label: 'All Activities', icon: Activity },
    { id: 'FIR', label: 'Milestones & FIRs', icon: Shield },
    { id: 'FINANCIAL', label: 'Financial & Hawala', icon: Landmark },
    { id: 'CALL', label: 'Intercepts & Calls', icon: PhoneCall },
    { id: 'CCTV', label: 'Surveillance & CCTV', icon: Video },
    { id: 'LOCATION', label: 'Movement & Raids', icon: MapPin },
    { id: 'AI_FINDING', label: 'AI Intelligence', icon: Sparkles },
  ];

  // Retrieve timeline events
  const rawEvents = timelineService.getTimeline({
    caseId: selectedCaseId === 'ALL' ? undefined : selectedCaseId,
    typeFilter: selectedCategory,
    order: sortAsc ? 'asc' : 'desc',
  });

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return rawEvents;
    const term = searchTerm.toLowerCase();
    return rawEvents.filter(
      (ev) =>
        ev.title.toLowerCase().includes(term) ||
        ev.description.toLowerCase().includes(term) ||
        (ev.location && ev.location.toLowerCase().includes(term)) ||
        (ev.amount && ev.amount.toLowerCase().includes(term))
    );
  }, [rawEvents, searchTerm]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const total = rawEvents.length;
    const financialCount = rawEvents.filter((e) => e.type === 'FINANCIAL').length;
    const interceptCount = rawEvents.filter((e) => e.type === 'CALL' || e.type === 'CCTV').length;
    const milestoneCount = rawEvents.filter((e) => e.type === 'FIR').length;
    return { total, financialCount, interceptCount, milestoneCount };
  }, [rawEvents]);

  const getEventBadge = (type: TimelineEventType) => {
    switch (type) {
      case 'CALL':
        return {
          icon: PhoneCall,
          color: 'text-forge-cyan',
          bg: 'bg-forge-cyan/15 border-forge-cyan/30 text-forge-cyan',
          bar: 'bg-forge-cyan',
        };
      case 'CCTV':
        return {
          icon: Video,
          color: 'text-indigo-400',
          bg: 'bg-indigo-950/40 border-indigo-700/40 text-indigo-300',
          bar: 'bg-indigo-500',
        };
      case 'FINANCIAL':
        return {
          icon: Landmark,
          color: 'text-forge-emerald',
          bg: 'bg-forge-emerald/15 border-forge-emerald/30 text-forge-emerald',
          bar: 'bg-forge-emerald',
        };
      case 'FIR':
        return {
          icon: Shield,
          color: 'text-forge-rose',
          bg: 'bg-rose-950/40 border-rose-700/40 text-rose-300',
          bar: 'bg-forge-rose',
        };
      case 'LOCATION':
        return {
          icon: MapPin,
          color: 'text-forge-amber',
          bg: 'bg-amber-950/40 border-amber-700/40 text-amber-300',
          bar: 'bg-forge-amber',
        };
      case 'AI_FINDING':
        return {
          icon: Sparkles,
          color: 'text-purple-400',
          bg: 'bg-purple-950/40 border-purple-700/40 text-purple-300',
          bar: 'bg-purple-500',
        };
      default:
        return {
          icon: Clock,
          color: 'text-slate-400',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          bar: 'bg-slate-500',
        };
    }
  };

  const handleEntityClick = (entityId: string) => {
    const entity = investigationService.getEntityById(entityId);
    if (entity) {
      setSelectedPerson(entity);
    }
  };

  const handleEvidenceClick = (evidenceId: string) => {
    const ev = evidenceService.getEvidenceById(evidenceId);
    if (ev) {
      selectEvidence(ev);
      openEvidenceModal(ev);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-forge-bg overflow-hidden select-none">
      {/* Top Header / Control HUD */}
      <div className="bg-forge-panel border-b border-forge-border p-4 shrink-0 shadow-panel">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-forge-cyan" />
              <h2 className="text-base font-bold text-white tracking-wide">
                INVESTIGATION ACTIVITY PIPELINE & TIMELINE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/30">
                CHRONO-SEQUENCED
              </span>
            </div>
            <p className="text-xs text-forge-text-muted mt-1">
              Progression of investigation milestones, evidence seizures, intercepts, and financial movements across time
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded bg-forge-card border border-forge-border flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-forge-cyan" />
              <span className="text-forge-text-muted">Total Events:</span>
              <span className="text-white font-bold">{stats.total}</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-forge-card border border-forge-border flex items-center space-x-2">
              <Landmark className="w-3.5 h-3.5 text-forge-emerald" />
              <span className="text-forge-text-muted">Financial:</span>
              <span className="text-forge-emerald font-bold">{stats.financialCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-forge-card border border-forge-border flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-forge-rose" />
              <span className="text-forge-text-muted">FIR/Raids:</span>
              <span className="text-forge-rose font-bold">{stats.milestoneCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-forge-border/50">
          <div className="flex flex-wrap items-center gap-2">
            {/* Case Scope Selector */}
            <div className="flex items-center space-x-1.5 bg-forge-card border border-forge-border rounded px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-forge-cyan" />
              <span className="text-forge-text-muted text-[11px] font-mono">Scope:</span>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none"
              >
                <option value="ALL" className="bg-forge-panel text-white">
                  All Operations (Cross-Case)
                </option>
                {allCases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-forge-panel text-white">
                    {c.code} · {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {categoryFilters.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition ${
                      active
                        ? 'bg-forge-cyan text-slate-950 font-bold shadow-sm'
                        : 'bg-forge-card text-forge-text-secondary hover:text-white hover:bg-forge-cardHover border border-forge-border'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Sort */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-forge-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events, suspects, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-forge-card border border-forge-border rounded pl-8 pr-3 py-1 text-xs text-white placeholder-forge-text-muted focus:outline-none focus:border-forge-cyan w-56 font-sans"
              />
            </div>

            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-forge-card border border-forge-border text-xs font-mono text-forge-text-secondary hover:text-white transition"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-forge-cyan" />
              <span>{sortAsc ? 'OLDEST FIRST' : 'NEWEST FIRST'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Timeline Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 text-forge-text-muted font-mono text-xs">
            No events match the selected filter criteria.
          </div>
        ) : (
          <div className="max-w-5xl mx-auto relative">
            {/* Central Vertical Timeline Rule */}
            <div className="absolute left-4 lg:left-28 top-3 bottom-3 w-0.5 bg-gradient-to-b from-forge-cyan/40 via-forge-border to-forge-border/20 pointer-events-none" />

            <div className="space-y-6">
              {filteredEvents.map((event) => {
                const badge = getEventBadge(event.type);
                const Icon = badge.icon;
                const relatedCase = event.caseId ? investigationService.getCaseById(event.caseId) : null;
                const dateObj = new Date(event.timestamp);
                const dateStr = dateObj.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const timeStr = dateObj.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={event.id} className="relative flex items-start gap-4 lg:gap-6 group">
                    {/* Timestamp for Desktop */}
                    <div className="hidden lg:block w-24 shrink-0 text-right font-mono text-xs pt-1">
                      <div className="text-white font-bold">{dateStr}</div>
                      <div className="text-[11px] text-forge-text-muted">{timeStr}</div>
                    </div>

                    {/* Timeline Node Marker */}
                    <div className="relative z-10 shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${
                          badge.bg
                        } border-current`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Event Detail Card */}
                    <div className="flex-1 bg-forge-card/90 backdrop-blur border border-forge-border hover:border-forge-cyan/40 rounded-lg p-4 shadow-panel transition group-hover:bg-forge-cardHover/70">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forge-border/40 pb-2.5 mb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badge.bg}`}
                          >
                            {event.type}
                          </span>

                          {relatedCase && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-bg text-forge-cyan border border-forge-border">
                              {relatedCase.code} · {relatedCase.name}
                            </span>
                          )}

                          <span className="text-[11px] font-mono text-forge-text-muted">
                            {event.id}
                          </span>
                        </div>

                        {/* Mobile date */}
                        <div className="lg:hidden text-[11px] font-mono text-forge-text-muted">
                          {dateStr} · {timeStr}
                        </div>

                        {/* Financial Amount pill if any */}
                        {event.amount && (
                          <span className="text-xs font-mono font-bold text-forge-emerald bg-forge-emerald/10 border border-forge-emerald/30 px-2.5 py-0.5 rounded flex items-center space-x-1">
                            <Landmark className="w-3 h-3" />
                            <span>{event.amount}</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-sm font-bold text-white group-hover:text-forge-cyan transition">
                        {event.title}
                      </h3>
                      <p className="text-xs text-forge-text-secondary mt-1.5 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Location Metadata */}
                      {event.location && (
                        <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-forge-amber font-mono">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>Location: {event.location}</span>
                        </div>
                      )}

                      {/* Tagged Entities & Evidence */}
                      <div className="mt-3.5 pt-3 border-t border-forge-border/40 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Tagged People / Entities */}
                          {event.entityIds.map((eid) => {
                            const ent = investigationService.getEntityById(eid);
                            if (!ent) return null;
                            return (
                              <button
                                key={eid}
                                onClick={() => handleEntityClick(eid)}
                                className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-forge-bg hover:bg-forge-cyan/20 border border-forge-border hover:border-forge-cyan/40 text-[11px] font-mono text-forge-text-primary hover:text-forge-cyan transition"
                                title="Inspect Person Dossier"
                              >
                                <User className="w-3 h-3 text-forge-cyan" />
                                <span>{ent.name}</span>
                                {ent.role && (
                                  <span className="text-[9px] text-forge-text-muted uppercase">
                                    ({ent.role})
                                  </span>
                                )}
                              </button>
                            );
                          })}

                          {/* Tagged Evidence Items */}
                          {event.evidenceIds.map((evid) => {
                            const ev = evidenceService.getEvidenceById(evid);
                            if (!ev) return null;
                            return (
                              <button
                                key={evid}
                                onClick={() => handleEvidenceClick(evid)}
                                className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-forge-bg hover:bg-indigo-950/60 border border-forge-border hover:border-indigo-500/40 text-[11px] font-mono text-indigo-300 transition"
                                title="View Forensic Evidence Exhibit"
                              >
                                <FileSearch className="w-3 h-3 text-indigo-400" />
                                <span>{ev.title}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Interactive Graph Jump Shortcuts */}
                        <div className="flex items-center space-x-2">
                          {relatedCase && onSwitchToSingleCase && (
                            <button
                              onClick={() => onSwitchToSingleCase(relatedCase.id)}
                              className="text-[11px] font-mono text-forge-cyan hover:text-white flex items-center space-x-1 transition"
                              title="Explore deep crime board for this operation"
                            >
                              <span>Inspect Case DAG</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onSwitchToCrossCase && (
                            <button
                              onClick={onSwitchToCrossCase}
                              className="text-[11px] font-mono text-forge-text-muted hover:text-forge-cyan flex items-center space-x-1 transition"
                              title="View in Cross-Case Network"
                            >
                              <span>Cross-Case Hub</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Person Dossier Modal */}
      {selectedPerson && (
        <PersonProfileModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onSelectCase={(caseId) => {
            setSelectedPerson(null);
            if (onSwitchToSingleCase) {
              onSwitchToSingleCase(caseId);
            }
          }}
        />
      )}
    </div>
  );
};
