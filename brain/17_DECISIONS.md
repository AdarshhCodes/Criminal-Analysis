# Intel-Forge — Architecture & Product Decisions

## Decision 001 — Frontend First

**Decision:** Build a functional frontend prototype before implementing the full backend.

**Reason:** The SIH demonstration needs a stable, visually convincing and interactive product experience.

## Decision 002 — Synthetic Data

**Decision:** All current demo data is synthetic.

**Reason:** The prototype must not depend on sensitive or unavailable real-world law-enforcement data.

## Decision 003 — Graph as Primary Workspace

**Decision:** The graph is the central investigation surface.

**Reason:** Intel-Forge's main differentiator is converting fragmented evidence into a connected network.

## Decision 004 — Cytoscape.js Preferred

**Decision:** Prefer Cytoscape.js for the primary network graph unless implementation testing shows a strong reason to change.

**Reason:** The product needs dense network visualization, graph layouts, selection, filtering and relationship/path highlighting.

## Decision 005 — Deterministic Mock Intelligence

**Decision:** AI investigation queries are implemented through deterministic local logic for the prototype.

**Reason:** The demo must work without API keys or external model dependencies while preserving the future AI integration boundary.

## Decision 006 — Evidence Before Trust

**Decision:** AI suggestions remain unverified until a human investigator approves them.

**Reason:** This directly supports the Human-in-the-Loop and evidence-integrity requirements.

## Decision 007 — Synchronized Views

**Decision:** Graph, entity panel, evidence and timeline share investigation state.

**Reason:** The product should feel like one investigation environment rather than several disconnected pages.

## Decision 008 — Restrained Enterprise Visual Language

**Decision:** Use dark, dense, professional intelligence UI rather than cyberpunk aesthetics.

**Reason:** The target audience is professional investigators and SIH judges should perceive the prototype as credible operational software.

## Decision 009 — Reference, Don't Clone

**Decision:** Palantir Gotham, Neo4j Bloom, Maltego, IBM i2, Linkurious and Kumu are UX references only.

**Reason:** Intel-Forge must have its own identity and workflow.

## Decision 010 — Missing Demo Data

**Decision:** If a future feature needs data that is not explicitly present, create consistent fictional demo data.

**Reason:** Missing example data should never block a working prototype.

## Decision 011 — No Fake Live Integrations

**Decision:** Do not claim that the prototype is connected to government, telecom, banking or police systems.

**Reason:** The prototype must clearly distinguish demonstration functionality from production integrations.

## Decision 012 — Documentation as Input Material

**Decision:** These markdown files form the engineering/product context that should be read before the main implementation prompt is executed.

**Reason:** Separating requirements, architecture, data, UI and implementation tasks reduces ambiguity and prevents the coding agent from improvising critical product decisions.

## Decision 013 — Client-Side Cryptographic Blockchain Ledger

**Decision:** Implement a deterministic, client-side SHA-256 cryptographic hash-chained audit ledger (`previousHash`, `currentHash`, `merkleRoot`, `investigatorSignature`, `timestamp`).

**Reason:** Fulfills the SIH theme (Blockchain & Cybersecurity) and PPT requirements without requiring an external blockchain network node during demo runtime.

## Decision 014 — Node.js LTS Environment Provisioning

**Decision:** Install and configure Node.js LTS in the local environment to run the Vite + React + TypeScript stack.

**Reason:** Local terminal environment requires Node runtime for the build and execution lifecycle.

## Decision 015 — Unified Operation Falcon Primary Case

