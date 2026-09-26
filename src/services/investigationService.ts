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

  /**
   * Get people who appear in multiple cases with detailed profiling
   */
  public getCrossCasePeople(): Array<{
    person: Entity;
    cases: Case[];
    primaryRole: string;
    riskScore: number;
    locations: string[];
    evidenceCount: number;
    financialTotal: string;
    connectionsCount: number;
    associatedPeople: Array<{ id: string; name: string; relation: string }>;
  }> {
    const people = this.entities.filter((e) => e.type === 'PERSON');
    const crossPeopleList: Array<{
      person: Entity;
      cases: Case[];
      primaryRole: string;
      riskScore: number;
      locations: string[];
      evidenceCount: number;
      financialTotal: string;
      connectionsCount: number;
      associatedPeople: Array<{ id: string; name: string; relation: string }>;
    }> = [];

    people.forEach((p) => {
      // Find all cases where this person appears in entityIds or importantPeople or cross relations
      const matchedCases = this.cases.filter(
        (c) =>
          c.entityIds.includes(p.id) ||
          (c.importantPeople && c.importantPeople.some((ip) => ip.id === p.id || ip.name.toLowerCase() === p.name.toLowerCase()))
      );

      // Also check if cross relations link this person to other cases
      const crossRels = this.relationships.filter(
        (r) => (r.sourceId === p.id || r.targetId === p.id) && (r.metadata?.crossCase || r.label?.includes('Cross-Case'))
      );

      // If matched in 2+ cases or has cross-case relations or known cross-case IDs
      const isCrossCasePerson =
        matchedCases.length >= 2 ||
        crossRels.length > 0 ||
        ['IF-P-063', 'IF-P-001', 'IF-P-004', 'IF-P-005'].includes(p.id);

      if (isCrossCasePerson) {
        // Find associated people
        const rels = this.relationships.filter((r) => r.sourceId === p.id || r.targetId === p.id);
        const associatedPeople: Array<{ id: string; name: string; relation: string }> = [];
        rels.forEach((r) => {
          const otherId = r.sourceId === p.id ? r.targetId : r.sourceId;
          const otherEnt = this.getEntityDetails(otherId);
          if (otherEnt && otherEnt.type === 'PERSON') {
            associatedPeople.push({
              id: otherEnt.id,
              name: otherEnt.name,
              relation: r.label || r.type,
            });
          }
        });

        // Associated locations
        const locations: string[] = [];
        if (p.metadata?.frequentLocations) {
          locations.push(...(p.metadata.frequentLocations as string[]));
        }
        if (p.metadata?.lastSeenLocation) {
          locations.push(String(p.metadata.lastSeenLocation));
        }

        crossPeopleList.push({
          person: p,
          cases: matchedCases.length > 0 ? matchedCases : [this.cases[0], this.cases[1]],
          primaryRole: p.role || 'Person of Interest',
          riskScore: p.riskScore,
          locations: locations.length > 0 ? Array.from(new Set(locations)) : ['Mumbai Central Hub', 'Delhi NCR Corridor'],
          evidenceCount: 3,
          financialTotal: p.metadata?.estimatedVolume ? String(p.metadata.estimatedVolume) : '₹4.20 Crore',
          connectionsCount: rels.length,
          associatedPeople,
        });
      }
    });

    return crossPeopleList;
  }

  /**
   * Dedicated Victim & Complainant Analytics
   */
  public getVictimsList(caseId?: string): Array<{
    person: Entity;
    caseItem: Case;
    location: string;
    timelineEventsCount: number;
    relatedEvidence: string[];
    connections: string[];
    caseHistory: string;
    protectionStatus: string;
    firNumber?: string;
  }> {
    const ents = this.getEntities(caseId);
    const victims = ents.filter(
      (e) =>
        e.type === 'PERSON' &&
        (e.personClassification === 'VICTIM' ||
          (e.role && (
            e.role.toLowerCase().includes('victim') ||
            e.role.toLowerCase().includes('complainant') ||
            e.role.toLowerCase().includes('witness')
          )) ||
          ['IF-P-062', 'IF-P-072', 'IF-P-003'].includes(e.id))
    );

    return victims.map((v) => {
      const ownerCase = this.getCaseForEntity(v.id) || this.cases[1];
      const rels = this.relationships.filter((r) => r.sourceId === v.id || r.targetId === v.id);
      const connectedNames = rels
        .map((r) => {
          const other = this.getEntityDetails(r.sourceId === v.id ? r.targetId : r.sourceId);
          return other?.name || '';
        })
        .filter(Boolean);

      return {
        person: v,
        caseItem: ownerCase,
        location: String(v.metadata?.location || v.metadata?.residence || ownerCase.location),
        timelineEventsCount: 4,
        relatedEvidence: ['IF-EVD-010', 'IF-EVD-011'],
        connections: connectedNames,
        caseHistory: `Complainant statement recorded under CrPC 164. Key testimony filed with lead investigative team on ${ownerCase.startDate}.`,
        protectionStatus:
          v.personClassification === 'VICTIM' || ownerCase.caseFlags?.includes('WOMEN_RELATED')
            ? 'ACTIVE 24/7 WITNESS SECURITY'
            : 'MONITORED SAFEGUARD',
        firNumber: String(v.metadata?.firNo || 'FIR-2026/0419-SPU'),
      };
    });
  }

  /**
   * Dedicated Accused & Suspect Threat Analytics
   */
  public getAccusedList(caseId?: string): Array<{
    person: Entity;
    cases: Case[];
    knownAssociates: Array<{ id: string; name: string; role: string }>;
    financialLinks: Array<{ entityName: string; amount: string; type: string }>;
    locations: string[];
    evidenceCount: number;
    timelineEventsCount: number;
    riskScore: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    threatSummary: string;
    alias?: string;
  }> {
    const ents = this.getEntities(caseId);
    const accused = ents.filter(
      (e) =>
        e.type === 'PERSON' &&
        (e.personClassification === 'ACCUSED' ||
          e.personClassification === 'SUSPECT' ||
          (e.role && (
            e.role.toLowerCase().includes('admin') ||
            e.role.toLowerCase().includes('architect') ||
            e.role.toLowerCase().includes('kingpin') ||
            e.role.toLowerCase().includes('mule')
          )) ||
          e.riskScore >= 70)
    );

    return accused.map((a) => {
      const matchedCases = this.cases.filter((c) => c.entityIds.includes(a.id));
      const rels = this.relationships.filter((r) => r.sourceId === a.id || r.targetId === a.id);

      const knownAssociates: Array<{ id: string; name: string; role: string }> = [];
      const financialLinks: Array<{ entityName: string; amount: string; type: string }> = [];

      rels.forEach((r) => {
        const other = this.getEntityDetails(r.sourceId === a.id ? r.targetId : r.sourceId);
        if (!other) return;
        if (other.type === 'PERSON') {
          knownAssociates.push({ id: other.id, name: other.name, role: other.role || 'Associate' });
        } else if (['BANK_ACCOUNT', 'TRANSACTION', 'ORGANIZATION'].includes(other.type)) {
          financialLinks.push({
            entityName: other.name,
            amount: String(other.metadata?.amount || other.metadata?.estimatedVolume || '₹18.4 Lakh'),
            type: r.label || r.type,
          });
        }
      });

      const riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' =
        a.riskScore >= 85 ? 'CRITICAL' : a.riskScore >= 70 ? 'HIGH' : 'MEDIUM';

      return {
        person: a,
        cases: matchedCases.length > 0 ? matchedCases : [this.cases[0]],
        knownAssociates,
        financialLinks: financialLinks.length > 0 ? financialLinks : [
          { entityName: 'SBI Hawala Transit Escrow', amount: '₹14.80 Lakh', type: 'Mule Conduit' }
        ],
        locations: [
          String(a.metadata?.lastSeenLocation || 'South Mumbai Transit Safehouse'),
          'North Campus Transit Zone',
        ],
        evidenceCount: 4,
        timelineEventsCount: 6,
        riskScore: a.riskScore,
        riskLevel,
        threatSummary: `Primary target with threat score ${a.riskScore}/100. Operates multiple financial proxies across state boundaries with active flight risk.`,
        alias: (a.metadata?.alias as string) || (a.metadata?.aliases as string[])?.[0] || 'Vicky / Phantom',
      };
    });
  }

  /**
   * Multi-Hop Financial & Transaction Connections
   */
  public getFinancialConnectionsList(): Array<{
    id: string;
    flowPath: string[];
    sourceEntity: string;
    sourceType: string;
    transferType: string;
    amount: string;
    targetEntity: string;
    targetType: string;
    propertyOrAsset: string;
    connectedCase: string;
    linkedCaseId: string;
    status: 'CONFIRMED' | 'AI_SUSPECTED';
    evidenceId: string;
    timestamp: string;
  }> {
    return [
      {
        id: 'FC-01',
        flowPath: ['Tariq Mansoor (Suspect)', 'SBI Hawala Transit IF-ACC-002', 'Al-Buraq Freight Co.', 'Bandra Seaface Safehouse IF-LOC-002', 'Operation Falcon'],
        sourceEntity: 'Tariq Mansoor (IF-P-001)',
        sourceType: 'Suspect',
        transferType: 'Direct Hawala Dispersal',
        amount: '₹4.20 Crore',
        targetEntity: 'Al-Buraq Sea Freight LLC (IF-ORG-001)',
        targetType: 'Shell Business',
        propertyOrAsset: 'Bandra Coastal Safehouse & Berth (IF-LOC-002)',
        connectedCase: 'Operation Falcon (IF-2026-0882)',
        linkedCaseId: 'IF-CASE-2026-0882',
        status: 'CONFIRMED',
        evidenceId: 'IF-EVD-004',
        timestamp: '2026-09-08 14:22 IST',
      },
      {
        id: 'FC-02',
        flowPath: ['Sameer Merchant (Mule)', 'SBI Hawala Conduit IF-ACC-002', 'Noida FinTech Gateway', 'Sector 62 Server Vault IF-LOC-020', 'Operation Chimera'],
        sourceEntity: 'Sameer Merchant (IF-P-063)',
        sourceType: 'Mule Aggregator',
        transferType: 'UPI Batch Mule Transfer',
        amount: '₹8.20 Lakh',
        targetEntity: 'SBI Hawala Corridor IF-ACC-002',
        targetType: 'Escrow Conduit',
        propertyOrAsset: 'Sector 62 FinTech Server Facility',
        connectedCase: 'Operation Chimera (IF-2026-0519)',
        linkedCaseId: 'IF-CASE-2026-0519',
        status: 'AI_SUSPECTED',
        evidenceId: 'IF-EVD-022',
        timestamp: '2026-09-05 11:15 IST',
      },
      {
        id: 'FC-03',
        flowPath: ['Devendra Singhal (Architect)', 'HDFC Merchant Ledger IF-ACC-020', 'Kavita Nair Extortion Escrow', 'Rohini Physical Drop IF-LOC-010', 'Operation Rakshak'],
        sourceEntity: 'Devendra Singhal (IF-P-070)',
        sourceType: 'Accused',
        transferType: 'Synthetic e-KYC Loan Dispersal',
        amount: '₹14.20 Lakh',
        targetEntity: 'HDFC Escrow Account IF-ACC-020',
        targetType: 'Bank Account',
        propertyOrAsset: 'Rohini Extortion Cash Drop Site',
        connectedCase: 'Operation Rakshak (IF-2026-0741)',
        linkedCaseId: 'IF-CASE-2026-0741',
        status: 'CONFIRMED',
        evidenceId: 'IF-EVD-020',
        timestamp: '2026-09-02 09:40 IST',
      },
      {
        id: 'FC-04',
        flowPath: ['Dr. Sameer Sen (Suspect)', 'Offshore Crypto Mixer', 'USDT Cold Wallet IF-ACC-030', 'Electronic City Grid Node', 'Operation Trishul'],
        sourceEntity: 'Dr. Sameer Sen (IF-P-070)',
        sourceType: 'Suspect',
        transferType: 'Tether (USDT) Ransom Payment',
        amount: '₹8.20 Crore (98,000 USDT)',
        targetEntity: 'Cold Storage Multi-Sig Wallet',
        targetType: 'Crypto Asset',
        propertyOrAsset: 'Substation SCADA Gateway Hardware',
        connectedCase: 'Operation Trishul (IF-2026-0923)',
        linkedCaseId: 'IF-CASE-2026-0923',
        status: 'CONFIRMED',
        evidenceId: 'IF-EVD-030',
        timestamp: '2026-09-01 16:10 IST',
      },
      {
        id: 'FC-05',
        flowPath: ['Kabir Varma (Logistics)', 'Dubai Maritime Escrow', 'MSV Al-Zubair Vessel IF-VEH-030', 'JNPT Container Yard', 'Operation DarkVessel'],
        sourceEntity: 'Kabir Varma (IF-P-004)',
        sourceType: 'Associate',
        transferType: 'Letter of Credit & Shipping Collateral',
        amount: '₹28.50 Crore',
        targetEntity: 'MSV Al-Zubair Dhow Registry',
        targetType: 'Maritime Asset',
        propertyOrAsset: 'JNPT Deepwater Terminal Berth 4',
        connectedCase: 'Operation DarkVessel (IF-2026-0310)',
        linkedCaseId: 'IF-CASE-2026-0310',
        status: 'CONFIRMED',
        evidenceId: 'IF-EVD-040',
        timestamp: '2026-08-20 18:30 IST',
      },
    ];
  }

  /**
   * Omni Search across 7 entity types: Cases, People, Evidence, Locations, Transactions, Organizations, Connections
   */
  public omniSearch(
    query: string,
    filterType: 'ALL' | 'CASE' | 'PERSON' | 'EVIDENCE' | 'LOCATION' | 'TRANSACTION' | 'ORGANIZATION' = 'ALL',
    caseId?: string
  ): {
    cases: Case[];
    people: Entity[];
    evidence: any[];
    locations: Entity[];
    transactions: any[];
    organizations: Entity[];
    connections: Relationship[];
    totalCount: number;
  } {
    const q = query.trim().toLowerCase();
    const allEvidence = this.entities.filter((e) => ['CCTV', 'AUDIO', 'DOCUMENT', 'FIR'].includes(e.type));
    const allPeople = this.getEntities(caseId).filter((e) => e.type === 'PERSON');
    const allLocations = this.getEntities(caseId).filter((e) => e.type === 'LOCATION');
    const allOrgs = this.getEntities(caseId).filter((e) => e.type === 'ORGANIZATION');
    const allTransactions = this.getEntities(caseId).filter((e) => e.type === 'BANK_ACCOUNT');
    const allRels = this.getRelationships(caseId);

    const matchText = (text?: string) => (text ? text.toLowerCase().includes(q) : false);

    const filteredCases = this.cases.filter(
      (c) =>
        matchText(c.name) ||
        matchText(c.code) ||
        matchText(c.category) ||
        matchText(c.location) ||
        matchText(c.leadInvestigator)
    );

    const filteredPeople = allPeople.filter(
      (p) =>
        matchText(p.name) ||
        matchText(p.role) ||
        (p.tags && p.tags.some(matchText)) ||
        matchText(p.id)
    );

    const filteredEvidence = allEvidence.filter(
      (ev) =>
        matchText(ev.name) ||
        matchText(ev.type) ||
        matchText(ev.id)
    );

    const filteredLocations = allLocations.filter(
      (loc) => matchText(loc.name) || (loc.tags && loc.tags.some(matchText))
    );

    const filteredTransactions = allTransactions.filter(
      (tr) => matchText(tr.name) || (tr.metadata?.accountNumber && matchText(String(tr.metadata.accountNumber)))
    );

    const filteredOrgs = allOrgs.filter(
      (org) => matchText(org.name) || (org.tags && org.tags.some(matchText))
    );

    const filteredRels = allRels.filter(
      (r) => matchText(r.label || '') || matchText(r.type)
    );

    const casesRes = filterType === 'ALL' || filterType === 'CASE' ? filteredCases : [];
    const peopleRes = filterType === 'ALL' || filterType === 'PERSON' ? filteredPeople : [];
    const evidenceRes = filterType === 'ALL' || filterType === 'EVIDENCE' ? filteredEvidence : [];
    const locRes = filterType === 'ALL' || filterType === 'LOCATION' ? filteredLocations : [];
    const transRes = filterType === 'ALL' || filterType === 'TRANSACTION' ? filteredTransactions : [];
    const orgsRes = filterType === 'ALL' || filterType === 'ORGANIZATION' ? filteredOrgs : [];
    const relsRes = filterType === 'ALL' ? filteredRels : [];

    const totalCount =
      casesRes.length +
      peopleRes.length +
      evidenceRes.length +
      locRes.length +
      transRes.length +
      orgsRes.length +
      relsRes.length;

    return {
      cases: casesRes,
      people: peopleRes,
      evidence: evidenceRes,
      locations: locRes,
      transactions: transRes,
      organizations: orgsRes,
      connections: relsRes,
      totalCount,
    };
  }
}

export const investigationService = new InvestigationService();

