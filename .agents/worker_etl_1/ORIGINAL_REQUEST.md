## 2026-07-31T00:47:08Z
You are Worker 1 for the KoboToolbox ETL Pipeline project.
Working directory for your metadata: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_etl_1
Project root: C:\Users\Administrator\teamwork_projects\anthropology_portfolio

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
Implement the complete KoboToolbox ETL Pipeline according to the Explorer analysis reports and user requirements (M1_ETL, M2_ETL, M3_ETL, M4_ETL):

1. **M1_ETL: Dependencies & Configuration**:
   - Update `package.json` at project root: add `"express": "^4.19.2"`, `"redis": "^4.6.13"` under dependencies, and add scripts `"start:ingest": "node backend/ingest.js"`, `"start:worker": "python backend/worker.py"`, `"test:etl": "node backend/test_payload.js"`.
   - Create `backend/requirements.txt` containing:
     `redis>=4.5.0`
     `psycopg2-binary>=2.9.6`
     `python-dotenv>=1.0.0`

2. **M2_ETL: Express Webhook Ingestion Listener (`backend/ingest.js`)**:
   - Create `backend/ingest.js` using Express.
   - Use port `process.env.PORT || 4000` (or 3001/4000).
   - Initialize Redis client (`redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })`).
   - Implement `GET /health` endpoint returning `{ status: "ok", redis: "connected" }`.
   - Implement `POST /webhook` and `POST /api/v2/ingest` endpoints:
     - Perform structural validation on incoming JSON payload: reject empty body or payloads lacking respondent attributes (`cnic`, `respondent_cnic`, `_cnic`, `respondent_name`, `name`, `full_name`) OR spatial attributes (`geopoint`, `geotrace`, `geoshape`) with HTTP 400.
     - Serialize raw JSON payload and push to Redis list `kobo_payloads` via `rPush` / `RPUSH`.
     - Respond with HTTP 200 `{ status: "success", message: "Payload queued", queue: "kobo_payloads" }`.

3. **M3_ETL: Python ETL Processing Worker (`backend/worker.py`)**:
   - Create `backend/worker.py` in Python.
   - Establish Redis connection (`redis.Redis(host=process.env.REDIS_HOST or 'localhost', port=6379, db=0)`).
   - Establish PostgreSQL/PostGIS connection (`psycopg2.connect(...)` using env vars or default parameters `dbname=anthropology_db` / `postgres`, `user=postgres`, `host=localhost`, `port=5432`). Ensure robust exception handling if DB or Redis is unavailable during dry-run / fallback testing.
   - Implement spatial conversion functions:
     - `parse_geopoint(str)`: "lat lon alt acc" -> WKT `POINT(lon lat)`
     - `parse_geotrace(str)`: "lat1 lon1 ...; lat2 lon2 ..." -> WKT `LINESTRING(lon1 lat1, lon2 lat2, ...)`
     - `parse_geoshape(str)`: "lat1 lon1 ...; lat2 lon2 ..." -> WKT `POLYGON((lon1 lat1, lon2 lat2, ..., lon1 lat1))` (closing polygon linear ring if first and last vertex differ).
   - Implement payload extractor: extract CNIC, respondent name, spatial field (`geopoint`, `geotrace`, or `geoshape`), district, tehsil, union_council.
   - Implement atomic PostGIS database transaction:
     - Insert into `la_party` (`full_name`, `cnic_number`, `party_type`='Individual') RETURNING `party_id` (or ON CONFLICT DO UPDATE).
     - Insert into `la_spatial_unit` (`spatial_type`='Parcel', `geom`=`ST_GeomFromText(%s, 4326)`, `district`, `tehsil`, `union_council`) RETURNING `spatial_unit_id`.
     - Insert into `la_rrr` (`party_id`, `spatial_unit_id`, `rrr_type`='Usufruct', `approval_status`='Pending_Verification').
     - Commit transaction `conn.commit()`. Log success detailing respondent, CNIC, WKT spatial polygon, and DB record IDs.
   - Main consumer loop: poll Redis queue `kobo_payloads` using `blpop` or fallback loop.

4. **M4_ETL: E2E Mock Payload Test Script (`backend/test_payload.js`)**:
   - Create `backend/test_payload.js`.
   - Construct valid mock KoboToolbox v2 REST API survey payload JSON containing:
     - `respondent_name`: "Gul Khan"
     - `cnic`: "54400-1234567-1"
     - `district`: "Quetta", `tehsil`: "Chiltan", `union_council`: "Hanna Valley"
     - `geoshape`: `"30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0; 30.1798 66.9750 0 0"`
   - Send HTTP POST request to Express webhook listener (`http://localhost:4000/webhook` or `http://localhost:3001/webhook`).
   - Validate response: check for HTTP 200 and `{ status: "success", message: "Payload queued" }`.
   - Also allow running test payload script with `--dry-run` or standalone mode to verify payload parsing and geometry extraction.

5. **Verification**:
   - Execute syntax checks on `backend/ingest.js` (`node -c backend/ingest.js`) and `backend/test_payload.js` (`node -c backend/test_payload.js`).
   - Execute syntax check on `backend/worker.py` (`python -m py_compile backend/worker.py`).
   - Run unit tests or dry-run validation.
   - Document all commands, execution outputs, and verification results in your handoff report.
