export type CaseStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'CLOSED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CaseFlag =
  | 'WOMEN_RELATED'
  | 'CRITICAL'
  | 'FINANCIAL'
  | 'CYBER'
  | 'NARCOTICS'
  | 'ORGANIZED_CRIME';

export interface Case {
  id: string;
  code: string; // e.g. "IF-CASE-2026-0882"
  name: string; // e.g. "Operation Falcon"
  status: CaseStatus;
  priority: CasePriority;
  category?: string; // e.g. "Women-Related Cyber Crime", "Financial Hawala"
  caseFlags?: CaseFlag[]; // e.g. ['WOMEN_RELATED', 'CRITICAL']
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
