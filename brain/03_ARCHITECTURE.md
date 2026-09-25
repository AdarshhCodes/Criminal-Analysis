# Intel-Forge — System Architecture

## 1. Architecture Style

Frontend-first modular architecture.

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   UI Components          Zustand Store         Router
        │                      │
        └──────────────┬───────┘
                       ▼
              Investigation Services
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
       Graph       Evidence       Intelligence
       Service      Service          Service
          │            │             │
          └────────────┼─────────────┘
                       ▼
                 Mock Data Layer
```

## 2. Suggested Repository Structure

```text
src/
├── app/
├── components/
│   ├── layout/
│   ├── graph/
│   ├── investigation/
│   ├── evidence/
│   ├── timeline/
│   ├── alerts/
│   ├── ai/
│   ├── reports/
│   └── ui/
├── pages/
├── data/
├── hooks/
├── stores/
├── services/
├── types/
├── lib/
└── assets/
```

## 3. Major Modules

### Command Centre

Overview and case selection.

### Investigation

Main graph investigation workspace.

### Graph

Rendering, filtering, layouts, selection and path highlighting.

### Evidence

Evidence search, inspection and verification.

### AI

Natural-language query and deterministic intelligence results.

### Timeline

Chronological events synchronized with entities.

### Alerts

Proactive intelligence alerts.

### Reports

Report preview and export.

### Audit

Investigation activity history.

## 4. Data Flow

Example:

```text
User selects Person
        ↓
Investigation Store
        ↓
Entity Service
        ↓
Entity details
        ↓
Graph highlights entity
        ↓
Evidence filters
        ↓
Timeline filters
        ↓
Alerts filter
```

## 5. Future Architecture

```text
Data Sources
   ↓
Ingestion / OCR / Parsing
   ↓
Validation & Data Quality Gate
   ↓
Neo4j + Qdrant + MongoDB
   ↓
LangGraph Multi-Agent Reasoning
   ↓
FastAPI
   ↓
Intel-Forge Frontend
```

AI-proposed graph relationships should pass through human verification before becoming trusted graph facts.
