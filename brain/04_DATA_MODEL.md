# Intel-Forge — Data Model

All current records are synthetic demonstration data.

## 1. Case

```ts
type CaseStatus = "ACTIVE" | "UNDER_REVIEW" | "CLOSED";

interface Case {
  id: string;
  name: string;
  status: CaseStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  createdAt: string;
  updatedAt: string;
  entityIds: string[];
}
```

## 2. Entity

```ts
type EntityType =
  | "PERSON"
  | "PHONE"
  | "BANK_ACCOUNT"
  | "TRANSACTION"
  | "LOCATION"
  | "VEHICLE"
  | "ORGANIZATION"
  | "FIR"
  | "CCTV"
  | "AUDIO"
  | "DOCUMENT";

interface Entity {
  id: string;
  type: EntityType;
  name: string;
  riskScore?: number;
  status: "ACTIVE" | "UNDER_REVIEW" | "CLEARED";
  metadata: Record<string, string | number | boolean>;
}
```

## 3. Relationship

```ts
type VerificationStatus =
  | "AI_SUGGESTED"
  | "HUMAN_VERIFIED"
  | "REJECTED";

interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  confidence: number;
  verificationStatus: VerificationStatus;
  evidenceIds: string[];
  createdAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
}
```

## 4. Evidence

```ts
type EvidenceType =
  | "FIR"
  | "CDR"
  | "CCTV"
  | "FINANCIAL"
  | "AUDIO"
  | "DOCUMENT";

interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  source: string;
  timestamp: string;
  entityIds: string[];
  confidence: number;
  verificationStatus: VerificationStatus;
  hash: string;
  description: string;
}
```

## 5. Alert

```ts
interface Alert {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  entityIds: string[];
  confidence: number;
  timestamp: string;
  status: "NEW" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVED";
}
```

## 6. Timeline Event

```ts
interface TimelineEvent {
  id: string;
  type: "CALL" | "CCTV" | "FINANCIAL" | "FIR" | "LOCATION" | "AI_FINDING";
  timestamp: string;
  title: string;
  description: string;
  entityIds: string[];
  evidenceIds: string[];
}
```

## 7. Audit Event

```ts
interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  details: string;
}
```

## 8. Demo Dataset Minimum

The default `Operation Falcon` case should contain approximately:

- 15–30 persons
- 10–20 phones
- 8–15 bank accounts
- 10–20 transactions
- 8–15 locations
- 5–10 vehicles
- 10–15 evidence records
- 10–20 timeline events
- 8–12 alerts
- multiple verified and unverified relationships

The exact dataset can be expanded whenever a feature needs additional demo records.
