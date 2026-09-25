# Intel-Forge — Data Sources & Prototype Boundaries

## 1. Current Prototype

The current frontend uses **synthetic demonstration data only**.

No real law-enforcement, telecom, banking, CCTV or government records should be included.

## 2. Conceptual Future Sources

The SIH solution concept discusses fragmented evidence such as:

- CCTV
- audio
- FIRs
- CDR/call records
- financial records
- locations
- documents

These are conceptual integration targets for a future backend.

## 3. Future Intelligence Sources

Potential future architecture may integrate authorized systems through formal legal and technical agreements.

Examples of conceptual government/data gateways from the SIH material include:

- NCRB / CCTNS
- Ministry of Home Affairs
- Digital Police Services

These are **future integration concepts**, not live connections in the prototype.

## 4. Synthetic Data Policy

Every demo identity must be fictional.

Use obvious synthetic values where practical, for example:

- `IF-P-001`
- `IF-PHONE-004`
- `IF-ACC-008`
- `IF-FIR-2026-0192`

Avoid real personal phone numbers, bank details, addresses or identifying information.

## 5. Missing Demo Data Rule

If a UI workflow requires a record not present in the dataset:

1. Create a fictional record.
2. Link it consistently to existing entities.
3. Add supporting evidence where the workflow expects evidence.
4. Keep IDs deterministic.
5. Document major additions if they change the demo scenario.

Never disable a feature simply because the original requirements did not provide a sample record.