**Decision:** Center the primary demonstration scenario on Operation Falcon (Case #IF-2026-0882) with key suspects Rajesh Kumar and Amit Sharma, linked to CDRs, burner phones, Hawala accounts, and warehouse CCTV.

**Reason:** Creates a rich, coherent single-case narrative connecting all screens seamlessly.

## Decision 016 — Integrated AI Investigation Bar and Multi-Agent Copilot

**Decision:** Provide both a global Investigation Command Bar for direct graph queries and a slide-out Multi-Agent Copilot revealing specialist agent decomposition (Telecom, Financial, Visual, Graph).

**Reason:** Satisfies both fast query-to-graph workflows and explainable multi-agent reasoning described in the PPT.

## Decision 017 — Cytoscape Layout Engine Strategy

**Decision:** Configure Cytoscape.js with four deterministic layouts: Organic (`cose`), Hierarchical (`breadthfirst`), Radial (`concentric`), and Circular (`circle`).

**Reason:** Enables investigators to examine criminal networks from different structural perspectives.

## Decision 018 — Multi-Hop Intelligence Path HUD Architecture

**Decision:** Build a dedicated `IntelligencePathHUD` floating tool on the network graph that renders the step-by-step entity chain (e.g. Rajesh Kumar → Burner Phone → Amit Sharma), hop count, evidence count, and confidence score, with 1-click presets and auto-fit animated canvas focus.

**Reason:** Delivers the signature SIH demo moment ("Show me the strongest connection between Rajesh Kumar and Amit Sharma") directly on the central graph canvas.

## Decision 019 — Dual-Surface Evidence-Backed AI Delivery

**Decision:** Deliver AI investigation results through both the persistent top search bar (auto-navigating to graph and animating paths) and the dedicated Multi-Agent Swarm Console/Dossier with agent execution breakdown, confidence, evidence references, and follow-up prompts.

**Reason:** Complies with UI Spec requiring structured non-chatbot answers backed by forensic citations and graph highlights.

## Decision 020 — Real-Time Blockchain SHA-256 Audit Ledger

**Decision:** Implement a Web Crypto API (`crypto.subtle`) driven cryptographic block ledger that seals previous hash, block hash, Merkle root, and officer signature for every human verification, rejection, AI query, and evidence flag.

**Reason:** Ensures Section 65B Indian Evidence Act and SIH Blockchain & Cybersecurity theme requirements are met with authentic cryptographic proofs.

## Decision 021 — Reactive Graph Edge Mutation on Human Verification

**Decision:** Use a `graphVersion` counter in the central Zustand store so that verifying or rejecting an AI-suggested relationship immediately reloads edges in `CytoscapeCanvas`, visually converting amber dashed links into solid emerald lines in real-time.

**Reason:** Provides instantaneous visual feedback for Human-in-the-Loop workflows on the active graph canvas.

## Decision 022 — Multi-Stage Progressive Report Generation Workflow

**Decision:** Structure report generation in `ReportsPage.tsx` with realistic asynchronous forensic pipeline steps (`Collecting evidence...` → `Analyzing relationships...` → `Building timeline...` → `Preparing citations...` → `Generating report...`) and render all 10 court-ready sections with Section 65B Indian Evidence Act certification, JSON export, and print CSS.

**Reason:** Transforms simple static report generation into an authentic evidence-compiling prosecution brief engine suitable for legal scrutiny.

## Decision 023 — Secondary GRAPH / MAP / TABLE Investigation Modes

**Decision:** Implement a non-destructive view mode switcher (`GRAPH` default, `MAP`, `TABLE`) on the Network Investigation page. The `MAP` view renders tactical GIS coordinates (Okhla Warehouse, Sector 62 Safehouse, Karol Bagh Bullion Desk, Vasant Vihar cell, DND flyway, Deira Dubai) and transit vectors without altering Cytoscape graph state.

**Reason:** Fulfills requirement for geospatial and tabular investigation perspectives while strictly preserving the graph as the primary analytical tool.

## Decision 024 — Enterprise Command Palette (Ctrl/Cmd + K)

**Decision:** Implement a global command palette with fuzzy search across case entities, layout switchers (`cose`, `breadthfirst`, `concentric`, `circle`), quick actions, and keyboard navigation (`↑`/`↓`/`↵`/`ESC`).

**Reason:** Enables rapid keyboard-driven investigation workflows expected in professional security operations software (Palantir Gotham, IBM i2).

## Decision 025 — Strict Dark-Intelligence Command Centre Visual Guardrails

**Decision:** Eliminate all decorative purple gradients, cyberpunk neon, or high-glow artifacts across existing screens, standardizing on dark charcoal `#080c14`, cyan `#06b6d4`, emerald `#10b981`, amber `#f59e0b`, rose `#f43f5e`, and IBM Plex typography.

**Reason:** Enforces SIH theme integrity and law enforcement software ergonomics: information density over decoration.


