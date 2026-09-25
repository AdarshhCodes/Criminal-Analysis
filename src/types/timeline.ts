export type TimelineEventType =
  | 'CALL'
  | 'CCTV'
  | 'FINANCIAL'
  | 'FIR'
  | 'LOCATION'
  | 'AI_FINDING';

export interface TimelineEvent {
  id: string; // e.g. "IF-TLE-001"
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description: string;
  entityIds: string[];
  evidenceIds: string[];
  location?: string;
  amount?: string;
  metadata?: Record<string, string | number | boolean>;
}
