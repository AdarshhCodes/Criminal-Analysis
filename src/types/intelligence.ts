import { VerificationStatus } from './relationship';

export interface AgentReasoningStep {
  agentName: 'Orchestrator' | 'Telecom Agent' | 'Financial Agent' | 'Visual Vision Agent' | 'Graph Analytics' | 'Vector DB';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'VERIFIED';
  action: string;
  finding: string;
  confidence: number;
  durationMs: number;
}

export interface InvestigationQueryResult {
  query: string;
  answer: string;
  confidence: number; // 0 - 100
  reasoningSummary: string;
  agentSteps: AgentReasoningStep[];
  pathNodeIds: string[];
  pathEdgeIds: string[];
  evidenceIds: string[];
  verificationStatus: VerificationStatus;
  suggestedFollowUps: string[];
}
