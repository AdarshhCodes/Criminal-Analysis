import React, { useState } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { timelineService, evidenceService } from '../../services';

export const GraphBottomTimeline: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedEntity, openEvidenceModal } = useInvestigationStore();

  const events = timelineService.getTimeline({
    entityId: selectedEntity ? selectedEntity.id : undefined,
    order: 'asc',
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none select-none font-mono">
      <div className="mx-4 mb-2 bg-forge-card/95 backdrop-blur border border-forge-border rounded-t-lg shadow-panel pointer-events-auto overflow-hidden">
        {/* Toggle Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-forge-cardHover transition border-b border-forge-border/60 text-xs"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-forge-cyan" />
            <span className="font-bold text-white">SYNCHRONIZED TIMELINE RAIL</span>
            {selectedEntity ? (
              <span className="text-[10px] text-forge-cyan bg-forge-bg px-2 py-0.5 rounded border border-forge-border">
                FILTERED: {selectedEntity.name} ({events.length} events)
              </span>
            ) : (
              <span className="text-[10px] text-forge-text-muted">
                (Showing all {events.length} events · Select an entity to focus timeline)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-forge-text-muted">
            <span className="text-[10px]">{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Expanded Horizontal Timeline Reel */}
        {isExpanded && (
          <div className="p-3 overflow-x-auto">
            <div className="flex space-x-3 min-w-max">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="w-64 p-2.5 bg-forge-bg rounded border border-forge-border hover:border-forge-cyan/50 transition space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-1.5 py-0.2 rounded font-bold bg-forge-card border border-forge-border text-forge-cyan">
                      {ev.type}
                    </span>
                    <span className="text-forge-text-muted">{ev.timestamp.slice(5, 10)} {ev.timestamp.slice(11, 16)}</span>
                  </div>
                  <h4 className="font-bold text-white text-[11px] truncate">{ev.title}</h4>
                  <p className="text-[10px] text-forge-text-muted line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                  {ev.evidenceIds && ev.evidenceIds.length > 0 && (
                    <div
                      onClick={() => {
                        const evd = evidenceService.getEvidenceById(ev.evidenceIds![0]);
                        if (evd) openEvidenceModal(evd);
                      }}
                      className="pt-1 border-t border-forge-border/40 flex justify-between text-[9px] cursor-pointer hover:text-forge-cyan transition"
                    >
                      <span className="text-forge-text-muted">Evidence: {ev.evidenceIds[0]}</span>
                      <span className="text-forge-cyan font-semibold">Inspect Exhibit</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
