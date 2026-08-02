# Original User Request

## Follow-up — 2026-07-31T05:38:06Z

<USER_REQUEST>
Build a robust Node.js/Python ETL pipeline that ingests KoboToolbox v2 REST API survey payloads, buffers them in Redis, and transforms spatial geometries into a PostGIS database for the IFRAP Component 3 Digital Oversight Platform.

Working directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio
Integrity mode: development

## Requirements

### R1. Express Webhook Listener
Create a Node.js Express endpoint (e.g., `backend/ingest.js`) that receives raw JSON payloads from KoboToolbox mobile surveys, validates the basic structural integrity of the payload, and pushes the raw payload onto a Redis queue.

### R2. Python ETL Processing Worker
Create a Python consumer script (e.g., `backend/worker.py`) that polls the Redis queue. The worker must extract CNIC, respondent name, and raw spatial strings (geopoint, geotrace, geoshape) from the payload.

### R3. Geometry Parsing and PostGIS Upserts
The Python worker must include a parsing routine to convert KoboToolbox spatial strings into valid PostGIS Well-Known Text (WKT). It must then execute atomic database transactions to upsert the data into the existing `la_party`, `la_spatial_unit`, and `la_rrr` tables.

## Acceptance Criteria

### Programmatic Verification
- [ ] `npm run start` (or equivalent) successfully boots the Express ingestion server.
- [ ] A test script (`backend/test_payload.js`) successfully submits a mock KoboToolbox payload containing a "geoshape" string to the ingestion endpoint.
- [ ] The Python worker successfully connects to Redis, consumes the payload, and prints a success log indicating the spatial polygon was formatted into WKT correctly.
- [ ] The codebase contains no syntax errors and all dependencies (express, redis, psycopg2) are documented in package.json/requirements.txt.
</USER_REQUEST>
