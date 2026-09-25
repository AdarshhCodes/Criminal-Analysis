import { Entity, Relationship, EntityType } from '../types';
import cytoscape from 'cytoscape';

export interface CytoscapeNodeData {
  id: string;
  label: string;
  type: EntityType;
  riskScore: number;
  status: string;
  isBridge?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  color: string;
  size: number;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  confidence: number;
  verificationStatus: string;
  highlighted?: boolean;
  dimmed?: boolean;
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
}

export type GraphLayoutName = 'cose' | 'breadthfirst' | 'concentric' | 'circle';

class GraphService {
  /**
   * Entity Type Color Mapping for Dark Intelligence Command UI
   */
  public getEntityTypeColor(type: EntityType): string {
    switch (type) {
      case 'PERSON':
        return '#38bdf8'; // Cyan / Sky
      case 'PHONE':
        return '#f59e0b'; // Amber
      case 'BANK_ACCOUNT':
        return '#10b981'; // Emerald
      case 'LOCATION':
        return '#f43f5e'; // Rose
      case 'VEHICLE':
        return '#6366f1'; // Indigo
      case 'ORGANIZATION':
        return '#818cf8'; // Steel Indigo
      case 'FIR':
      case 'CCTV':
      case 'AUDIO':
      case 'DOCUMENT':
        return '#06b6d4'; // Deep Cyan
      default:
        return '#94a3b8'; // Cool Gray
    }
  }

  /**
   * Edge Style based on Verification Status
   */
  public getEdgeStyle(status: string): { color: string; lineStyle: 'solid' | 'dashed' | 'dotted' } {
    switch (status) {
      case 'HUMAN_VERIFIED':
        return { color: '#10b981', lineStyle: 'solid' }; // Emerald solid
      case 'AI_SUGGESTED':
        return { color: '#f59e0b', lineStyle: 'dashed' }; // Amber dashed
      case 'REJECTED':
        return { color: '#ef4444', lineStyle: 'dotted' }; // Red dotted
      default:
        return { color: '#475569', lineStyle: 'solid' };
    }
  }

  /**
   * Transform Entities & Relationships to Cytoscape Elements
   */
  public toCytoscapeElements(
    entities: Entity[],
    relationships: Relationship[],
    highlightedNodeIds: Set<string> = new Set(),
    highlightedEdgeIds: Set<string> = new Set(),
    hasActiveSelection: boolean = false
  ): cytoscape.ElementDefinition[] {
    const nodes: cytoscape.ElementDefinition[] = entities.map((entity) => {
      const isHighlighted = highlightedNodeIds.has(entity.id);
      const isDimmed = hasActiveSelection && !isHighlighted;
      const baseColor = this.getEntityTypeColor(entity.type);

      // Node size scaled subtly by risk score
      const size = Math.max(34, Math.min(52, 34 + (entity.riskScore / 100) * 16));

      return {
        group: 'nodes',
        data: {
          id: entity.id,
          label: entity.name,
          type: entity.type,
          riskScore: entity.riskScore,
          status: entity.status,
          highlighted: isHighlighted,
          dimmed: isDimmed,
          color: isHighlighted ? '#38bdf8' : baseColor,
          size,
        } as CytoscapeNodeData,
      };
    });

    const edges: cytoscape.ElementDefinition[] = relationships.map((rel) => {
      const isHighlighted = highlightedEdgeIds.has(rel.id);
      const isDimmed = hasActiveSelection && !isHighlighted;
      const edgeStyle = this.getEdgeStyle(rel.verificationStatus);

      return {
        group: 'edges',
        data: {
          id: rel.id,
          source: rel.sourceId,
          target: rel.targetId,
          label: rel.type.replace(/_/g, ' '),
          type: rel.type,
          confidence: rel.confidence,
          verificationStatus: rel.verificationStatus,
          highlighted: isHighlighted,
          dimmed: isDimmed,
          color: isHighlighted ? '#38bdf8' : edgeStyle.color,
          lineStyle: edgeStyle.lineStyle,
        } as CytoscapeEdgeData,
      };
    });

    return [...nodes, ...edges];
  }

  /**
   * Layout Options Configuration
   */
  public getLayoutConfig(layoutName: GraphLayoutName): cytoscape.LayoutOptions {
    switch (layoutName) {
      case 'breadthfirst':
        return {
          name: 'breadthfirst',
          directed: false,
          padding: 40,
          spacingFactor: 1.25,
          animate: true,
          animationDuration: 500,
        };
      case 'concentric':
        return {
          name: 'concentric',
          concentric: (node: cytoscape.NodeSingular) => node.data('riskScore') || 50,
          levelWidth: () => 20,
          padding: 40,
          animate: true,
          animationDuration: 500,
        };
      case 'circle':
        return {
          name: 'circle',
          padding: 40,
          animate: true,
          animationDuration: 500,
        };
      case 'cose':
      default:
        return {
          name: 'cose',
          idealEdgeLength: 80,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 30,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: 400000,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
          animate: true,
          animationDuration: 500,
        };
    }
  }
}

export const graphService = new GraphService();
