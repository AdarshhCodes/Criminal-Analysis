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
  OPERATION_TRISHUL_CASE,
  OPERATION_JALTARANG_CASE,
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
  caseFlags: ['CRITICAL', 'INTERSTATE'],
  leadInvestigator: 'Central Operations Command',
  assignedUnit: 'Special Operations Taskforce HQ',
  assignedTeam: 'Inter-Agency Joint Taskforce HQ',
  location: 'Pan-India Operations (Multi-State)',
  state: 'All India',
  city: 'National Command',
  description:
    'Consolidated executive intelligence view across all active operations, taskforces, and high-threat syndicates.',
  createdAt: '2026-03-10T08:00:00Z',
  updatedAt: '2026-09-11T14:15:00Z',
  startDate: '2026-03-10',
  lastActivity: '2026-09-11 18:22 IST',
  entityIds: [], // Populated dynamically or refers to all
  evidenceCount: 35,
  alertCount: 18,
  financialActivity: {
    totalVolume: '₹202.0 Crore',
    transactionCount: 628,
    suspiciousAccounts: 48,
    muleCount: 104,
    hawalaCorridor: 'Pan-India Inter-State Financial Corridors',
  },
  metrics: {
    totalEntities: 65,
    highRiskEntities: 18,
    verifiedConnections: 68,
    pendingReviewConnections: 11,
  },
};

export const COMBINED_CASES: Case[] = [
  OPERATION_FALCON_CASE,
  OPERATION_RAKSHAK_CASE,
  OPERATION_TRISHUL_CASE,
  OPERATION_CHIMERA_CASE,
  OPERATION_JALTARANG_CASE,
  OPERATION_DARKVESSEL_CASE,
];

export const ALL_ENTITIES = [...FALCON_ENTITIES, ...MULTI_CASE_ENTITIES];
export const ALL_RELATIONSHIPS = [...FALCON_RELATIONSHIPS, ...MULTI_CASE_RELATIONSHIPS];
export const ALL_EVIDENCE = [...FALCON_EVIDENCE, ...MULTI_CASE_EVIDENCE];
export const ALL_ALERTS = [...FALCON_ALERTS, ...MULTI_CASE_ALERTS];
export const ALL_TIMELINE = [...FALCON_TIMELINE, ...MULTI_CASE_TIMELINE];

// Exported demo cases with all active operations
export const ALL_DEMO_CASES: Case[] = COMBINED_CASES;

