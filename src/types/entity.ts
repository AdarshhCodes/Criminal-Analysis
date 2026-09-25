export type EntityType =
  | 'PERSON'
  | 'PHONE'
  | 'BANK_ACCOUNT'
  | 'TRANSACTION'
  | 'LOCATION'
  | 'VEHICLE'
  | 'ORGANIZATION'
  | 'FIR'
  | 'CCTV'
  | 'AUDIO'
  | 'DOCUMENT';

export type EntityStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'CLEARED' | 'HIGH_RISK';

export interface Entity {
  id: string; // e.g. "IF-P-001"
  type: EntityType;
  name: string;
  aliases?: string[];
  role?: string; // e.g. "Syndicate Kingpin", "Hawala Courier", "Burner SIM Reseller"
  riskScore: number; // 0 - 100
  status: EntityStatus;
  primaryIdentifier?: string; // phone number, bank account number, plate number, FIR number
  metadata: Record<string, string | number | boolean | string[]>;
  tags: string[];
  photoUrl?: string;
  notes?: string;
  connectionsCount?: number;
  lastActive?: string;
}
