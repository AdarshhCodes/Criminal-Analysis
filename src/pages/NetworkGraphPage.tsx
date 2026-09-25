import React, { useState } from 'react';
import {
  CytoscapeCanvas,
  GraphToolbar,
  GraphFiltersPanel,
  GraphBottomTimeline,
  EntityHoverCard,
  IntelligencePathHUD,
  GraphMapView,
  GraphTableView,
  InvestigationViewMode,
} from '../components/graph';
import { Entity } from '../types';

export const NetworkGraphPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<InvestigationViewMode>('GRAPH');
  const [hoveredEntity, setHoveredEntity] = useState<Entity | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const handleNodeHover = (entity: Entity | null, position: { x: number; y: number } | null) => {
    setHoveredEntity(entity);
    setHoverPosition(position);
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col overflow-hidden bg-forge-bg select-none">
      {/* Top Floating Controls Bar with GRAPH / MAP / TABLE mode switcher */}
      <GraphToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Mode 1: Primary Cytoscape Network Canvas */}
      {viewMode === 'GRAPH' && (
        <>
          {/* Intelligence Path Signature Demo HUD */}
          <IntelligencePathHUD />

          {/* Left Collapsible Filter Panel */}
          <GraphFiltersPanel />

          {/* Central Cytoscape Network Canvas */}
          <div className="flex-1 w-full h-full relative">
            <CytoscapeCanvas onNodeHover={handleNodeHover} />
          </div>

          {/* Floating Hover Card HUD */}
          <EntityHoverCard entity={hoveredEntity} position={hoverPosition} />

          {/* Bottom Synchronized Timeline Drawer */}
          <GraphBottomTimeline />
        </>
      )}

      {/* Mode 2: Tactical Geospatial Map Surveillance View */}
      {viewMode === 'MAP' && (
        <div className="flex-1 w-full h-full relative pt-12">
          <GraphMapView />
        </div>
      )}

      {/* Mode 3: Tabular Entity & Relationship Master Grid */}
      {viewMode === 'TABLE' && (
        <div className="flex-1 w-full h-full relative pt-14">
          <GraphTableView />
        </div>
      )}
    </div>
  );
};
