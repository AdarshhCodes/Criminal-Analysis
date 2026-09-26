export interface AuditEvent {
  id: string; // e.g. "IF-BLK-001"
  blockIndex: number;
  previousHash: string;
  blockHash: string;
  merkleRoot: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action:
    | 'CASE_CREATED'
    | 'CASE_UPDATED'
    | 'EVIDENCE_ADDED'
    | 'PERSON_LINKED'
    | 'REPORT_GENERATED'
    | 'SEARCH_PERFORMED'
    | 'STATUS_CHANGED'
    | 'RELATIONSHIP_VERIFIED'
    | 'RELATIONSHIP_REJECTED'
    | 'AI_QUERY_EXECUTED'
    | 'EVIDENCE_ACCESSED'
    | 'EVIDENCE_VERIFIED'
    | 'EVIDENCE_FLAGGED'
    | 'EVIDENCE_REJECTED'
    | 'CASE_INITIATED'
    | 'ALERT_ACKNOWLEDGED';
  targetType: 'CASE' | 'RELATIONSHIP' | 'ENTITY' | 'EVIDENCE' | 'QUERY' | 'REPORT' | 'ALERT' | 'SEARCH' | 'SYSTEM';
  targetId: string;
  timestamp: string;
  details: string;
  payload: Record<string, unknown>;
  signature: string;
}
