import { create } from 'zustand';
import {
  Case,
  Entity,
  Relationship,
  Evidence,
  Alert,
  TimelineEventType,
  InvestigationQueryResult,
  VerificationStatus,
  EntityType,
} from '../types';
import {
  investigationService,
  intelligenceService,
  auditService,
  evidenceService,
  alertService,
  GraphLayoutName,
} from '../services';

export interface GraphFilterConfig {
  entityTypes: EntityType[];
  minRiskScore: number;
  showOnlyHighRisk: boolean;
  verificationStatuses: VerificationStatus[];
}

export type ContextPanelTab = 'ENTITY' | 'EVIDENCE' | 'ALERT' | 'RELATIONSHIP' | 'AI';

export interface IntelligencePathData {
  pathFound: boolean;
  sourceEntity?: Entity;
  targetEntity?: Entity;
  nodeIds: string[];
  edgeIds: string[];
  hopCount: number;
  evidenceIds: string[];
  evidenceCount: number;
  overallConfidence: number;
  verificationStatus: VerificationStatus;
  description: string;
  chainSummary: string;
}

export interface InvestigationState {
  // Case & Identity
  currentCase: Case;
  cases: Case[];
  currentInvestigator: {
    id: string;
    name: string;
    role: string;
    badge: string;
    agency: string;
  };

  // Selections
  selectedEntity: Entity | null;
  selectedEvidence: Evidence | null;
  selectedAlert: Alert | null;
  selectedRelationship: Relationship | null;

  // Graph state
  graphLayout: GraphLayoutName;
  graphFilters: GraphFilterConfig;
  graphVersion: number;
  highlightedPath: {
    nodeIds: string[];
    edgeIds: string[];
  } | null;
  intelligencePathData: IntelligencePathData | null;

  // Timeline state
  timelineFilter: TimelineEventType | 'ALL';

  // AI Investigation state
  aiQuery: string;
  aiResult: InvestigationQueryResult | null;
  isAiThinking: boolean;

  // Context Panel state
  isRightPanelOpen: boolean;
  activeContextTab: ContextPanelTab;

  // Evidence Modal state
  isEvidenceModalOpen: boolean;
  viewingEvidence: Evidence | null;

  // Node expansion state
  expandedNodeIds: string[];

  // Actions
  selectCase: (caseId: string) => void;
  selectEntity: (entity: Entity | null) => void;
  selectEvidence: (evidence: Evidence | null) => void;
  openEvidenceModal: (evidence: Evidence) => void;
  closeEvidenceModal: () => void;
  expandNode: (entityId: string) => void;
  selectAlert: (alert: Alert | null) => void;
  selectRelationship: (rel: Relationship | null) => void;
  setGraphLayout: (layout: GraphLayoutName) => void;
  setGraphFilters: (filters: Partial<GraphFilterConfig>) => void;
  clearGraphHighlights: () => void;
  setTimelineFilter: (filter: TimelineEventType | 'ALL') => void;
  setAiQuery: (query: string) => void;
  runAiQuery: (query: string) => Promise<void>;
  traceIntelligencePath: (sourceId: string, targetId: string) => Promise<void>;
  verifyRelationshipAction: (relationshipId: string) => Promise<void>;
  rejectRelationshipAction: (relationshipId: string, reason: string) => Promise<void>;
  verifyEvidenceAction: (evidenceId: string) => Promise<void>;
  flagEvidenceAction: (evidenceId: string, reason: string) => Promise<void>;
  rejectEvidenceAction: (evidenceId: string, reason: string) => Promise<void>;
  investigateAlertAction: (alert: Alert) => Promise<void>;
  acknowledgeAlertAction: (alertId: string) => Promise<void>;
  resolveAlertAction: (alertId: string) => Promise<void>;
  toggleRightPanel: (open?: boolean) => void;
  setActiveContextTab: (tab: ContextPanelTab) => void;
}

