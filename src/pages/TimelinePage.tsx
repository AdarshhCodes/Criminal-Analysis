import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Filter,
  ArrowUpDown,
  PhoneCall,
  Video,
  Landmark,
  Shield,
  MapPin,
  Cpu,
  Share2,
  FileSearch,
  ExternalLink,
  User,
  X,
} from 'lucide-react';
import { useInvestigationStore } from '../stores';
import { timelineService, investigationService, evidenceService } from '../services';
import { TimelineEventType, Entity, Evidence } from '../types';

export const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    timelineFilter,
    setTimelineFilter,
    selectedEntity,
    selectEntity,
    selectEvidence,
    openEvidenceModal,
  } = useInvestigationStore();

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBySelectedEntityOnly, setFilterBySelectedEntityOnly] = useState(false);

  // Map user-facing labels to internal TimelineEventType
  const filterTabs: { label: string; value: TimelineEventType | 'ALL' }[] = [
    { label: 'ALL', value: 'ALL' },
    { label: 'CALLS', value: 'CALL' },
    { label: 'CCTV', value: 'CCTV' },
    { label: 'FINANCIAL', value: 'FINANCIAL' },
    { label: 'FIR', value: 'FIR' },
    { label: 'LOCATION', value: 'LOCATION' },
    { label: 'AI FINDINGS', value: 'AI_FINDING' },
  ];

  // Retrieve timeline events
  const events = timelineService.getTimeline({
    typeFilter: timelineFilter,
    order: sortOrder,
    entityId: filterBySelectedEntityOnly && selectedEntity ? selectedEntity.id : undefined,
  });

  const handleSelectTimelineCard = (entityIds: string[], evidenceIds?: string[]) => {
    if (entityIds.length > 0) {
      const ent = investigationService.getEntityById(entityIds[0]);
      if (ent) selectEntity(ent);
    }
    if (evidenceIds && evidenceIds.length > 0) {
      const ev = evidenceService.getEvidenceById(evidenceIds[0]);
      if (ev) selectEvidence(ev);
    }
  };

  const handleFocusInGraph = (entityId: string) => {
    const ent = investigationService.getEntityById(entityId);
    if (ent) {
      selectEntity(ent);
    }
    navigate('/graph');
  };

  const getEventBadge = (type: TimelineEventType) => {
    switch (type) {
      case 'CALL':
        return {
          icon: <PhoneCall className="w-3.5 h-3.5 text-forge-cyan" />,
          bg: 'bg-forge-cyan/15 text-forge-cyan border-forge-cyan/30',
          dot: 'border-forge-cyan bg-forge-cyan/30',
        };
      case 'CCTV':
        return {
          icon: <Video className="w-3.5 h-3.5 text-indigo-400" />,
          bg: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40',
          dot: 'border-indigo-500 bg-indigo-500/30',
        };
      case 'FINANCIAL':
        return {
          icon: <Landmark className="w-3.5 h-3.5 text-forge-emerald" />,
          bg: 'bg-forge-emerald/15 text-forge-emerald border-forge-emerald/30',
          dot: 'border-forge-emerald bg-forge-emerald/30',
        };
      case 'FIR':
        return {
          icon: <Shield className="w-3.5 h-3.5 text-rose-400" />,
          bg: 'bg-rose-950/40 text-rose-400 border-rose-800/40',
          dot: 'border-rose-500 bg-rose-500/30',
        };
      case 'LOCATION':
        return {
          icon: <MapPin className="w-3.5 h-3.5 text-forge-amber" />,
          bg: 'bg-forge-amber/15 text-forge-amber border-forge-amber/30',
          dot: 'border-forge-amber bg-forge-amber/30',
        };
      case 'AI_FINDING':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-cyan-300" />,
          bg: 'bg-cyan-950/40 text-cyan-300 border-cyan-700/40',
          dot: 'border-cyan-400 bg-cyan-400/30',
        };
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5 text-forge-text-muted" />,
          bg: 'bg-forge-card text-white border-forge-border',
          dot: 'border-forge-border bg-forge-card',
        };
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-forge-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-forge-cyan font-mono text-xs">
            <Clock className="w-4 h-4" />
            <span>OPERATION FALCON // TEMPORAL CORRELATION CHRONOLOGY</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Investigation Timeline
          </h1>
          <p className="text-xs text-forge-text-muted mt-0.5">
            Temporal alignment of intercepts, surveillance cameras, toll crossings, and Hawala transfers.
          </p>
        </div>

        {/* Sort & Quick Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-forge-card hover:bg-forge-cardHover border border-forge-border rounded text-xs font-mono text-white transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-forge-cyan" />
            <span>ORDER: {sortOrder === 'asc' ? 'OLDEST FIRST' : 'NEWEST FIRST'}</span>
          </button>
        </div>
      </div>

      {/* Entity Focus Banner if entity selected */}
      {selectedEntity && (
        <div className="p-3 bg-forge-card border border-forge-cyan/40 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <User className="w-4 h-4 text-forge-cyan" />
            <span className="text-forge-text-muted">Selected Target:</span>
            <span className="font-bold text-white">{selectedEntity.name}</span>
            <span className="font-mono text-[10px] text-forge-cyan bg-forge-bg px-2 py-0.5 rounded border border-forge-border">
              {selectedEntity.id}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterBySelectedEntityOnly(!filterBySelectedEntityOnly)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                filterBySelectedEntityOnly
                  ? 'bg-forge-cyan text-black font-bold'
                  : 'bg-forge-bg hover:bg-forge-card border border-forge-border text-forge-cyan'
              }`}
            >
              {filterBySelectedEntityOnly ? 'Filtering Active (Reset)' : 'Filter by this Entity'}
            </button>
            {filterBySelectedEntityOnly && (
              <button
                onClick={() => setFilterBySelectedEntityOnly(false)}
                className="p-1 text-forge-text-muted hover:text-white"
                title="Clear Entity Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between bg-forge-card p-2 rounded-lg border border-forge-border text-xs overflow-x-auto">
        <div className="flex items-center space-x-1.5 min-w-max">
          <Filter className="w-3.5 h-3.5 text-forge-text-muted ml-2 mr-1" />
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTimelineFilter(tab.value)}
              className={`px-3 py-1.5 rounded font-mono font-medium transition ${
                timelineFilter === tab.value
                  ? 'bg-forge-cyan/20 text-forge-cyan border border-forge-cyan/40 shadow-sm'
                  : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="font-mono text-[11px] text-forge-text-muted pr-2 hidden sm:block">
          {events.length} Event{events.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Timeline Rail */}
      {events.length > 0 ? (
        <div className="relative border-l-2 border-forge-cyan/30 ml-4 pl-6 space-y-6">
          {events.map((ev) => {
            const badge = getEventBadge(ev.type);
            const isEntityLinked = selectedEntity && ev.entityIds.includes(selectedEntity.id);

            return (
              <div
                key={ev.id}
                onClick={() => handleSelectTimelineCard(ev.entityIds, ev.evidenceIds)}
                className="relative group cursor-pointer"
              >
                {/* Timeline Dot with Pulse on Hover */}
                <div
                  className={`absolute -left-[32px] top-3.5 w-4 h-4 rounded-full border-2 transition duration-200 group-hover:scale-125 ${
                    badge.dot
                  } ${isEntityLinked ? 'ring-4 ring-forge-cyan/30' : ''}`}
                />

                {/* Event Card */}
                <div
                  className={`bg-forge-card border rounded-lg p-4 space-y-3 transition duration-150 ${
                    isEntityLinked
                      ? 'border-forge-cyan/60 bg-forge-card/90 shadow-lg shadow-cyan-950/20'
                      : 'border-forge-border hover:border-forge-borderLight hover:bg-forge-cardHover'
                  }`}
                >
                  {/* Top Row: Type Badge + Formatted Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold border ${badge.bg}`}
                      >
                        {badge.icon}
                        <span>{ev.type}</span>
                      </span>
                      {ev.amount && (
                        <span className="font-mono text-[11px] font-bold text-forge-emerald bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/30">
                          {ev.amount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 font-mono text-[11px] text-forge-text-muted">
                      <span>
                        {new Date(ev.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Narrative Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-forge-cyan transition">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-forge-text-secondary leading-relaxed mt-1 font-sans">
                      {ev.description}
                    </p>
                  </div>

                  {/* Metadata & Quick Links */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-forge-border/50 text-[11px] font-mono">
                    {/* Related Entities */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-forge-text-muted text-[10px]">ENTITIES:</span>
                      {ev.entityIds.map((id) => {
                        const ent: Entity | undefined = investigationService.getEntityById(id);
                        return (
                          <button
                            key={id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (ent) selectEntity(ent);
                            }}
                            className="px-2 py-0.5 rounded bg-forge-bg hover:bg-forge-cyan/20 hover:text-forge-cyan border border-forge-border text-[10px] text-forge-text-primary transition"
                            title={ent ? `${ent.name} (${ent.type})` : id}
                          >
                            {ent ? ent.name : id}
                          </button>
                        );
                      })}
                    </div>

                    {/* Associated Evidence Chips */}
                    {ev.evidenceIds && ev.evidenceIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-forge-text-muted text-[10px]">EXHIBIT:</span>
                        {ev.evidenceIds.map((evId) => {
                          const exhibit: Evidence | undefined = evidenceService.getEvidenceById(evId);
                          return (
                            <button
                              key={evId}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (exhibit) openEvidenceModal(exhibit);
                              }}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-forge-cyan/15 hover:bg-forge-cyan/30 border border-forge-cyan/30 text-forge-cyan text-[10px] font-bold transition"
                            >
                              <FileSearch className="w-3 h-3" />
                              <span>{evId}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer Row: Location & Graph Focus */}
                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-forge-text-muted">
                    {ev.location ? (
                      <span className="text-forge-amber flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{ev.location}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {ev.entityIds.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFocusInGraph(ev.entityIds[0]);
                        }}
                        className="inline-flex items-center space-x-1 text-forge-cyan hover:underline"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Focus on Graph</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-forge-card rounded-lg border border-forge-border">
          <Clock className="w-10 h-10 text-forge-cyan/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Chronology Events Found</h3>
          <p className="text-xs text-forge-text-muted mt-1 max-w-sm mx-auto">
            There are no investigation timeline records matching the active filter criteria.
          </p>
          <button
            onClick={() => {
              setTimelineFilter('ALL');
              setFilterBySelectedEntityOnly(false);
            }}
            className="mt-4 px-3 py-1.5 bg-forge-bg hover:bg-forge-panel border border-forge-border rounded text-xs text-forge-cyan font-mono transition"
          >
            Reset All Chronology Filters
          </button>
        </div>
      )}
    </div>
  );
};
