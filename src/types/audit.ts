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
    | 'RELATIONSHIP_VERIFIED'
    | 'RELATIONSHIP_REJECTED'
    | 'AI_QUERY_EXECUTED'
    | 'EVIDENCE_ACCESSED'
    | 'EVIDENCE_VERIFIED'
    | 'EVIDENCE_FLAGGED'
    | 'EVIDENCE_REJECTED'
    | 'CASE_INITIATED'
    | 'REPORT_GENERATED'
    | 'ALERT_ACKNOWLEDGED';
  targetType: 'CASE' | 'RELATIONSHIP' | 'ENTITY' | 'EVIDENCE' | 'QUERY' | 'REPORT' | 'ALERT';
  targetId: string;
  timestamp: string;
  details: string;
  payload: Record<string, unknown>;
  signature: string;
}