const defaultFilters: GraphFilterConfig = {
  entityTypes: [
    'PERSON',
    'PHONE',
    'BANK_ACCOUNT',
    'LOCATION',
    'VEHICLE',
    'ORGANIZATION',
    'FIR',
    'CCTV',
    'AUDIO',
    'DOCUMENT',
  ],
  minRiskScore: 0,
  showOnlyHighRisk: false,
  verificationStatuses: ['HUMAN_VERIFIED', 'AI_SUGGESTED', 'REJECTED'],
};

export const useInvestigationStore = create<InvestigationState>((set, get) => ({
  cases: investigationService.getCases(),
  currentCase: investigationService.getCases()[0],
  currentInvestigator: {
    id: 'OFFICER-VR-88219',
    name: 'Insp. Vikramaditya Rathore',
    role: 'Senior Intelligence Investigator',
    badge: 'DL-88219',
    agency: 'Special Operations & Cyber Crime Division',
  },

  selectedEntity: null,
  selectedEvidence: null,
  selectedAlert: null,
  selectedRelationship: null,

  graphLayout: 'cose',
  graphFilters: defaultFilters,
  graphVersion: 0,
  highlightedPath: null,
  intelligencePathData: null,

  timelineFilter: 'ALL',

  aiQuery: '',
  aiResult: null,
  isAiThinking: false,

  isRightPanelOpen: true,
  activeContextTab: 'ENTITY',

  isEvidenceModalOpen: false,
  viewingEvidence: null,
  expandedNodeIds: [],

  selectCase: (caseId) => {
    const c = investigationService.getCaseById(caseId);
    if (c) {
      set({
        currentCase: c,
        selectedEntity: null,
        selectedEvidence: null,
        selectedAlert: null,
        selectedRelationship: null,
        highlightedPath: null,
        aiResult: null,
        expandedNodeIds: [],
      });
    }
  },

  selectEntity: (entity) => {
    set({
      selectedEntity: entity,
      isRightPanelOpen: entity !== null ? true : get().isRightPanelOpen,
      activeContextTab: 'ENTITY',
    });
  },

  selectEvidence: (evidence) => {
    set({
      selectedEvidence: evidence,
      isRightPanelOpen: evidence !== null ? true : get().isRightPanelOpen,
      activeContextTab: 'EVIDENCE',
    });
  },

  openEvidenceModal: (evidence) => {
    set({
      viewingEvidence: evidence,
      isEvidenceModalOpen: true,
      selectedEvidence: evidence,
      activeContextTab: 'EVIDENCE',
    });
  },

  closeEvidenceModal: () => {
    set({
      isEvidenceModalOpen: false,
      viewingEvidence: null,
    });
  },

  expandNode: (entityId) => {
    const currentExpanded = get().expandedNodeIds;
    if (!currentExpanded.includes(entityId)) {
      set({ expandedNodeIds: [...currentExpanded, entityId] });
    }
  },

  selectAlert: (alert) => {
    set({
      selectedAlert: alert,
      isRightPanelOpen: alert !== null ? true : get().isRightPanelOpen,
      activeContextTab: 'ALERT',
    });
  },

  selectRelationship: (rel) => {
    set({
      selectedRelationship: rel,
      isRightPanelOpen: rel !== null ? true : get().isRightPanelOpen,
      activeContextTab: 'RELATIONSHIP',
    });
  },

  setGraphLayout: (layout) => set({ graphLayout: layout }),

  setGraphFilters: (filters) =>
    set((state) => ({ graphFilters: { ...state.graphFilters, ...filters } })),

  clearGraphHighlights: () => set({ highlightedPath: null, intelligencePathData: null }),

  setTimelineFilter: (filter) => set({ timelineFilter: filter }),

  setAiQuery: (query) => set({ aiQuery: query }),

  runAiQuery: async (query) => {
    set({ isAiThinking: true, aiQuery: query });
    try {
      const result = await intelligenceService.queryInvestigation(query, get().currentCase.id);

      // Record query in cryptographic ledger
      await auditService.mintBlock({
        actorId: get().currentInvestigator.id,
        actorName: get().currentInvestigator.name,
        actorRole: get().currentInvestigator.role,
        action: 'AI_QUERY_EXECUTED',
        targetType: 'QUERY',
        targetId: `QRY-${Date.now()}`,
        details: `Natural Language Case Query executed: "${query}"`,
        payload: { confidence: result.confidence, pathHops: result.pathEdgeIds.length },
      });

      let pathData: IntelligencePathData | null = null;
      if (result.pathNodeIds.length >= 2) {
        pathData = intelligenceService.findStrongestPath(
          result.pathNodeIds[0],
          result.pathNodeIds[result.pathNodeIds.length - 1]
        );
      }

      set({
        aiResult: result,
        isAiThinking: false,
        intelligencePathData: pathData,
        highlightedPath: {
          nodeIds: result.pathNodeIds,
          edgeIds: result.pathEdgeIds,
        },
        activeContextTab: 'AI',
        isRightPanelOpen: true,
      });
    } catch {
      set({ isAiThinking: false });
    }
  },

  verifyRelationshipAction: async (relationshipId) => {
    const investigator = get().currentInvestigator;
    const updatedRel = investigationService.verifyRelationship(relationshipId, investigator.name);
    if (!updatedRel) return;

    // Mint blockchain audit block
    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'RELATIONSHIP_VERIFIED',
      targetType: 'RELATIONSHIP',
      targetId: relationshipId,
      details: `Relationship [${relationshipId}: ${updatedRel.type}] approved and transitioned to HUMAN_VERIFIED status.`,
      payload: { confidence: updatedRel.confidence, verifiedBy: investigator.name },
    });

    set({
      selectedRelationship: updatedRel,
      graphVersion: get().graphVersion + 1,
    });
  },

  rejectRelationshipAction: async (relationshipId, reason) => {
    const investigator = get().currentInvestigator;
    const updatedRel = investigationService.rejectRelationship(
      relationshipId,
      investigator.name,
      reason
    );
    if (!updatedRel) return;

    // Mint blockchain audit block
    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'RELATIONSHIP_REJECTED',
      targetType: 'RELATIONSHIP',
      targetId: relationshipId,
      details: `Relationship [${relationshipId}: ${updatedRel.type}] rejected by human review. Reason: ${reason}`,
      payload: { reason, rejectedBy: investigator.name },
    });

    set({
      selectedRelationship: updatedRel,
      graphVersion: get().graphVersion + 1,
    });
  },

  traceIntelligencePath: async (sourceId, targetId) => {
    const result = intelligenceService.findStrongestPath(sourceId, targetId);
    const investigator = get().currentInvestigator;

    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'AI_QUERY_EXECUTED',
      targetType: 'QUERY',
      targetId: `PATH-${sourceId}-${targetId}`,
      details: `Intelligence Path traced between ${sourceId} and ${targetId}. Discovered ${result.hopCount} hops with ${result.overallConfidence}% confidence.`,
      payload: { sourceId, targetId, hops: result.hopCount, nodes: result.nodeIds },
    });

    set({
      intelligencePathData: result,
      highlightedPath: {
        nodeIds: result.nodeIds,
        edgeIds: result.edgeIds,
      },
      selectedEntity: result.sourceEntity || null,
      isRightPanelOpen: true,
      activeContextTab: 'AI',
    });
  },

  investigateAlertAction: async (alert) => {
    alertService.updateAlertStatus(alert.id, 'INVESTIGATING');
    const investigator = get().currentInvestigator;

    // Find edges connecting alert entities
    const rels = investigationService.getRelationships(get().currentCase.id);
    const entitySet = new Set(alert.entityIds);
    const matchedEdgeIds = rels
      .filter((r) => entitySet.has(r.sourceId) && entitySet.has(r.targetId))
      .map((r) => r.id);

    const firstEntity =
      alert.entityIds.length > 0 ? investigationService.getEntityById(alert.entityIds[0]) : null;

    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'ALERT_ACKNOWLEDGED',
      targetType: 'ALERT',
      targetId: alert.id,
      details: `Alert [${alert.id}: ${alert.title}] opened for active graph investigation.`,
      payload: { severity: alert.severity, entityIds: alert.entityIds },
    });

    set({
      selectedAlert: { ...alert, status: 'INVESTIGATING' },
      selectedEntity: firstEntity || null,
      activeContextTab: 'ALERT',
      isRightPanelOpen: true,
      highlightedPath: {
        nodeIds: alert.entityIds,
        edgeIds: matchedEdgeIds,
      },
    });
  },

  acknowledgeAlertAction: async (alertId) => {
    const updated = alertService.acknowledgeAlert(alertId);
    if (!updated) return;
    const investigator = get().currentInvestigator;

    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'ALERT_ACKNOWLEDGED',
      targetType: 'ALERT',
      targetId: alertId,
      details: `Alert [${alertId}: ${updated.title}] marked ACKNOWLEDGED.`,
      payload: { alertId, status: 'ACKNOWLEDGED' },
    });

    set({
      selectedAlert: updated,
    });
  },

  resolveAlertAction: async (alertId) => {
    const updated = alertService.updateAlertStatus(alertId, 'RESOLVED');
    if (!updated) return;
    const investigator = get().currentInvestigator;

    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'ALERT_ACKNOWLEDGED',
      targetType: 'ALERT',
      targetId: alertId,
      details: `Alert [${alertId}: ${updated.title}] marked RESOLVED by investigator.`,
      payload: { alertId, status: 'RESOLVED' },
    });

    set({
      selectedAlert: updated,
    });
  },

  verifyEvidenceAction: async (evidenceId) => {
    const investigator = get().currentInvestigator;
    const updated = evidenceService.verifyEvidence(evidenceId, investigator.name);
    if (!updated) return;

    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'EVIDENCE_VERIFIED',
      targetType: 'EVIDENCE',
      targetId: evidenceId,
      details: `Forensic exhibit [${evidenceId}: ${updated.title}] verified and digitally attested.`,
      payload: { hash: updated.hash, confidence: updated.confidence, verifiedBy: investigator.name },
    });

    set({
      selectedEvidence: updated,
      viewingEvidence: get().viewingEvidence?.id === evidenceId ? updated : get().viewingEvidence,
      graphVersion: get().graphVersion + 1,
    });
  },

  flagEvidenceAction: async (evidenceId, reason) => {
    const investigator = get().currentInvestigator;
    const updated = evidenceService.flagEvidence(evidenceId, investigator.name, reason);
    if (!updated) return;

    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'EVIDENCE_FLAGGED',
      targetType: 'EVIDENCE',
      targetId: evidenceId,
      details: `Forensic exhibit [${evidenceId}] flagged for anomaly: ${reason}`,
      payload: { reason, flaggedBy: investigator.name },
    });

    set({
      selectedEvidence: updated,
      viewingEvidence: get().viewingEvidence?.id === evidenceId ? updated : get().viewingEvidence,
      graphVersion: get().graphVersion + 1,
    });
  },

  rejectEvidenceAction: async (evidenceId, reason) => {
    const investigator = get().currentInvestigator;
    const updated = evidenceService.rejectEvidence(evidenceId, investigator.name, reason);
    if (!updated) return;

    await auditService.mintBlock({
      actorId: investigator.id,
      actorName: investigator.name,
      actorRole: investigator.role,
      action: 'EVIDENCE_REJECTED',
      targetType: 'EVIDENCE',
      targetId: evidenceId,
      details: `Forensic exhibit [${evidenceId}] rejected: ${reason}`,
      payload: { reason, rejectedBy: investigator.name },
    });

    set({
      selectedEvidence: updated,
      viewingEvidence: get().viewingEvidence?.id === evidenceId ? updated : get().viewingEvidence,
      graphVersion: get().graphVersion + 1,
    });
  },

  toggleRightPanel: (open) =>
    set((state) => ({ isRightPanelOpen: open !== undefined ? open : !state.isRightPanelOpen })),

  setActiveContextTab: (tab) => set({ activeContextTab: tab }),
}));
