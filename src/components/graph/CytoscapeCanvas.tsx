import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { useInvestigationStore, useThemeStore } from '../../stores';
import { investigationService, graphService } from '../../services';
import { Entity, Relationship } from '../../types';

interface CytoscapeCanvasProps {
  onNodeHover?: (entity: Entity | null, position: { x: number; y: number } | null) => void;
}

export const CytoscapeCanvas: React.FC<CytoscapeCanvasProps> = ({ onNodeHover }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const {
    currentCase,
    selectedEntity,
    selectedRelationship,
    selectEntity,
    selectRelationship,
    graphLayout,
    graphFilters,
    graphVersion,
    highlightedPath,
    expandedNodeIds,
    expandNode,
  } = useInvestigationStore();
  const { theme } = useThemeStore();

  const [allEntities, setAllEntities] = useState<Entity[]>([]);
  const [allRelationships, setAllRelationships] = useState<Relationship[]>([]);

  // Load case entities & relationships
  useEffect(() => {
    const ents = investigationService.getEntities(currentCase.id);
    const rels = investigationService.getRelationships(currentCase.id);
    setAllEntities(ents);
    setAllRelationships(rels);
  }, [currentCase.id, graphVersion]);

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      boxSelectionEnabled: true,
      autounselectify: false,
      wheelSensitivity: 0.25,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            color: theme === 'light' ? '#0f172a' : '#f8fafc',
            'font-family': 'Inter, sans-serif',
            'font-size': '10px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': theme === 'light' ? '#ffffff' : '#080c14',
            'text-background-opacity': 0.85,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            width: 'data(size)',
            height: 'data(size)',
            'border-width': 2,
            'border-color': theme === 'light' ? '#cbd5e1' : '#1e293b',
            'transition-property': 'background-color, border-color, width, height, opacity',
            'transition-duration': 0.25,
          } as any,
        },
        {
          selector: 'node[?highlighted]',
          style: {
            'border-width': 4,
            'border-color': '#38bdf8',
            'border-opacity': 1,
            'underlay-color': '#38bdf8',
            'underlay-padding': 6,
            'underlay-opacity': 0.4,
            width: 48,
            height: 48,
            'font-size': '11px',
            'text-background-color': theme === 'light' ? '#f1f5f9' : '#0f172a',
            'z-index': 999,
          } as any,
        },
        {
          selector: 'node[?dimmed]',
          style: {
            opacity: 0.15,
            'text-opacity': 0.2,
          } as any,
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': 'data(color)',
            'line-style': 'data(lineStyle)',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'data(color)',
            'arrow-scale': 0.8,
            label: 'data(label)',
            'font-size': '8px',
            'font-family': 'JetBrains Mono, monospace',
            color: theme === 'light' ? '#334155' : '#94a3b8',
            'text-rotation': 'autorotate',
            'text-background-color': theme === 'light' ? '#ffffff' : '#080c14',
            'text-background-opacity': 0.9,
            'text-background-padding': '2px',
            'transition-property': 'line-color, width, opacity',
            'transition-duration': 0.25,
          } as any,
        },
        {
          selector: 'edge[?highlighted]',
          style: {
            width: 4,
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
            color: '#38bdf8',
            'font-weight': 'bold',
            'font-size': '9px',
            'z-index': 998,
          },
        },
        {
          selector: 'edge[?dimmed]',
          style: {
            opacity: 0.1,
            'text-opacity': 0,
          },
        },
      ],
      elements: [],
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      const entityId = node.id();
      const entity = investigationService.getEntityDetails(entityId);
      if (entity) {
        selectEntity(entity);
      }
    });

    // Node double click / tap for expansion
    cy.on('dblclick', 'node', (evt: EventObject) => {
      const node = evt.target;
      expandNode(node.id());
    });

    // Edge click handler
    cy.on('tap', 'edge', (evt: EventObject) => {
      const edge = evt.target;
      const relId = edge.id();
      const rel = investigationService.getRelationshipById(relId);
      if (rel) {
        selectRelationship(rel);
      }
    });

    // Background click handler to clear selections
    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        selectEntity(null);
        selectRelationship(null);
      }
    });

    // Hover tooltip handlers
    cy.on('mouseover', 'node', (evt: EventObject) => {
      const node = evt.target;
      const entityId = node.id();
      const entity = investigationService.getEntityDetails(entityId);
      if (onNodeHover && entity) {
        const renderedPos = node.renderedPosition();
        onNodeHover(entity, renderedPos);
      }
    });

    cy.on('mouseout', 'node', () => {
      if (onNodeHover) {
        onNodeHover(null, null);
      }
    });

    return () => {
      cy.destroy();
    };
  }, []);

  // Dynamically update Cytoscape canvas styling on theme changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const isLight = theme === 'light';
    cy.style()
      .selector('node')
      .style({
        color: isLight ? '#0f172a' : '#f8fafc',
        'text-background-color': isLight ? '#ffffff' : '#080c14',
        'border-color': isLight ? '#cbd5e1' : '#1e293b',
      })
      .selector('edge')
      .style({
        color: isLight ? '#334155' : '#94a3b8',
        'text-background-color': isLight ? '#ffffff' : '#080c14',
      })
      .selector('node[?highlighted]')
      .style({
        'text-background-color': isLight ? '#f1f5f9' : '#0f172a',
      })
      .update();
  }, [theme]);

  // Update Cytoscape elements when filters, selections, or dataset changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Filter entities
    const filteredEntities = allEntities.filter((e) => {
      if (!graphFilters.entityTypes.includes(e.type)) return false;
      if (e.riskScore < graphFilters.minRiskScore) return false;
      if (graphFilters.showOnlyHighRisk && e.riskScore < 75) return false;
      return true;
    });

    const activeEntityIds = new Set(filteredEntities.map((e) => e.id));

    // Filter relationships
    const filteredRelationships = allRelationships.filter((r) => {
      if (!activeEntityIds.has(r.sourceId) || !activeEntityIds.has(r.targetId)) return false;
      if (!graphFilters.verificationStatuses.includes(r.verificationStatus)) return false;
      return true;
    });

    // Compute active highlights & dims
    const highlightedNodes = new Set<string>();
    const highlightedEdges = new Set<string>();
    let hasSelection = false;

    if (highlightedPath) {
      hasSelection = true;
      highlightedPath.nodeIds.forEach((id) => highlightedNodes.add(id));
      highlightedPath.edgeIds.forEach((id) => highlightedEdges.add(id));
    } else if (selectedEntity) {
      hasSelection = true;
      highlightedNodes.add(selectedEntity.id);

      // Add 1-hop neighbors and incident edges
      filteredRelationships.forEach((rel) => {
        if (rel.sourceId === selectedEntity.id) {
          highlightedNodes.add(rel.targetId);
          highlightedEdges.add(rel.id);
        } else if (rel.targetId === selectedEntity.id) {
          highlightedNodes.add(rel.sourceId);
          highlightedEdges.add(rel.id);
        }
      });
    } else if (selectedRelationship) {
      hasSelection = true;
      highlightedEdges.add(selectedRelationship.id);
      highlightedNodes.add(selectedRelationship.sourceId);
      highlightedNodes.add(selectedRelationship.targetId);
    }

    const elements = graphService.toCytoscapeElements(
      filteredEntities,
      filteredRelationships,
      highlightedNodes,
      highlightedEdges,
      hasSelection
    );

    cy.elements().remove();
    cy.add(elements);

    // Apply layout
    const layoutConfig = graphService.getLayoutConfig(graphLayout);
    const layout = cy.layout(layoutConfig);
    layout.run();

    // Smooth auto-fit for highlighted intelligence paths
    if (highlightedPath && highlightedNodes.size > 0) {
      setTimeout(() => {
        try {
          if (!cy.destroyed()) {
            const pathEles = cy.nodes().filter((node) => highlightedNodes.has(node.id()));
            if (pathEles.length > 0) {
              cy.animate({
                fit: {
                  eles: pathEles,
                  padding: 100,
                },
                duration: 500,
              });
            }
          }
        } catch {
          // Ignore layout race condition
        }
      }, 150);
    }
  }, [
    allEntities,
    allRelationships,
    graphLayout,
    graphFilters,
    graphVersion,
    selectedEntity,
    selectedRelationship,
    highlightedPath,
    expandedNodeIds,
  ]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-forge-bg">
      <div ref={containerRef} className="w-full h-full cytoscape-container" />
    </div>
  );
};
