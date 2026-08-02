# BRIEFING — 2026-07-31T00:44:15Z

## Mission
Design and specify implementation details for KoboToolbox ETL Pipeline Requirements R2 & R3: Python ETL worker (`backend/worker.py`), dependencies, Redis queue consumer loop (`kobo_payloads`), field extraction, PostGIS spatial parsing (geopoint, geotrace, geoshape -> WKT), atomic PostgreSQL/PostGIS transactions (`la_party`, `la_spatial_unit`, `la_rrr`), and logging.

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Explorer 2 (KoboToolbox ETL Pipeline architecture & worker design)
- Working directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_etl_2
- Original parent: fa2dc724-0da1-432e-99a4-b8d5c3d798e0
- Milestone: ETL Worker & Database Integration Specification (R2 & R3)

## 🔒 Key Constraints
- Read-only investigation — do NOT modify project source code directly (only metadata/reports in explorer_etl_2 folder)
- Code mode only: no external HTTP requests
- Specify exact Python code, functions, regexes, SQL upserts/inserts, error handling, and test/verification instructions in analysis and handoff reports

## Current Parent
- Conversation ID: fa2dc724-0da1-432e-99a4-b8d5c3d798e0
- Updated: 2026-07-31T00:44:15Z

## Investigation State
- **Explored paths**: `SCOPE_ETL.md`, `backend/db/init_schema.sql`, `backend/` directory
- **Key findings**: Complete specifications for `backend/requirements.txt`, field extraction logic, Kobo space-separated lat-lon to PostGIS long-lat WKT spatial parsing (with polygon linear ring closure), atomic 3-table PostgreSQL/PostGIS transaction (`la_party`, `la_spatial_unit`, `la_rrr`), and Redis consumer loop with DLQ fallback.
- **Unexplored areas**: None (R2 & R3 technical design complete)

## Key Decisions Made
- `la_party` upsert uses `ON CONFLICT (cnic_number) DO UPDATE` to ensure payload re-ingestion idempotency.
- Linear ring closure automatically enforced for `geoshape` strings before formatting WKT (`coords[0] == coords[-1]`).
- Redis `blpop` timeout of 2 seconds with graceful signal handling (`SIGINT`, `SIGTERM`).

## Artifact Index
- `ORIGINAL_REQUEST.md` — Original request instructions
- `BRIEFING.md` — Working memory and status
- `analysis.md` — Comprehensive analysis and specification report
- `handoff.md` — Structured 5-component handoff report
