# Scope: KoboToolbox ETL Pipeline

## Architecture
Node.js Express Webhook server (`backend/ingest.js`) ingesting KoboToolbox survey REST API payloads, buffering them into Redis queue (`kobo_payloads`), and a Python worker process (`backend/worker.py`) consuming Redis queue, parsing spatial strings (geopoint, geotrace, geoshape) into WKT, and performing atomic transactions in PostGIS database tables (`la_party`, `la_spatial_unit`, `la_rrr`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1_ETL | Dependencies & Config Setup | Add `express`, `redis` to `package.json` / `backend/package.json`; create `requirements.txt` / `backend/requirements.txt` with `redis`, `psycopg2-binary`. Configure scripts (`start:ingest`, `start:worker`, etc.). | none | PLANNED |
| M2_ETL | Express Webhook Ingestion Listener | `backend/ingest.js` implementing POST endpoint, basic JSON validation (checking payload presence, CNIC/name/spatial fields), pushing raw payload to Redis list `kobo_payloads`. | M1_ETL | PLANNED |
| M3_ETL | Python ETL Processing Worker & Spatial WKT Upsert | `backend/worker.py` polling Redis `kobo_payloads`, extracting fields, converting spatial string formats (geopoint, geotrace, geoshape) to PostGIS WKT, and executing atomic DB transactions in `la_party`, `la_spatial_unit`, and `la_rrr`. | M1_ETL | PLANNED |
| M4_ETL | E2E Mock Payload Test & Pipeline Verification | `backend/test_payload.js` sending mock KoboToolbox payload containing `geoshape` to ingestion endpoint, verifying Redis queuing and Python worker spatial polygon WKT conversion & PostGIS logging/upsert. | M1_ETL, M2_ETL, M3_ETL | PLANNED |

## Interface Contracts
### Express Webhook Ingestion Server (`backend/ingest.js`)
- Route: `POST /webhook` (or `POST /api/v2/ingest`)
- Accepts KoboToolbox v2 REST API payload (JSON)
- Validates structure (must contain payload object and basic fields)
- Pushes JSON string to Redis key `kobo_payloads` via `RPUSH` / `lPush`
- Responds with `200 OK` and `{ status: "success", message: "Payload queued" }`

### Redis Queue Format
- Redis List Key: `kobo_payloads`
- Content: JSON stringified KoboToolbox survey payload

### Python Worker (`backend/worker.py`)
- Connection: Redis (`host=localhost`, `port=6379`, `db=0` / configurable via ENV)
- DB Connection: PostgreSQL/PostGIS (`psycopg2`)
- Polling loop: `BLPOP kobo_payloads 0` or `LPOP` with sleep
- Extraction:
  - CNIC: payload `cnic` or `respondent_cnic` or `_cnic`
  - Name: payload `respondent_name` or `name` or `full_name`
  - Spatial string: `geopoint` / `geotrace` / `geoshape`
- Spatial Parsing Rules:
  - `geopoint`: `"lat lon alt acc"` -> WKT `POINT(lon lat)`
  - `geotrace`: `"lat1 lon1 alt1 acc1; lat2 lon2 alt2 acc2; ..."` -> WKT `LINESTRING(lon1 lat1, lon2 lat2, ...)`
  - `geoshape`: `"lat1 lon1 alt1 acc1; lat2 lon2 alt2 acc2; ..."` -> WKT `POLYGON((lon1 lat1, lon2 lat2, ..., lon1 lat1))`
- Atomic Transaction:
  1. Insert into `la_party` (`full_name`, `cnic_number`, `party_type`='Individual') RETURNING `party_id`
  2. Insert into `la_spatial_unit` (`spatial_type`='Parcel', `geom`=`ST_GeomFromText(wkt, 4326)`, `district`='Quetta') RETURNING `spatial_unit_id`
  3. Insert into `la_rrr` (`party_id`, `spatial_unit_id`, `rrr_type`='Usufruct', `approval_status`='Pending_Verification')
  4. Commit transaction atomically (or rollback on error)
- Logging: Prints success log detailing parsed WKT and database record creation.

### E2E Payload Test (`backend/test_payload.js`)
- Constructs valid sample KoboToolbox payload with mock CNIC, name, and `geoshape` spatial polygon string:
  `"30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0; 30.1798 66.9750 0 0"`
- Sends HTTP POST request to Express webhook listener
- Asserts HTTP 200 response.

## Code Layout
```
backend/
├── ingest.js
├── worker.py
├── test_payload.js
├── requirements.txt
├── package.json (or top-level package.json)
└── db/
    └── init_schema.sql
```
