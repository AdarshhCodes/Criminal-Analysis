import { Entity, Relationship, Case } from '../types';
import {
  COMBINED_CASES,
  ALL_ENTITIES,
  ALL_RELATIONSHIPS,
  ALL_CASES_PORTFOLIO,
} from '../data';

class InvestigationService {
  private cases: Case[] = [...COMBINED_CASES];
  private entities: Entity[] = [...ALL_ENTITIES];
  private relationships: Relationship[] = [...ALL_RELATIONSHIPS];

  public getCases(): Case[] {
    return [...this.cases];
  }

  public getCaseById(caseId: string): Case | undefined {
    if (caseId === 'ALL' || caseId === 'ALL-OPERATIONS') {
      return ALL_CASES_PORTFOLIO;
    }
    return this.cases.find((c) => c.id === caseId || c.code === caseId);
  }

  public getEntities(caseId?: string): Entity[] {
    if (!caseId || caseId === 'ALL' || caseId === 'ALL-OPERATIONS') {
      return [...this.entities];
    }
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
    if (!caseId || caseId === 'ALL' || caseId === 'ALL-OPERATIONS') {
      return [...this.relationships];
    }
    const caseEntities = new Set(this.getEntities(caseId).map((e) => e.id));
    return this.relationships.filter(
      (r) => caseEntities.has(r.sourceId) && caseEntities.has(r.targetId)
    );
  }

  public getRelationshipById(id: string): Relationship | undefined {
    return this.relationships.find((r) => r.id === id);
  }

  /**
   * Find which case an entity belongs to
   */
  public getCaseForEntity(entityId: string): Case | undefined {
    return this.cases.find((c) => c.entityIds.includes(entityId));
  }

  /**
   * Get all cases flagged as women-related or critical priority
   */
  public getCriticalAndWomenCases(): Case[] {
    return this.cases.filter(
      (c) =>
        c.priority === 'CRITICAL' ||
        (c.caseFlags && (c.caseFlags.includes('WOMEN_RELATED') || c.caseFlags.includes('CRITICAL')))
    );
  }

  /**
   * Find all other cases an entity appears in (cross-case person linking).
   * Returns an array of { case, role } entries for every case OTHER than the one
   * that currently owns the entity.
   */
  public getCrossAppearances(
    entityId: string
  ): { caseItem: Case; roleLabel: string }[] {
    const ownerCase = this.getCaseForEntity(entityId);
    const entity = this.getEntityDetails(entityId);
    if (!entity) return [];

    return this.cases
      .filter((c) => c.id !== ownerCase?.id && c.entityIds.includes(entityId))
      .map((c) => ({
        caseItem: c,
        roleLabel:
          entity.personClassification === 'ACCUSED'
            ? `Accused in ${c.name}`
            : entity.personClassification === 'VICTIM'
            ? `Victim in ${c.name}`
            : entity.personClassification === 'WITNESS'
            ? `Witness in ${c.name}`
            : entity.personClassification === 'SUSPECT'
            ? `Suspect in ${c.name}`
            : `Entity in ${c.name}`,
      }));
  }

  /**
   * Find financial links for an entity across ALL cases.
   * Returns a list of relationships involving bank accounts, transactions,
   * or financial evidence that span more than one case.
   */
  public getCrossFinancialLinks(entityId: string): {
    caseItem: Case;
    relatedEntityName: string;
    relatedEntityId: string;
    linkType: string;
    amount?: string;
    evidenceId?: string;
  }[] {
    const entity = this.getEntityDetails(entityId);
    if (!entity) return [];

    const results: {
      caseItem: Case;
      relatedEntityName: string;
      relatedEntityId: string;
      linkType: string;
      amount?: string;
      evidenceId?: string;
    }[] = [];

    // Walk all relationships involving this entity
    for (const rel of this.relationships) {
      const otherId =
        rel.sourceId === entityId
          ? rel.targetId
          : rel.targetId === entityId
          ? rel.sourceId
          : null;

      if (!otherId) continue;

      const otherEntity = this.getEntityDetails(otherId);
      if (!otherEntity) continue;

      // Only financial link types
      const isFinancialRel =
        ['TRANSFERRED', 'OWNS', 'FINANCIAL_LINK', 'CONTROLS'].includes(rel.type) &&
        ['BANK_ACCOUNT', 'TRANSACTION', 'ORGANIZATION'].includes(otherEntity.type);

      if (!isFinancialRel) continue;

      // Find all cases that contain the other entity
      for (const c of this.cases) {
        if (!c.entityIds.includes(otherId)) continue;
        // Only include if the OTHER entity belongs to a DIFFERENT case than this entity
        const ownerCase = this.getCaseForEntity(entityId);
        if (c.id === ownerCase?.id) continue;

        const amountMeta =
          otherEntity.metadata?.estimatedVolume ||
          otherEntity.metadata?.amount;

        results.push({
          caseItem: c,
          relatedEntityName: otherEntity.name,
          relatedEntityId: otherId,
          linkType: rel.label || rel.type.replace('_', ' '),
          amount: amountMeta ? String(amountMeta) : undefined,
          evidenceId: rel.evidenceIds[0],
        });
      }
    }

    return results;
  }

  /**
   * Get high priority targets across all cases or for a single case
   */
  public getHighRiskTargets(caseId?: string, minScore: number = 75): (Entity & { caseInfo?: Case })[] {
    const list = this.getEntities(caseId);
    return list
      .filter((e) => e.riskScore >= minScore)
      .map((e) => ({
        ...e,
        caseInfo: this.getCaseForEntity(e.id),
      }))
      .sort((a, b) => b.riskScore - a.riskScore);
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
  public getWomenRelatedCases(): Case[] {
    return this.cases.filter(
      (c) =>
        c.caseFlags?.includes('WOMEN_RELATED') ||
        c.category?.toLowerCase().includes('women') ||
        c.name.toLowerCase().includes('harassment')
    );
  }

  public getCriticalCases(): Case[] {
    return this.cases.filter(
      (c) =>
        c.priority === 'CRITICAL' ||
        c.caseFlags?.includes('CRITICAL')
    );
  }

  public getCasesByState(state?: string): Case[] {
    if (!state || state === 'ALL' || state === 'All India') return this.getCases();
    return this.cases.filter(
      (c) => c.state?.toLowerCase() === state.toLowerCase() || c.location?.toLowerCase().includes(state.toLowerCase())
    );
  }

  public getStatesSummary(): {
    state: string;
    caseCount: number;
    activeCases: number;
    criticalCases: number;
    cases: Case[];
  }[] {
    const map = new Map<string, { state: string; caseCount: number; activeCases: number; criticalCases: number; cases: Case[] }>();

    this.cases.forEach((c) => {
      const st = c.state || 'Other';
      if (!map.has(st)) {
        map.set(st, { state: st, caseCount: 0, activeCases: 0, criticalCases: 0, cases: [] });
      }
      const entry = map.get(st)!;
      entry.caseCount += 1;
      if (c.status === 'ACTIVE') entry.activeCases += 1;
      if (c.priority === 'CRITICAL') entry.criticalCases += 1;
      entry.cases.push(c);
    });

    return Array.from(map.values()).sort((a, b) => b.caseCount - a.caseCount);
  }
}

export const investigationService = new InvestigationService();

