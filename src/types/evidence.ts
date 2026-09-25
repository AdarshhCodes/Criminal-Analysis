import { VerificationStatus } from './relationship';

export type EvidenceType =
  | 'FIR'
  | 'CDR'
  | 'CCTV'
  | 'FINANCIAL'
  | 'AUDIO'
  | 'DOCUMENT';

export interface ChainOfCustodyRecord {
  step: number;
  officer: string;
  badgeNumber: string;
  agency: string;
  action: string;
  timestamp: string;
  hashSignature: string;
}

export interface Evidence {
  id: string; // e.g. "IF-EVD-001"
  type: EvidenceType;
  title: string;
  source: string;
  timestamp: string;
  entityIds: string[];
  confidence: number;
  verificationStatus: VerificationStatus;
  hash: string; // SHA-256
  description: string;
  contentSnippet?: string; // transcript or extract
  metadata?: Record<string, string | number | boolean>;
  chainOfCustody: ChainOfCustodyRecord[];
  fileSize?: string;
  mimeType?: string;
}
