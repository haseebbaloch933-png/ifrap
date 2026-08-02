# Handoff Report: Requirements R2 & R3 Design & Architecture (KoboToolbox ETL Pipeline)

**Agent:** Explorer 2 (`explorer_etl_2`)  
**Working Directory:** `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_etl_2`  
**Target Specifications:** Requirements R2 & R3 (`backend/requirements.txt`, `backend/worker.py`, spatial WKT conversion & PostGIS schema transactions)  
**Handoff Type:** Hard (Task complete)

---

## 1. Observation

1. **Scope Requirements**:
   - `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\orchestrator_etl\SCOPE_ETL.md` defines Milestone `M3_ETL` requiring `backend/worker.py` to poll Redis queue (`kobo_payloads`), parse Kobo spatial strings (`geopoint`, `geotrace`, `geoshape`) into WKT, and perform atomic database transactions across `la_party`, `la_spatial_unit`, and `la_rrr`.
2. **Database Schema (`init_schema.sql`)**:
   - `la_party` table at lines 15–24: `party_id UUID PRIMARY KEY`, `full_name VARCHAR(255) NOT NULL`, `cnic_number VARCHAR(20) UNIQUE`, `party_type VARCHAR(50)` inheriting `la_versioned_object`.
   - `la_spatial_unit` table at lines 27–35: `spatial_unit_id UUID PRIMARY KEY`, `spatial_type VARCHAR(50)`, `geom GEOMETRY(Geometry, 4326) NOT NULL`, `district VARCHAR(100) NOT NULL`.
   - `la_rrr` table at lines 48–58: `rrr_id UUID PRIMARY KEY`, `party_id UUID REFERENCES la_party`, `spatial_unit_id UUID REFERENCES la_spatial_unit`, `rrr_type VARCHAR(50)`, `approval_status VARCHAR(50) DEFAULT 'Pending_Verification'`.
3. **Environment & Runtime**:
   - `uv` is installed at `C:\Users\Administrator\.local\bin\uv.exe`.
   - Python dependencies required: `redis>=4.5.0`, `psycopg2-binary>=2.9.6`, `python-dotenv>=1.0.0`.

---

## 2. Logic Chain

1. **Redis Queue Consumption**:
   - The worker must poll Redis list key `kobo_payloads` using blocking list pop (`blpop` with a 2-second timeout) to support non-blocking loop shutdown signals (`SIGINT`/`SIGTERM`).
   - If payload parsing fails, payloads are safely pushed to `kobo_payloads_dlq` (Dead-Letter Queue), preventing pipeline blockage or worker process crashes.
2. **Field Extraction Strategy**:
   - Survey submission JSON fields can use key aliases.
   - CNIC resolution checks: `cnic`, `respondent_cnic`, `_cnic`, `applicant_cnic`, `cnic_number`.
   - Respondent Name resolution checks: `respondent_name`, `name`, `full_name`, `applicant_name`.
   - Spatial fields check: `geoshape`, `geotrace`, `geopoint`, `location`, `_geolocation`.
3. **PostGIS Coordinate Axis & Topology Conversion**:
   - Kobo coordinate representation: `"latitude longitude altitude accuracy"`.
   - OGC PostGIS WKT representation: `"LONGITUDE LATITUDE"`.
   - Geopoint ("lat lon alt acc") -> `POINT(lon lat)`.
   - Geotrace ("lat1 lon1 ...; lat2 lon2 ...") -> `LINESTRING(lon1 lat1, lon2 lat2, ...)`.
   - Geoshape ("lat1 lon1 ...; lat2 lon2 ...") -> `POLYGON((lon1 lat1, lon2 lat2, ..., lon1 lat1))`.
   - To guarantee valid PostGIS polygons, linear ring closure (`coords[0] == coords[-1]`) is verified and automatically enforced prior to WKT string formatting.
4. **Atomic Transaction Logic**:
   - Executed using `psycopg2` within a single connection transaction (`with db_conn.cursor() as cur:` block followed by `db_conn.commit()`).
   - `la_party` uses `ON CONFLICT (cnic_number) DO UPDATE` to ensure idempotency when processing duplicate or modified respondent entries.
   - `la_spatial_unit` uses `ST_GeomFromText(wkt, 4326)` for PostGIS geometry construction.
   - `la_rrr` connects `party_id` and `spatial_unit_id` with `rrr_type='Usufruct'` and `approval_status='Pending_Verification'`.
   - On exception, `db_conn.rollback()` is executed, preventing orphaned records.

---

## 3. Caveats

- **No Caveats**. All schema details, field fallback mappings, spatial geometry parsing rules, WKT formats, error-handling mechanisms, and atomic PostgreSQL transactions have been fully specified and documented in `analysis.md`.

---

## 4. Conclusion

Requirements R2 and R3 are fully designed and ready for implementation by the worker agent.
- `backend/requirements.txt` is specified with `redis>=4.5.0`, `psycopg2-binary>=2.9.6`, `python-dotenv>=1.0.0`.
- `backend/worker.py` is specified with complete code structure, field extractors, spatial parsing functions, PostgreSQL transaction handler, Redis consumer loop, and signal handling.
- Full details are provided in `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_etl_2\analysis.md`.

---

## 5. Verification Method

To verify the worker implementation:
1. **Spatial Parsing Verification**:
   Execute Python unit tests on `parse_kobo_geometry`:
   - Input geopoint `"30.1798 66.9750 0 0"` -> Expected: `POINT(66.975000 30.179800)`
   - Input geotrace `"30.1798 66.9750 0 0; 30.1800 66.9750 0 0"` -> Expected: `LINESTRING(66.975000 30.179800, 66.975000 30.180000)`
   - Input geoshape `"30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0"` -> Expected closed ring: `POLYGON((66.975000 30.179800, 66.975000 30.180000, 66.976000 30.180000, 66.976000 30.179800, 66.975000 30.179800))`
2. **Database Verification**:
   Inspect database state after running transaction:
   ```sql
   SELECT p.full_name, p.cnic_number, s.spatial_type, ST_AsText(s.geom), r.rrr_type, r.approval_status
   FROM la_party p
   JOIN la_rrr r ON p.party_id = r.party_id
   JOIN la_spatial_unit s ON r.spatial_unit_id = s.spatial_unit_id;
   ```
