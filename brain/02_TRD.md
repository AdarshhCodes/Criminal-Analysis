# Intel-Forge — Technical Requirements Document

## 1. Technical Objective

Build a production-quality frontend prototype that is modular enough to connect to the proposed Intel-Forge backend later.

## 2. Recommended Stack

### Application

- React
- TypeScript
- Vite

### UI

- Tailwind CSS
- shadcn/ui

### Icons

- Lucide React

### Graph

- Cytoscape.js

### Charts

- Recharts

### Animation

- Framer Motion

### State

- Zustand

### Routing

- React Router

### Tables

- TanStack Table

### Validation

- Zod

### Forms

- React Hook Form

### Date utilities

- date-fns

### Optional map

- MapLibre GL JS

## 3. Runtime Principle

The prototype must run locally without a backend.

Primary commands:

```bash
npm install
npm run dev
npm run build
npm run preview
```

## 4. Data Strategy

Use local TypeScript/JSON datasets.

Do not scatter mock data through components.

Use a centralized dataset and service layer.

## 5. Mock Intelligence Engine

Create deterministic services such as:

```ts
searchInvestigation()
findConnections()
findStrongestPath()
getEntityDetails()
getEvidence()
getAlerts()
getTimeline()
verifyRelationship()
rejectRelationship()
generateReport()
```

The same input should produce a predictable demo result.

## 6. State Requirements

Centralize investigation state where cross-screen synchronization is required.

Important state:

- current case
- selected entity
- selected evidence
- graph filters
- graph layout
- timeline filters
- active alert
- AI query state
- relationship verification state
- current investigator
- report generation state

## 7. Graph Requirements

Support:

- pan
- zoom
- fit
- node selection
- node dragging
- hover
- relationship highlighting
- filtering
- graph expansion
- collapse
- layout changes
- path highlighting

Preferred layouts:

- organic
- hierarchical
- radial
- circular

## 8. Performance

The demo dataset should remain comfortably interactive.

Avoid unnecessarily rendering thousands of DOM elements.

Prefer canvas/WebGL-capable graph rendering where appropriate.

Memoize expensive derived data.

## 9. Accessibility

Implement:

- semantic controls
- keyboard navigation
- focus states
- accessible labels
- readable contrast
- accessible dialogs
- accessible tables

## 10. Error Handling

Every major async-like interaction should have:

- loading
- success
- empty
- error

states, even when the implementation is local.

## 11. Future Integration Boundary

The frontend should later be able to connect to:

- FastAPI
- Neo4j
- Qdrant
- MongoDB
- LangGraph
- OCR pipeline
- YOLO/OpenCV
- Whisper
- secure interagency APIs

The prototype should not depend on these systems.
