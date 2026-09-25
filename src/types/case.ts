export type CaseStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'CLOSED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Case {
  id: string;
  code: string; // e.g. "IF-CASE-2026-0882"
  name: string; // e.g. "Operation Falcon"
  status: CaseStatus;
  priority: CasePriority;
  leadInvestigator: string;
  assignedUnit: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  entityIds: string[];
  evidenceCount: number;
  alertCount: number;
  metrics: {
    totalEntities: number;
    highRiskEntities: number;
    verifiedConnections: number;
    pendingReviewConnections: number;
  };
}
