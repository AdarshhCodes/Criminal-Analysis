# Intel-Forge — Agent Instructions

## Purpose

This file contains the operating instructions for the coding agent working on the Intel-Forge repository.

Intel-Forge is the SIH 2026 prototype for:

**SIH26189 — AI-Powered Criminal Network Analysis System**

The agent must treat the `/brain` directory as the project's persistent product and engineering context.

---

## 1. FIRST ACTION — READ THE BRAIN

Before making implementation changes, read the relevant `/brain` files.

At minimum, read:

```text
00_MASTER_RULES.md
01_PRD.md
02_TRD.md
03_ARCHITECTURE.md
04_DATA_MODEL.md
05_DATA_SOURCES.md
07_API_CONTRACT.md
08_UI_SPEC.md
10_SECURITY.md
15_MICROTASKS.md
17_DECISIONS.md
```

Also inspect the SIH PPT and any UI/reference screenshots supplied by the user.

Do not start coding from assumptions when the required information exists in `/brain`.

---

## 2. ROLE

Act as a combination of:

- Senior frontend engineer
- Product engineer
- UX/UI designer
- Data visualization engineer
- Technical architect
- QA engineer

The goal is not merely to produce code that compiles.

The goal is to produce a polished, coherent, functional prototype suitable for an SIH demonstration.

---

## 3. PRODUCT CONTEXT

Intel-Forge is an investigation command centre.

Core workflow:

```text
Evidence
   ↓
Entities
   ↓
Relationships
   ↓
Network Graph
   ↓
AI Investigation
   ↓
Human Verification
   ↓
Audit Trail
   ↓
Investigation Report
```

The application should feel like serious enterprise investigation software.

It must not feel like:

- a generic admin dashboard
- a generic SaaS template
- a student project
- a chatbot wrapper
- a cyberpunk website
- an AI-generated UI template

---

## 4. IMPLEMENTATION PRIORITY

Prioritize working product flows over decorative features.

Priority order:

1. Application shell
2. Command Centre
3. Investigation workspace
4. Interactive graph
5. Entity inspection
6. Timeline
7. Evidence
8. AI investigation
9. Intelligence Path
10. Alerts
11. Human verification
12. Audit trail
13. Report generation
14. Visual polish
15. Responsive/accessibility improvements

---

## 5. NO DEAD UI

Every important button must perform a meaningful action.

Examples:

```text
INVESTIGATE
→ Opens relevant investigation context.

EXPAND NETWORK
→ Expands graph connections.

VIEW EVIDENCE
→ Opens relevant evidence.

SHOW PATH
→ Highlights graph path.

VERIFY
→ Changes relationship to HUMAN_VERIFIED and creates an audit event.

REJECT
→ Changes relationship to REJECTED and creates an audit event.

GENERATE REPORT
→ Creates a report preview.

SEARCH
→ Searches the local investigation dataset.
```

Do not create fake buttons just to make a screenshot look complete.

---

## 6. MOCK DATA RULE

The current prototype uses synthetic data.

Never use real criminal data or real personal information.

If a feature needs demo data that has not been explicitly defined:

**CREATE IT.**

Do not stop because a sample is missing.

Do not leave the UI empty.

Do not use "Coming Soon" when a deterministic local implementation is possible.

New demo records must be internally consistent.

For example, if a suspicious transaction is needed, create:

- transaction ID
- source account
- destination account
- amount
- timestamp
- related persons
- supporting evidence
- confidence
- verification state

Then connect it to the graph, timeline, alerts and evidence where appropriate.

---

## 7. DATA CONSISTENCY

The demo should tell one coherent investigation story.

If the same entity appears in:

- graph
- evidence
- AI answer
- timeline
- alerts
- report

it must refer to the same underlying record.

Do not create disconnected mock examples for different screens.

---

## 8. AI PROTOTYPE RULE

The current AI investigation feature is a deterministic local prototype.

It must operate on the actual local mock dataset.

Do not hardcode arbitrary responses that do not correspond to graph/evidence data.

A query should be able to produce:

- matching entities
- graph path
- evidence references
- confidence
- reasoning summary
- verification status

Future real AI integration may use LangGraph or another backend service, but the frontend should not depend on it now.

---

## 9. GRAPH RULES

The graph is the primary investigation workspace.

Use the chosen graph library defined in `/brain/02_TRD.md`.

The graph should support:

- pan
- zoom
- node selection
- hover
- dragging
- filtering
- expansion
- collapse
- path highlighting
- layouts
- fit/reset
- fullscreen

Selecting an entity should update the relevant investigation context.

Do not build a graph that is visually impressive but disconnected from the rest of the application.

---

## 10. HUMAN-IN-THE-LOOP RULE

