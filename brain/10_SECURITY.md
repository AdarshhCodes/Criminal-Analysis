# Intel-Forge — Security & Privacy Specification

## 1. Prototype Security Boundary

This is a frontend demonstration.

No real sensitive data should be used.

No real criminal records should be stored.

No real PII should be included in demo data.

## 2. Prototype Roles

Example roles:

- Investigator
- Senior Investigator
- Supervisor
- Analyst

Role behavior may be simulated locally.

## 3. Future RBAC

Future implementation should support:

- user authentication
- role-based permissions
- case-level authorization
- evidence-level permissions
- interagency access controls
- audit trails

## 4. Human Review

AI-generated graph relationships must not automatically become trusted evidence.

High-risk or uncertain AI findings should enter a review state.

## 5. Evidence Integrity

Future production architecture should support:

- cryptographic hashes
- immutable audit events
- evidence versioning
- chain-of-custody tracking
- deterministic source references

## 6. AI Safety

The AI layer should:

- expose confidence
- identify supporting evidence
- distinguish inference from verified fact
- avoid presenting uncertain claims as facts
- preserve human control

## 7. Privacy

Future production deployment should consider:

- data minimization
- encryption in transit
- encryption at rest
- strict retention rules
- access logging
- secure key management
- legal authorization
- interagency agreements

## 8. Prototype Disclaimer

The application must clearly remain a demonstration using synthetic data and must not be represented as a live law-enforcement system.
