import { Entity, Relationship, Case } from '../types';
import { DEMO_CASES, SYNTHETIC_ENTITIES, SYNTHETIC_RELATIONSHIPS } from '../data';

class InvestigationService {
  private cases: Case[] = [...DEMO_CASES];
  private entities: Entity[] = [...SYNTHETIC_ENTITIES];
  private relationships: Relationship[] = [...SYNTHETIC_RELATIONSHIPS];

  public getCases(): Case[] {
    return [...this.cases];
  }

  public getCaseById(caseId: string): Case | undefined {
    return this.cases.find((c) => c.id === caseId || c.code === caseId);
  }

  public getEntities(caseId?: string): Entity[] {
    if (!caseId) return [...this.entities];
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return [...this.entities];
    return this.entities.filter((e) => targetCase.entityIds.includes(e.id));
  }

  public getEntityDetails(entityId: string): Entity | undefined {
    return this.entities.find((e) => e.id === entityId);
  }

  public getEntityById(entityId: string): Entity | undefined {
    return this.getEntityDetails(entityId);
  }

  public getRelationships(caseId?: string): Relationship[] {
    if (!caseId) return [...this.relationships];
    const caseEntities = new Set(this.getEntities(caseId).map((e) => e.id));
    return this.relationships.filter(
      (r) => caseEntities.has(r.sourceId) && caseEntities.has(r.targetId)
    );
  }

  public getRelationshipById(id: string): Relationship | undefined {
    return this.relationships.find((r) => r.id === id);
  }

  /**
   * Search across entities, roles, tags, and identifiers
   */
  public searchInvestigation(query: string, caseId?: string): {
    entities: Entity[];
    relationships: Relationship[];
  } {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { entities: this.getEntities(caseId), relationships: this.getRelationships(caseId) };
    }

    const matchedEntities = this.getEntities(caseId).filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        (e.role && e.role.toLowerCase().includes(q)) ||
        (e.primaryIdentifier && e.primaryIdentifier.toLowerCase().includes(q)) ||
        (e.aliases && e.aliases.some((a) => a.toLowerCase().includes(q))) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );

    const matchedEntityIds = new Set(matchedEntities.map((e) => e.id));
    const matchedRelationships = this.getRelationships(caseId).filter(
      (r) =>
        matchedEntityIds.has(r.sourceId) ||
        matchedEntityIds.has(r.targetId) ||
        r.type.toLowerCase().includes(q) ||
        (r.label && r.label.toLowerCase().includes(q))
    );

    return { entities: matchedEntities, relationships: matchedRelationships };
  }

  /**
   * Find immediate and N-hop connections from a root entity
   */
  public findConnections(entityId: string, maxHops: number = 2): {
    connectedEntityIds: string[];
    connectedRelationshipIds: string[];
    hopDistances: Record<string, number>;
  } {
    const visitedEntities = new Map<string, number>();
    visitedEntities.set(entityId, 0);

    const matchedRelationships = new Set<string>();
    const queue: [string, number][] = [[entityId, 0]];

    while (queue.length > 0) {
      const [currentId, currentDist] = queue.shift()!;
      if (currentDist >= maxHops) continue;

      for (const rel of this.relationships) {
        let neighborId: string | null = null;
        if (rel.sourceId === currentId) neighborId = rel.targetId;
        else if (rel.targetId === currentId) neighborId = rel.sourceId;

        if (neighborId) {
          matchedRelationships.add(rel.id);
          if (!visitedEntities.has(neighborId)) {
            visitedEntities.set(neighborId, currentDist + 1);
            queue.push([neighborId, currentDist + 1]);
          }
        }
      }
    }

    visitedEntities.delete(entityId); // exclude self

    const hopDistances: Record<string, number> = {};
    visitedEntities.forEach((dist, id) => {
      hopDistances[id] = dist;
    });

    return {
      connectedEntityIds: Array.from(visitedEntities.keys()),
      connectedRelationshipIds: Array.from(matchedRelationships),
      hopDistances,
    };
  }

  /**
   * Find shortest / strongest path between two entities using BFS
   */
  public findStrongestPath(
    sourceId: string,
    targetId: string
  ): {
    pathFound: boolean;
    nodeIds: string[];
    edgeIds: string[];
    hopCount: number;
    overallConfidence: number;
  } {
    if (sourceId === targetId) {
      return { pathFound: true, nodeIds: [sourceId], edgeIds: [], hopCount: 0, overallConfidence: 100 };
    }

    const queue: { nodeId: string; pathNodes: string[]; pathEdges: string[]; confidences: number[] }[] = [
      { nodeId: sourceId, pathNodes: [sourceId], pathEdges: [], confidences: [100] },
    ];
    const visited = new Set<string>([sourceId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.nodeId === targetId) {
        const avgConfidence = Math.round(
          current.confidences.reduce((a, b) => a + b, 0) / current.confidences.length
        );
        return {
          pathFound: true,
          nodeIds: current.pathNodes,
          edgeIds: current.pathEdges,
          hopCount: current.pathEdges.length,
          overallConfidence: avgConfidence,
        };
      }

      for (const rel of this.relationships) {
        let nextNodeId: string | null = null;
        if (rel.sourceId === current.nodeId) nextNodeId = rel.targetId;
        else if (rel.targetId === current.nodeId) nextNodeId = rel.sourceId;

        if (nextNodeId && !visited.has(nextNodeId)) {
          visited.add(nextNodeId);
          queue.push({
            nodeId: nextNodeId,
            pathNodes: [...current.pathNodes, nextNodeId],
            pathEdges: [...current.pathEdges, rel.id],
            confidences: [...current.confidences, rel.confidence],
          });
        }
      }
    }

    return { pathFound: false, nodeIds: [], edgeIds: [], hopCount: 0, overallConfidence: 0 };
  }

  /**
   * Human-in-the-Loop verification update
   */
  public verifyRelationship(relationshipId: string, officerName: string): Relationship | undefined {
    const rel = this.relationships.find((r) => r.id === relationshipId);
    if (!rel) return undefined;

    rel.verificationStatus = 'HUMAN_VERIFIED';
    rel.verifiedBy = officerName;
    rel.verifiedAt = new Date().toISOString();
    return { ...rel };
  }

  public rejectRelationship(
    relationshipId: string,
    officerName: string,
    reason: string
  ): Relationship | undefined {
    const rel = this.relationships.find((r) => r.id === relationshipId);
    if (!rel) return undefined;

    rel.verificationStatus = 'REJECTED';
    rel.verifiedBy = officerName;
    rel.verifiedAt = new Date().toISOString();
    rel.rejectionReason = reason;
    return { ...rel };
  }
}

export const investigationService = new InvestigationService();