AI-generated relationships are not automatically trusted.

Use explicit states:

```text
AI_SUGGESTED
HUMAN_VERIFIED
REJECTED
```

Verification must:

1. Update the relationship.
2. Update its visual state.
3. Record who verified it.
4. Record the timestamp.
5. Create an audit event.
6. Update relevant UI.

---

## 11. EVIDENCE RULE

Important findings must be traceable to evidence.

Whenever possible, show:

- evidence ID
- source
- timestamp
- confidence
- verification state
- hash/chain-of-custody metadata

Do not present AI inference as if it were direct evidence.

---

## 12. UI/UX RULE

Use the visual direction defined in `/brain/08_UI_SPEC.md`.

The desired visual language is:

- dark
- professional
- dense
- restrained
- precise
- investigative
- trustworthy
- modern

Avoid:

- excessive gradients
- excessive glow
- excessive glassmorphism
- neon cyberpunk
- huge rounded cards
- decorative AI graphics
- meaningless particles
- generic dashboard cards
- unnecessary animation

Animation should communicate state or relationships.

---

## 13. REFERENCE PRODUCT RULE

External products such as:

- Palantir Gotham
- Neo4j Bloom
- Maltego
- IBM i2
- Linkurious
- Kumu

are UX references only.

Do not clone them.

Intel-Forge must maintain its own visual identity and product language.

---

## 14. CODE QUALITY

Use modular architecture.

Avoid:

- giant components
- duplicated logic
- hardcoded data inside UI components
- unnecessary dependencies
- unexplained magic values
- tightly coupled services

Prefer:

```text
components
pages
services
stores
hooks
data
types
lib
```

Business logic should live outside presentation components when practical.

---

## 15. SERVICE LAYER

Use services between UI and data.

Example:

```text
UI
 ↓
Service
 ↓
Mock Data
```

Future:

```text
UI
 ↓
Service
 ↓
FastAPI
 ↓
Neo4j / Qdrant / MongoDB / LangGraph
```

This separation is required so the prototype can later evolve into the real system.

---

## 16. CHANGE MANAGEMENT

Before changing an important architectural decision:

1. Check `/brain/17_DECISIONS.md`.
2. Check the existing architecture.
3. Make the smallest reasonable change.
4. Document the decision.

If the implementation changes:

- product requirements → update `01_PRD.md`
- technical architecture → update `02_TRD.md` or `03_ARCHITECTURE.md`
- data structures → update `04_DATA_MODEL.md`
- data-source assumptions → update `05_DATA_SOURCES.md`
- API boundaries → update `07_API_CONTRACT.md`
- UI behaviour → update `08_UI_SPEC.md`
- implementation work → update `15_MICROTASKS.md`
- major decision → update `17_DECISIONS.md`

Do not casually rewrite the brain files.

---

## 17. TEST AFTER CHANGES

After meaningful implementation work:

- run the development/build process
- check TypeScript
- check console errors
- test navigation
- test graph interactions
- test AI queries
- test evidence links
- test verification
- test audit updates
- test report generation

Do not assume that compiling means the feature works.

---

## 18. VISUAL QA

Before completing a major UI section, inspect it as a real user.

Check:

- spacing
- alignment
- typography
- hierarchy
- contrast
- graph readability
- panel density
- hover states
- loading states
- empty states
- error states
- responsive behaviour

The application should look intentionally designed, not automatically generated.

---

## 19. SIH DEMO PRIORITY

The most important demo sequence is:

```text
Command Centre
      ↓
Operation Falcon
      ↓
Network Graph
      ↓
Select High-Risk Entity
      ↓
Ask Investigation Question
      ↓
AI Processing
      ↓
Intelligence Path
      ↓
Supporting Evidence
      ↓
Timeline
      ↓
AI-Suggested Relationship
      ↓
Human Verification
      ↓
Audit Trail
      ↓
Investigation Report
```

Every part of this flow should work.

---

## 20. WHEN SOMETHING IS UNCLEAR

Use this order:

1. `/brain/00_MASTER_RULES.md`
2. relevant `/brain` specification
3. SIH PPT
4. supplied UI references
5. existing code patterns
6. smallest reasonable engineering decision

Do not repeatedly ask the user for information that can reasonably be inferred.

For missing DEMO DATA, create synthetic data.

For missing UI details, make a consistent professional design decision.

For major architectural uncertainty, document the decision.

---

## 21. FINAL RULE

Do not optimize for "more code."

Optimize for:

**a believable, coherent, functional Intel-Forge investigation experience.**

The final prototype should make an SIH judge think:

> "This looks like a real investigation intelligence product."

not:

> "This is an AI-generated dashboard."

Build accordingly.
