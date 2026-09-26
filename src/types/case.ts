export type CaseStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'CLOSED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CaseFlag =
  | 'WOMEN_RELATED'
  | 'CRITICAL'
  | 'FINANCIAL'
  | 'CYBER'
  | 'NARCOTICS'
  | 'ORGANIZED_CRIME'
  | 'INTERSTATE';

export interface ImportantPerson {
  id: string;
  name: string;
  role: string;
  classification: 'ACCUSED' | 'VICTIM' | 'WITNESS' | 'SUSPECT';
  riskScore: number;
}

export interface FinancialActivitySummary {
  totalVolume: string;
  transactionCount: number;
  suspiciousAccounts: number;
  muleCount: number;
  hawalaCorridor?: string;
}

export interface Case {
  id: string;
  code: string; // e.g. "IF-CASE-2026-0882"
  name: string; // e.g. "Operation Falcon"
  status: CaseStatus;
  priority: CasePriority;
  category: string; // e.g. "Women-Related Cyber Crime", "Financial Hawala"
  caseFlags?: CaseFlag[]; // e.g. ['WOMEN_RELATED', 'CRITICAL']
  leadInvestigator: string;
  assignedUnit: string;
  assignedTeam?: string;
  location: string; // e.g. "Delhi NCR"
  state: string; // e.g. "Delhi", "Maharashtra", "Karnataka", "West Bengal", "Gujarat"
  city?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  lastActivity?: string;
  entityIds: string[];
  importantPeople?: ImportantPerson[];
  evidenceCount: number;
  alertCount: number;
  financialActivity?: FinancialActivitySummary;
  metrics: {
    totalEntities: number;
    highRiskEntities: number;
    verifiedConnections: number;
    pendingReviewConnections: number;
  };
}

