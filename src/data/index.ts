import { Case } from '../types';
import {
  OPERATION_FALCON_CASE,
  SYNTHETIC_ENTITIES as FALCON_ENTITIES,
  SYNTHETIC_RELATIONSHIPS as FALCON_RELATIONSHIPS,
  SYNTHETIC_EVIDENCE as FALCON_EVIDENCE,
  SYNTHETIC_ALERTS as FALCON_ALERTS,
  SYNTHETIC_TIMELINE as FALCON_TIMELINE,
} from './operationFalcon';

import {
  OPERATION_RAKSHAK_CASE,
  OPERATION_CHIMERA_CASE,
  OPERATION_DARKVESSEL_CASE,
  MULTI_CASE_ENTITIES,
  MULTI_CASE_RELATIONSHIPS,
  MULTI_CASE_EVIDENCE,
  MULTI_CASE_ALERTS,
  MULTI_CASE_TIMELINE,
} from './multiCases';

export * from './operationFalcon';
export * from './multiCases';

// Virtual case representing the consolidated Executive Portfolio view
export const ALL_CASES_PORTFOLIO: Case = {
  id: 'ALL',
  code: 'ALL-OPERATIONS',
  name: 'Executive Portfolio: All Investigations',
  status: 'ACTIVE',
  priority: 'CRITICAL',
  category: 'Multi-Agency Operations Portfolio',
  caseFlags: ['CRITICAL'],
  leadInvestigator: 'Central Operations Command',
  assignedUnit: 'Special Operations Taskforce HQ',
  description:
    'Consolidated executive intelligence view across all active operations, taskforces, and high-threat syndicates.',
  createdAt: '2026-03-10T08:00:00Z',
  updatedAt: '2026-09-11T12:30:00Z',
  entityIds: [], // Populated dynamically or refers to all
  evidenceCount: 28,
  alertCount: 15,
  metrics: {
    totalEntities: 55,
    highRiskEntities: 14,
    verifiedConnections: 57,
    pendingReviewConnections: 9,
  },
};

export const COMBINED_CASES: Case[] = [
  OPERATION_FALCON_CASE,
  OPERATION_RAKSHAK_CASE,
  OPERATION_CHIMERA_CASE,
  OPERATION_DARKVESSEL_CASE,
];

export const ALL_ENTITIES = [...FALCON_ENTITIES, ...MULTI_CASE_ENTITIES];
export const ALL_RELATIONSHIPS = [...FALCON_RELATIONSHIPS, ...MULTI_CASE_RELATIONSHIPS];
export const ALL_EVIDENCE = [...FALCON_EVIDENCE, ...MULTI_CASE_EVIDENCE];
export const ALL_ALERTS = [...FALCON_ALERTS, ...MULTI_CASE_ALERTS];
export const ALL_TIMELINE = [...FALCON_TIMELINE, ...MULTI_CASE_TIMELINE];

// Overwrite the default exported DEMO_CASES with all 4 cases
export const ALL_DEMO_CASES: Case[] = COMBINED_CASES;
