# Intel-Forge — UI/UX Specification

## 1. Design Direction

Visual reference family:

- investigation command centres
- graph intelligence tools
- enterprise security operations interfaces

Conceptual references:

- Palantir Gotham
- Neo4j Bloom
- Maltego
- IBM i2 Analyst's Notebook
- Linkurious
- Kumu

Do not clone any reference product.

## 2. Visual Character

Use:

- dark charcoal background
- restrained cyan/blue accent
- muted green for verified
- amber for warnings
- red for high severity
- off-white primary text
- cool gray secondary text
- thin borders
- compact spacing
- modest corner radius
- subtle shadows

Avoid:

- excessive neon
- excessive glow
- glassmorphism everywhere
- giant cards
- marketing-page layouts
- decorative AI graphics

## 3. Application Shell

```text
┌─────────────────────────────────────────────────────────────┐
│ Intel-Forge | Case | System Status | Investigation Search │
├────────────┬────────────────────────────────────┬───────────┤
│ Navigation │ Main Investigation Workspace       │ Context   │
│            │                                    │ Panel     │
│ Cases      │ Graph / Evidence / Timeline / AI   │           │
│ Graph      │                                    │ Entity    │
│ Evidence   │                                    │ Evidence  │
│ Timeline   │                                    │ Alerts    │
│ Alerts     │                                    │           │
│ Reports    │                                    │           │
│ Audit      │                                    │           │
└────────────┴────────────────────────────────────┴───────────┘
```

## 4. Primary Navigation

- Command Centre
- Investigations
- Network Graph
- Evidence
- Timeline
- Alerts
- AI Copilot
- Reports
- Audit Trail
- Settings

## 5. Command Centre

Show:

- active investigations
- high-risk entities
- unverified leads
- evidence count
- active alerts
- recent discoveries
- activity feed

Do not let KPI cards dominate the screen.

## 6. Investigation Graph

Graph should be the central workspace.

Controls:

- zoom
- fit
- reset
- focus
- expand
- collapse
- filter
- layout
- fullscreen

Layouts:

- Organic
- Hierarchical
- Radial
- Circular

## 7. Entity Context Panel

When selected:

- entity type
- name
- risk
- status
- identifiers
- network counts
- relationships
- evidence
- actions

Actions:

- Expand Network
- View Timeline
- View Evidence
- Mark for Review
- Generate Report

## 8. AI Investigation Bar

Persistent near the main workspace.

Placeholder:

`Ask Intel-Forge about this investigation...`

The AI result must include:

- answer
- confidence
- evidence
- path
- verification state

## 9. Timeline

Timeline should synchronize with selected entities.

Filtering:

- All
- Calls
- CCTV
- Financial
- FIR
- Location
- AI Findings

## 10. Evidence

Evidence table columns:

- Evidence ID
- Type
- Source
- Timestamp
- Related Entity
- Confidence
- Verification
- Chain of Custody

## 11. Alerts

Severity hierarchy:

- Critical
- High
- Medium
- Low

Alert interaction should lead into the investigation context.

## 12. Human Verification

AI-suggested relationships must show:

`AI SUGGESTED`

and expose:

- confidence
- reason
- evidence
- Verify
- Reject
- Request Review

After verification:

`HUMAN VERIFIED`

with investigator and timestamp.

## 13. Motion

Use animation for meaning:

- graph expansion
- path highlighting
- context panel entry
- alert transitions
- verification changes
- timeline filtering
- AI query processing

Avoid decorative motion.

## 14. Responsive Behaviour

Desktop is primary.

Tablet should preserve the investigation workflow.

Mobile should use focused graph screens and bottom/context sheets rather than compressing the desktop layout.

## 15. Accessibility

Support:

- keyboard navigation
- focus states
- accessible labels
- readable contrast
- tooltips
- semantic structure

## 16. Demo Environment Indicator

Use subtle text:

`DEMO ENVIRONMENT · SYNTHETIC INVESTIGATION DATA`

Never imply live police data.

## 17. Universal Command Palette (Ctrl/Cmd + K)

Support universal keyboard navigation across the entire intelligence workspace:

- Trigger: `Ctrl + K` (Windows/Linux) or `Cmd + K` (macOS) or search input badge
- Dismiss: `Escape`
- Operations:
  - Open Case (switch between active syndicate files)
  - Search Entity (live fuzzy query across all persons, devices, accounts, vehicles)
  - Find Relationship (trigger automated AI multi-hop path finder)
  - Open Evidence / Alerts / Timeline / Copilot / Command Centre
  - Switch Graph Layout (`cose`, `breadthfirst`, `concentric`, `circle`)
- Keyboard controls: Arrow Up/Down navigation, Enter execution, Esc dismiss.

## 18. Secondary Investigation Modes (GRAPH / MAP / TABLE)

- **Graph View**: Primary and default Cytoscape link analysis canvas.
- **Map View**: Tactical GIS geospatial surveillance view plotting operational landmarks (Okhla warehouse, Sector 62 safehouse, Karol Bagh bullion desk, cell towers, toll plazas, Dubai Deira office) with radar sweep and courier transit arcs.
- **Table View**: Comprehensive tabular master grid for structured sorting and entity/edge auditing.

## 19. Court-Ready Investigation Reports (Section 65B)

Demonstration report generator compiling deterministic facts:

- Progress states: `Collecting evidence...` → `Analyzing relationships...` → `Building timeline...` → `Preparing citations...` → `Generating report...`
- 10 Core Sections: Executive Summary, Key Persons, Network Analysis, Timeline, Evidence, Verified Relationships, Unverified Leads, Risk Assessment, Audit Trail, Evidence References.
- Statutory Certificate under Section 65B of the Indian Evidence Act, 1872.
- Export formats: `@media print` PDF formatting, JSON payload copy, plaintext brief download.

