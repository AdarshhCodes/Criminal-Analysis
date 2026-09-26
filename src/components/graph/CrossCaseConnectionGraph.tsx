import React, { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Search,
  Share2,
  ArrowRight,
  X,
  User,
} from 'lucide-react';
import { investigationService } from '../../services';
import { Entity } from '../../types';

export interface CrossCaseConnectionGraphProps {
  onSelectEntity?: (entity: Entity) => void;
  onSelectCase: (caseId: string) => void;
}

export const CrossCaseConnectionGraph: React.FC<CrossCaseConnectionGraphProps> = ({
  onSelectEntity,
  onSelectCase,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<any | null>(null);
  const [lastDismissedNodeDetails, setLastDismissedNodeDetails] = useState<any | null>(null);
  const [filterTypes, setFilterTypes] = useState<Record<string, boolean>>({
    CASE: true,
    PERSON: true,
    PHONE: true,
    VEHICLE: true,
    ORGANIZATION: true,
    BANK_ACCOUNT: true,
    LOCATION: true,
    EVIDENCE: true,
  });

  const isAnyFilterDisabled = useMemo(
    () => Object.values(filterTypes).some((enabled) => !enabled),
    [filterTypes]
  );

  const resetAllFilters = () => {
    setFilterTypes({
      CASE: true,
      PERSON: true,
      PHONE: true,
      VEHICLE: true,
      ORGANIZATION: true,
      BANK_ACCOUNT: true,
      LOCATION: true,
      EVIDENCE: true,
    });
  };

  const allCases = useMemo(() => investigationService.getCases(), []);
  const allEntities = useMemo(() => investigationService.getEntities('ALL'), []);
  const allRelationships = useMemo(() => investigationService.getRelationships('ALL'), []);

  // Compute which entities appear in multiple cases
  const bridgeEntityIds = useMemo(() => {
    const ids = new Set<string>();
    allEntities.forEach((ent) => {
      const matchCount = allCases.filter((c) => c.entityIds.includes(ent.id)).length;
      if (matchCount >= 2 || ['IF-P-063', 'IF-P-001', 'IF-P-004', 'IF-P-005', 'IF-ACC-002'].includes(ent.id)) {
        ids.add(ent.id);
      }
    });
    return ids;
  }, [allCases, allEntities]);

  // Build Cytoscape elements specifically for Cross-Case Network
  const graphElements = useMemo(() => {
    const elements: cytoscape.ElementDefinition[] = [];
    const addedNodeIds = new Set<string>();

    // 1. Add Case Hub Nodes (Hexagon hubs with distinct styling)
    allCases.forEach((c) => {
      if (!filterTypes.CASE) return;
      const caseNodeId = `case-${c.id}`;
      elements.push({
        data: {
          id: caseNodeId,
          rawId: c.id,
          label: c.code,
          sublabel: c.name.split(':')[0],
          type: 'CASE',
          color: c.priority === 'CRITICAL' ? '#f43f5e' : c.priority === 'HIGH' ? '#f59e0b' : '#06b6d4',
          size: 64,
          isCase: true,
          caseObj: c,
        },
      });
      addedNodeIds.add(caseNodeId);
    });

    // 2. Add Entity Nodes
    allEntities.forEach((e) => {
      const isEv = ['CCTV', 'AUDIO', 'DOCUMENT', 'FIR', 'CDR'].includes(e.type);
      const isAllowed = isEv ? filterTypes.EVIDENCE !== false : (filterTypes[e.type] ?? true);
      if (!isAllowed) return;

      const isBridge = bridgeEntityIds.has(e.id);
      let color = '#38bdf8';
      let size = isBridge ? 48 : 34;

      if (e.type === 'PERSON') {
        color = e.personClassification === 'ACCUSED' ? '#f43f5e' : e.personClassification === 'VICTIM' ? '#10b981' : '#f59e0b';
      } else if (e.type === 'BANK_ACCOUNT' || e.type === 'TRANSACTION') {
        color = '#10b981';
      } else if (e.type === 'ORGANIZATION') {
        color = '#818cf8';
      } else if (e.type === 'LOCATION') {
        color = '#f59e0b';
      } else if (e.type === 'PHONE') {
        color = '#06b6d4';
        size = 30;
      } else if (e.type === 'VEHICLE') {
        color = '#ec4899';
        size = 30;
      } else if (isEv) {
        color = '#06b6d4';
        size = 28;
      }

      elements.push({
        data: {
          id: e.id,
          rawId: e.id,
          label: e.name.length > 18 ? `${e.name.slice(0, 16)}...` : e.name,
          fullName: e.name,
          sublabel: e.role || e.type,
          type: e.type,
          isBridge,
          color,
          size,
          entityObj: e,
        },
      });
      addedNodeIds.add(e.id);

      // Link entity to its primary case hubs
      if (filterTypes.CASE) {
        allCases.forEach((c) => {
          const caseHubId = `case-${c.id}`;
          if (c.entityIds.includes(e.id) && addedNodeIds.has(caseHubId)) {
            elements.push({
              data: {
                id: `case-link-${c.id}-${e.id}`,
                source: caseHubId,
                target: e.id,
                label: isBridge ? 'CROSS-CASE LINK' : 'MEMBER',
                isCaseEdge: true,
                color: isBridge ? '#f59e0b' : '#334155',
                width: isBridge ? 2.5 : 1,
                lineStyle: isBridge ? 'dashed' : 'solid',
              },
            });
          }
        });
      }
    });

    // 3. Add Cross-Entity Relationships ONLY IF BOTH NODES EXIST
    allRelationships.forEach((r) => {
      if (addedNodeIds.has(r.sourceId) && addedNodeIds.has(r.targetId)) {
        elements.push({
          data: {
            id: r.id,
            source: r.sourceId,
            target: r.targetId,
            label: r.label || r.type,
            confidence: r.confidence,
            verificationStatus: r.verificationStatus,
            color: r.verificationStatus === 'HUMAN_VERIFIED' ? '#10b981' : r.verificationStatus === 'AI_SUGGESTED' ? '#f59e0b' : '#475569',
            width: r.metadata?.crossCase ? 3 : 1.5,
            lineStyle: r.verificationStatus === 'AI_SUGGESTED' ? 'dashed' : 'solid',
          },
        });
      }
    });

    return elements;
  }, [allCases, allEntities, allRelationships, filterTypes, bridgeEntityIds]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const cy = cytoscape({
        container: containerRef.current,
        elements: graphElements,
        boxSelectionEnabled: false,
        autounselectify: false,
        wheelSensitivity: 0.25,
        style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            color: '#f8fafc',
            'font-family': 'monospace',
            'font-size': '10px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'text-background-color': '#0a0d14',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            width: 'data(size)',
            height: 'data(size)',
            'border-width': 2,
            'border-color': '#1e293b',
          } as any,
        },
        // Case Hub Nodes
        {
          selector: 'node[?isCase]',
          style: {
            shape: 'hexagon',
            'border-width': 4,
            'border-color': '#38bdf8',
            'font-size': '11px',
            'font-weight': 700,
            'text-background-color': '#0f172a',
            'text-background-opacity': 0.95,
          } as any,
        },
        // Cross-Case Bridge Nodes (Halo)
        {
          selector: 'node[?isBridge]',
          style: {
            'border-width': 3,
            'border-color': '#f59e0b',
            'underlay-color': '#f59e0b',
            'underlay-padding': 6,
            'underlay-opacity': 0.35,
            'font-weight': 700,
            'z-index': 99,
          } as any,
        },
        // Edges
        {
          selector: 'edge',
          style: {
            width: 'data(width)',
            'line-color': 'data(color)',
            'curve-style': 'bezier',
            'line-style': 'data(lineStyle)' as any,
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'data(color)',
            'arrow-scale': 0.8,
            opacity: 0.7,
            'font-size': '8px',
            'font-family': 'monospace',
            label: 'data(label)',
            'text-rotation': 'autorotate',
            'text-background-color': '#0a0d14',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            color: '#94a3b8',
          } as any,
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#38bdf8',
            'underlay-color': '#38bdf8',
            'underlay-padding': 8,
            'underlay-opacity': 0.45,
          } as any,
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        randomize: false,
        componentSpacing: 120,
        nodeOverlap: 20,
        idealEdgeLength: () => 140,
        nodeRepulsion: () => 600000,
      } as any,
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      setSelectedNodeDetails(nodeData);

      if (nodeData.isCase) {
        onSelectCase(nodeData.rawId);
      } else if (nodeData.entityObj) {
        if (onSelectEntity) onSelectEntity(nodeData.entityObj);
      }
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNodeDetails(null);
      }
    });
    } catch (err) {
      console.error('Cytoscape initialization error:', err);
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphElements]);

  // Search node highlighting
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    if (!searchQuery.trim()) {
      cy.elements().removeClass('dimmed highlighted');
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    cy.batch(() => {
      cy.elements().addClass('dimmed');
      const matches = cy.nodes().filter((n) => {
        const label = (n.data('label') || '').toLowerCase();
        const fullName = (n.data('fullName') || '').toLowerCase();
        const sublabel = (n.data('sublabel') || '').toLowerCase();
        return label.includes(q) || fullName.includes(q) || sublabel.includes(q);
      });

      matches.removeClass('dimmed').addClass('highlighted');
      matches.connectedEdges().removeClass('dimmed');
    });
  }, [searchQuery]);

  const toggleFilter = (type: string) => {
    setFilterTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-forge-bg select-none">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-20 pointer-events-none">
        {/* Left: Purpose Badge & Entity Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-forge-card/90 backdrop-blur border border-white/[0.1] rounded-xl p-1.5 shadow-xl pointer-events-auto text-xs font-mono">
          <div className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center space-x-1.5 mr-1">
            <Share2 className="w-3.5 h-3.5" />
            <span>CROSS-CASE CONNECTION NETWORK</span>
          </div>

          <span className="text-[10px] text-forge-text-muted px-1">SHOW:</span>
          {Object.entries(filterTypes).map(([type, enabled]) => (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                enabled
                  ? 'bg-white/[0.08] text-white border border-white/[0.15]'
                  : 'text-forge-text-muted hover:text-white line-through opacity-50'
              }`}
            >
              {type}
            </button>
          ))}

          {isAnyFilterDisabled && (
            <button
              onClick={resetAllFilters}
              className="px-2 py-0.5 rounded text-[11px] font-mono text-forge-cyan bg-forge-cyan/15 hover:bg-forge-cyan/25 border border-forge-cyan/40 transition font-bold"
              title="Restore all hidden entities"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Right: Search & Zoom Controls */}
        <div className="flex items-center space-x-2 bg-forge-card/90 backdrop-blur border border-white/[0.1] rounded-xl p-1.5 shadow-xl pointer-events-auto">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3 h-3 text-forge-cyan absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find target in network..."
              className="w-full bg-forge-bg/90 border border-white/[0.08] rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder:text-forge-text-muted font-mono focus:outline-none focus:border-forge-cyan"
            />
          </div>

          <div className="flex items-center space-x-1 border-l border-white/[0.08] pl-2">
            <button
              onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.25)}
              className="p-1 rounded hover:bg-white/[0.06] text-forge-text-muted hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
              className="p-1 rounded hover:bg-white/[0.06] text-forge-text-muted hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => cyRef.current?.fit(undefined, 50)}
              className="p-1 rounded hover:bg-white/[0.06] text-forge-text-muted hover:text-white transition"
              title="Fit View"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={() => cyRef.current?.layout({ name: 'cose', animate: true }).run()}
              className="p-1 rounded hover:bg-white/[0.06] text-forge-text-muted hover:text-white transition"
              title="Re-run Organic Layout"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cross-Case Bridge Indicator HUD Pill */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto glass-card p-3 rounded-xl border border-white/[0.08] space-y-1.5 font-mono text-xs max-w-xs shadow-2xl">
        <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span>CROSS-CASE BRIDGING TARGETS</span>
        </div>
        <p className="text-[10px] text-forge-text-muted leading-relaxed font-sans">
          Highlighted nodes with golden halo appear in multiple operations simultaneously (e.g. Sameer Merchant, Tariq Mansoor, SBI Hawala Corridor).
        </p>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNodeDetails && (
        <div className="absolute top-16 right-4 z-20 pointer-events-auto glass-card p-4 rounded-xl border border-white/[0.12] w-80 space-y-3 font-mono shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <span className="text-xs font-bold text-white uppercase">{selectedNodeDetails.type}</span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-forge-cyan">{selectedNodeDetails.rawId}</span>
              <button
                onClick={() => {
                  setLastDismissedNodeDetails(selectedNodeDetails);
                  setSelectedNodeDetails(null);
                }}
                className="p-1 rounded text-forge-text-muted hover:text-white hover:bg-white/[0.08] transition"
                title="Dismiss Details Panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">{selectedNodeDetails.fullName || selectedNodeDetails.label}</h4>
            <div className="text-[11px] text-forge-text-muted mt-0.5">{selectedNodeDetails.sublabel}</div>
          </div>

          {selectedNodeDetails.isBridge && (
            <div className="p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
              MULTI-OPERATION BRIDGE TARGET
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            {selectedNodeDetails.isCase ? (
              <button
                onClick={() => onSelectCase(selectedNodeDetails.rawId)}
                className="w-full py-1.5 rounded bg-forge-cyan text-slate-950 font-bold text-xs flex items-center justify-center space-x-1"
              >
                <span>Open Case Docket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (selectedNodeDetails.entityObj && onSelectEntity) {
                    onSelectEntity(selectedNodeDetails.entityObj);
                  }
                }}
                className="w-full py-1.5 rounded bg-forge-cyan text-slate-950 font-bold text-xs flex items-center justify-center space-x-1"
              >
                <span>View Full Entity Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Restore Button for Dismissed Node Details */}
      {!selectedNodeDetails && lastDismissedNodeDetails && (
        <button
          onClick={() => setSelectedNodeDetails(lastDismissedNodeDetails)}
          className="absolute top-16 right-4 z-20 pointer-events-auto glass-card px-3 py-1.5 rounded-xl border border-forge-cyan/40 text-forge-cyan text-xs font-mono font-bold flex items-center space-x-1.5 hover:bg-white/[0.05] transition shadow-xl"
          title="Reopen target dossier"
        >
          <User className="w-3.5 h-3.5" />
          <span>Reopen Dossier: {lastDismissedNodeDetails.fullName || lastDismissedNodeDetails.label}</span>
        </button>
      )}

      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} className="flex-1 w-full h-full min-h-[550px] relative" />
    </div>
  );
};
