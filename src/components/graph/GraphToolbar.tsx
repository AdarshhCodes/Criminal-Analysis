import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Sparkles,
  X,
  Layers,
  Network,
  MapPin,
  Table as TableIcon,
} from 'lucide-react';
import { useInvestigationStore } from '../../stores';
import { GraphLayoutName } from '../../services';

export type InvestigationViewMode = 'GRAPH' | 'MAP' | 'TABLE';

interface GraphToolbarProps {
  viewMode?: InvestigationViewMode;
  onViewModeChange?: (mode: InvestigationViewMode) => void;
}

export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  viewMode = 'GRAPH',
  onViewModeChange,
}) => {
  const {
    graphLayout,
    setGraphLayout,
    highlightedPath,
    clearGraphHighlights,
    currentCase,
  } = useInvestigationStore();

  const layouts: { id: GraphLayoutName; label: string }[] = [
    { id: 'cose', label: 'Organic (COSE)' },
    { id: 'breadthfirst', label: 'Hierarchical' },
    { id: 'concentric', label: 'Radial (Risk)' },
    { id: 'circle', label: 'Circular' },
  ];

  return (
    <div className="absolute top-3 left-3 right-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 z-10 pointer-events-none">
      {/* Left Layout & Mode Switcher Controls Bar */}
      <div className="flex flex-wrap items-center space-x-1.5 bg-forge-card/90 backdrop-blur border border-forge-border rounded-lg p-1.5 shadow-panel pointer-events-auto">
        {/* View Mode Switcher: GRAPH / MAP / TABLE */}
        {onViewModeChange && (
          <div className="flex items-center space-x-1 border-r border-forge-border pr-2 mr-1">
            <button
              onClick={() => onViewModeChange('GRAPH')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'GRAPH'
                  ? 'bg-forge-cyan text-slate-900 shadow-sm'
                  : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
              }`}
              title="Primary Cytoscape Graph Canvas"
            >
              <Network className="w-3.5 h-3.5" />
              <span>GRAPH</span>
            </button>

            <button
              onClick={() => onViewModeChange('MAP')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'MAP'
                  ? 'bg-forge-cyan text-slate-900 shadow-sm'
                  : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
              }`}
              title="Geospatial Map Surveillance View"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>MAP</span>
            </button>

            <button
              onClick={() => onViewModeChange('TABLE')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'TABLE'
                  ? 'bg-forge-cyan text-slate-900 shadow-sm'
                  : 'text-forge-text-secondary hover:text-white hover:bg-forge-bg'
              }`}
              title="Tabular Entity & Relationship Inspector"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>TABLE</span>
            </button>
          </div>
        )}

        {/* Graph Layout Switcher (active only in GRAPH mode) */}
        {viewMode === 'GRAPH' && (
          <div className="flex items-center space-x-1 border-r border-forge-border pr-2 mr-1">
            <Layers className="w-3.5 h-3.5 text-forge-cyan ml-1" />
            <select
              value={graphLayout}
              onChange={(e) => setGraphLayout(e.target.value as GraphLayoutName)}
              className="bg-forge-bg border border-forge-border rounded px-2 py-1 text-xs text-forge-text-primary focus:outline-none focus:border-forge-cyan font-mono"
            >
              {layouts.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Zoom & Fit Action Buttons (active in GRAPH mode) */}
        {viewMode === 'GRAPH' && (
          <>
            <button
              onClick={() => {
                const cy = (window as unknown as { __cy?: cytoscape.Core }).__cy;
                if (cy) cy.zoom(cy.zoom() * 1.25);
              }}
              className="p-1.5 rounded hover:bg-forge-cardHover text-forge-text-muted hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const cy = (window as unknown as { __cy?: cytoscape.Core }).__cy;
                if (cy) cy.zoom(cy.zoom() * 0.8);
              }}
              className="p-1.5 rounded hover:bg-forge-cardHover text-forge-text-muted hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const cy = (window as unknown as { __cy?: cytoscape.Core }).__cy;
                if (cy) cy.fit(undefined, 30);
              }}
              className="p-1.5 rounded hover:bg-forge-cardHover text-forge-text-muted hover:text-white transition"
              title="Fit Network to Viewport"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const cy = (window as unknown as { __cy?: cytoscape.Core }).__cy;
                if (cy) cy.reset();
              }}
              className="p-1.5 rounded hover:bg-forge-cardHover text-forge-text-muted hover:text-white transition"
              title="Reset Viewport"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Center Path Banner (if AI intelligence path is highlighted in graph mode) */}
      {viewMode === 'GRAPH' && highlightedPath && (
        <div className="flex items-center space-x-2 bg-forge-card/95 border border-forge-cyan/50 text-xs px-3.5 py-1.5 rounded-lg shadow-panel pointer-events-auto animate-pulse">
          <Sparkles className="w-4 h-4 text-forge-cyan shrink-0" />
          <span className="font-mono text-white font-medium">
            PATH ACTIVE: {highlightedPath.nodeIds.length} Nodes · {highlightedPath.edgeIds.length} Hops
          </span>
          <button
            onClick={clearGraphHighlights}
            className="p-1 rounded hover:bg-forge-panel text-forge-text-muted hover:text-white transition ml-2"
            title="Clear Path Highlight"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Right Graph Stats Pill */}
      <div className="hidden sm:flex items-center space-x-2 bg-forge-card/90 backdrop-blur border border-forge-border rounded-lg px-3 py-1.5 font-mono text-xs text-forge-text-muted shadow-panel pointer-events-auto">
        <Network className="w-3.5 h-3.5 text-forge-cyan" />
        <span>CASE: {currentCase.code}</span>
      </div>
    </div>
  );
};
