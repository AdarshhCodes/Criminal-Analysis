export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';

export interface Alert {
  id: string; // e.g. "IF-ALT-001"
  type: string; // e.g. "HAWALA_CLUSTER", "BURNER_ACTIVATION", "CO_LOCATION"
  severity: AlertSeverity;
  title: string;
  description: string;
  entityIds: string[];
  confidence: number; // 0 - 100
  timestamp: string;
  status: AlertStatus;
  recommendedAction?: string;
  triggerDetails?: Record<string, string | number | boolean>;
}
