## 2026-07-31T00:40:28Z
You are Explorer 2 for the KoboToolbox ETL Pipeline project.
Working directory for your metadata: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_etl_2
Project root: C:\Users\Administrator\teamwork_projects\anthropology_portfolio

Your task:
1. Read `SCOPE_ETL.md` at `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\orchestrator_etl\SCOPE_ETL.md` and `backend/db/init_schema.sql`.
2. Inspect `backend/` directory structure and Python environment.
3. Design and specify the implementation details for Requirements R2 & R3:
   - Python ETL worker (`backend/worker.py`).
   - Python dependencies needed in `requirements.txt` (`redis`, `psycopg2-binary`).
   - Redis queue consumer loop (polling `kobo_payloads`).
   - Field extraction logic: CNIC (e.g. `cnic`/`respondent_cnic`), respondent name (`name`/`respondent_name`), and raw spatial strings (`geopoint`, `geotrace`, `geoshape`).
   - Spatial parsing function converting:
     * `geopoint` ("lat lon alt acc") -> `POINT(lon lat)`
     * `geotrace` ("lat1 lon1 ...; lat2 lon2 ...") -> `LINESTRING(lon1 lat1, lon2 lat2, ...)`
     * `geoshape` ("lat1 lon1 ...; lat2 lon2 ...") -> `POLYGON((lon1 lat1, lon2 lat2, ..., lon1 lat1))`
   - Atomic database transaction logic (`psycopg2`) performing upserts/inserts into `la_party`, `la_spatial_unit`, and `la_rrr` tables as defined in `init_schema.sql`.
   - Logging of formatted WKT polygons and database transaction results.
4. Write your comprehensive analysis report to `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_etl_2\analysis.md` and handoff report to `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_etl_2\handoff.md`.
5. Send a message to parent with your findings.
