# Intel-Forge — Future API Contract

This document defines the future backend boundary. The current prototype may implement these operations locally.

## Cases

```http
GET /api/cases
GET /api/cases/{caseId}
```

## Entities

```http
GET /api/entities/{entityId}
GET /api/entities/{entityId}/connections
```

## Graph

```http
GET /api/cases/{caseId}/graph
GET /api/graph/path?source={sourceId}&target={targetId}
```

## Evidence

```http
GET /api/evidence
GET /api/evidence/{evidenceId}
GET /api/entities/{entityId}/evidence
```

## Timeline

```http
GET /api/cases/{caseId}/timeline
GET /api/entities/{entityId}/timeline
```

## Alerts

```http
GET /api/alerts
GET /api/alerts/{alertId}
PATCH /api/alerts/{alertId}
```

## Investigation Query

```http
POST /api/investigation/query
```

Example request:

```json
{
  "caseId": "IF-CASE-001",
  "query": "Show the strongest connection between IF-P-001 and IF-P-007"
}
```

Example response:

```json
{
  "answer": "A 3-hop connection was identified.",
  "confidence": 94,
  "path": [
    "IF-P-001",
    "IF-PHONE-004",
    "IF-P-007"
  ],
  "evidenceIds": [
    "IF-CDR-001",
    "IF-CCTV-004"
  ]
}
```

## Relationship Verification

```http
POST /api/relationships/{relationshipId}/verify
POST /api/relationships/{relationshipId}/reject
```

## Reports

```http
POST /api/reports/generate
GET /api/reports/{reportId}
```

## Security Expectations for Future Backend

- authenticated requests
- role-based authorization
- case-level access controls
- audit logging
- encryption
- evidence integrity controls
- rate limiting
- input validation
