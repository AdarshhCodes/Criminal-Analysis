export type VerificationStatus =
  | 'AI_SUGGESTED'
  | 'HUMAN_VERIFIED'
  | 'REJECTED';

export type RelationshipType =
  | 'CALLED'
  | 'OWNS'
  | 'TRANSFERRED'
  | 'LOCATED_AT'
  | 'SEEN_WITH'
  | 'ASSOCIATED_WITH'
  | 'REFERENCED_BY'
  | 'SUSPECTED_HAWALA_LINK'
  | 'BURNER_SIM_SUPPLIER'
  | 'CO_CONSPIRATOR';

export interface Relationship {
  id: string; // e.g. "IF-REL-001"
  sourceId: string; // source entity ID
  targetId: string; // target entity ID
  type: RelationshipType | string;
  label?: string;
  confidence: number; // 0 - 100
  verificationStatus: VerificationStatus;
  evidenceIds: string[]; // Supporting evidence IDs
  createdAt: string;
  verifiedBy?: string; // Investigator ID or Name
  verifiedAt?: string;
  rejectionReason?: string;
  metadata?: Record<string, string | number | boolean>;
  aiReasoning?: string; // Multi-agent hypothesis explanation
}
