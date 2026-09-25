# Intel-Forge — Master Engineering & Product Rules

## 1. Purpose

Intel-Forge is the SIH 2026 prototype for **SIH26189 — AI-Powered Criminal Network Analysis System**.

This repository is a frontend-first, demonstration-ready investigation intelligence platform. The attached SIH PPT is the primary product source of truth.

## 2. Source of Truth

Before implementing anything, read:

1. `01_PRD.md`
2. `02_TRD.md`
3. `03_ARCHITECTURE.md`
4. `04_DATA_MODEL.md`
5. `05_DATA_SOURCES.md`
6. `07_API_CONTRACT.md`
7. `08_UI_SPEC.md`
8. `10_SECURITY.md`
9. `15_MICROTASKS.md`
10. `17_DECISIONS.md`

The SIH PPT and supplied UI/reference screenshots are authoritative for product intent and visual direction.

Do not silently replace product requirements with generic dashboard conventions.

## 3. Product Identity

Intel-Forge is an **investigation command centre**, not:

- a generic admin dashboard
- a generic SaaS analytics panel
- a crypto dashboard
- a cyberpunk template
- a chatbot wrapper
- a static graph demo

The graph, evidence, timeline, AI investigation, alerts and human verification must operate as one connected investigation workflow.

## 4. Prototype Boundary

This version is a **functional frontend prototype**.

Use synthetic/demo data only.

Never imply that demo data comes from real police, telecom, banking or government systems.

Show a subtle:

`DEMO ENVIRONMENT · SYNTHETIC INVESTIGATION DATA`

indicator where appropriate.

## 5. Mock Data Rule

Use clearly defined, centralized mock/demo data.

If a future feature or demo scenario requires data that has not been explicitly defined in the existing mock dataset, **create an appropriate fictional demo example yourself**.

Do not leave a feature broken merely because the original example did not specify every required record.

All generated demo identities, phone numbers, account numbers, FIR IDs, vehicles, locations and transactions must be fictional.

Do not use real persons as criminal examples.

## 6. Working Feature Rule

Every visible primary action must work in the prototype.

Do not create dead buttons or widespread "Coming Soon" placeholders.

A frontend-only feature may use deterministic local logic, but the interaction must produce a believable result.

## 7. Evidence Integrity

AI suggestions are not automatically trusted facts.

Relationships may have:

- `AI_SUGGESTED`
- `HUMAN_VERIFIED`
- `REJECTED`

Every important relationship/claim should be traceable to evidence IDs in the demo model.

## 8. Human-in-the-Loop

The system must visibly preserve investigator control.

AI can:

- suggest
- rank
- summarize
- identify candidate paths
- flag anomalies

The investigator must be able to:

- review
- verify
- reject
- inspect supporting evidence

## 9. Visual Quality

The product must look like a serious enterprise investigation product designed by a senior product team.

Avoid:

- excessive gradients
- excessive glassmorphism
- neon cyberpunk styling
- giant rounded cards
- decorative AI imagery
- random glow effects
- excessive animation
- generic AI-generated landing-page aesthetics

Use restrained dark intelligence styling, strong information hierarchy and purposeful motion.

## 10. Graph Is the Workspace

The network graph is not merely a chart.

Selecting a graph entity should update relevant:

- entity details
- evidence
- timeline
- alerts
- relationship context

Searching for a relationship should visually highlight the relevant path.

## 11. No Premature Backend

Do not introduce real Neo4j, Qdrant, LangGraph, OCR, YOLO, Whisper or police APIs merely to make the frontend demo work.

Keep integration boundaries clean so these systems can be connected later.

## 12. Quality Gate

Before declaring the prototype complete:

- run the build
- fix TypeScript errors
- fix console errors
- test major flows
- test graph interactions
- test AI query interactions
- test verification state changes
- test navigation
- test responsive behaviour
- check empty/loading/error states
- perform a visual polish pass
