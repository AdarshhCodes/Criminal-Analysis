# Intel-Forge — Product Requirements Document

## 1. Product

**Intel-Forge: AI-Powered Criminal Network Analysis System**

SIH Problem Statement: **SIH26189**

Theme: **Blockchain & Cybersecurity**

## 2. Problem

Investigative evidence is fragmented across sources such as CCTV, FIRs, call records and financial records. Investigators need to identify relationships and indirect links without manually building link charts and cross-referencing large volumes of records.

## 3. Product Vision

Turn fragmented evidence into a connected, queryable and evidence-backed investigation network.

Core flow:

`Evidence → Entities → Relationships → Graph → AI Insight → Human Verification → Court-Ready Report`

## 4. Target User

Primary:

- Investigation officers
- Senior investigators
- Law-enforcement intelligence analysts

Secondary:

- Supervisors
- Government decision-makers
- Authorized collaborating officers

## 5. Core Product Capabilities

### 5.1 Command Centre

Provide a unified overview of:

- active cases
- high-risk entities
- evidence awaiting review
- alerts
- recent investigation activity
- network statistics

### 5.2 Investigation Workspace

The primary workspace combines:

- natural-language investigation search
- interactive graph
- entity details
- timeline
- evidence context
- alerts

### 5.3 Network Graph

Entities include:

- Person
- Phone
- Bank Account
- Transaction
- Location
- Vehicle
- Organization
- FIR
- CCTV
- Audio
- Document

Relationships include examples such as:

- CALLED
- OWNS
- TRANSFERRED
- LOCATED_AT
- SEEN_WITH
- ASSOCIATED_WITH
- REFERENCED_BY

### 5.4 Natural-Language Investigation

Users can ask questions such as:

- "Show the strongest connection between Rajesh Kumar and Amit Sharma."
- "Who is connected to this phone within three hops?"
- "Find suspicious transactions involving these suspects."
- "Why is this person high risk?"

The prototype must provide deterministic, evidence-backed demo responses.

### 5.5 Entity Investigation

Selecting an entity exposes:

- identity information
- risk score
- network counts
- relationships
- verification state
- supporting evidence
- relevant alerts
- timeline events

### 5.6 Evidence Centre

Users can:

- search evidence
- filter by type
- inspect evidence
- link evidence to entities
- verify/reject AI-supported findings
- view chain-of-custody metadata
- open evidence citations

### 5.7 Timeline

Investigation events should be shown chronologically.

Filters:

- All
- Calls
- CCTV
- Financial
- FIR
- Location
- AI Findings

### 5.8 Proactive Alerts

Examples:

- suspicious transaction cluster
- new network connection
- possible identity match
- suspicious call pattern
- anomalous location
- unverified AI relationship

### 5.9 Human Verification

AI-generated relationships require human review before becoming trusted.

Actions:

- Verify
- Reject
- Request Review

Verification should create an audit event.

### 5.10 Audit Trail

Record:

- actor
- action
- timestamp
- target entity/evidence
- previous state
- new state

### 5.11 Intelligence Path

Given two entities, identify a strong multi-hop path and show:

- path
- hop count
- relationship types
- supporting evidence
- confidence
- verification state

### 5.12 Evidence-Backed AI Answers

Every important AI result should expose:

- answer
- confidence
- reasoning summary
- evidence references
- graph path
- verification status

### 5.13 Reports

Generate a demonstration investigation report containing:

- executive summary
- key persons
- network analysis
- timeline
- evidence
- verified relationships
- unverified leads
- risk assessment
- audit trail
- evidence references

## 6. Non-Goals

This prototype does not provide:

- real police database access
- real CDR access
- real financial intelligence
- real facial recognition
- real surveillance
- autonomous law-enforcement decisions
- legal certification of evidence

## 7. Success Criteria

A judge should be able to understand the product by watching this sequence:

1. Open a case.
2. See the investigation network.
3. Select a person.
4. Ask an investigation question.
5. Watch the relevant graph path highlight.
6. Inspect supporting evidence.
7. Review a suspicious AI-suggested relationship.
8. Verify it.
9. See the audit trail update.
10. Generate a report.

The complete sequence should be functional without an external backend.
