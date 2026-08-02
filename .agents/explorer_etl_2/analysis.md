# Technical Analysis & Architecture Specification: KoboToolbox ETL Pipeline (Requirements R2 & R3)

**Author:** Explorer 2 (KoboToolbox ETL Pipeline Architecture & Worker Design)  
**Date:** 2026-07-31  
**Target Components:** `backend/worker.py`, `backend/requirements.txt`, PostgreSQL/PostGIS integration  
**Scope Reference:** `SCOPE_ETL.md` (M1_ETL, M3_ETL) & `backend/db/init_schema.sql`

---

## 1. Executive Summary & Objective

This report provides the full architectural design and concrete technical specification for **Requirements R2 & R3** of the KoboToolbox ETL Pipeline. The objective is to build a robust, production-grade Python worker (`backend/worker.py`) that consumes incoming survey payloads from a Redis queue (`kobo_payloads`), extracts demographic and spatial data, converts KoboToolbox spatial format strings (`geopoint`, `geotrace`, `geoshape`) into standardized OGC Well-Known Text (WKT), and executes atomic database transactions in PostgreSQL/PostGIS across the LADM-compliant tables (`la_party`, `la_spatial_unit`, `la_rrr`).

---

## 2. Directory Structure & Environment Assessment

### 2.1 Backend Directory Structure
The target directory structure for `backend/` is:
```
backend/
├── db/
│   └── init_schema.sql
├── Dockerfile
├── ingest.js           # Express Webhook Listener (M2_ETL)
├── package.json        # Node.js dependencies
├── requirements.txt     # Python dependencies (M1_ETL)
├── test_payload.js     # E2E Test script (M4_ETL)
└── worker.py           # Python ETL Worker (M3_ETL)
```

### 2.2 Python Environment & Execution Model
- **Python Execution Engine**: Managed via `uv` or standard Python 3.10+ runtime.
- **Environment Variables**:
  - `REDIS_HOST` (default: `localhost`)
  - `REDIS_PORT` (default: `6379`)
  - `REDIS_DB` (default: `0`)
  - `REDIS_QUEUE_KEY` (default: `kobo_payloads`)
  - `POSTGRES_HOST` (default: `localhost`)
  - `POSTGRES_PORT` (default: `5432`)
  - `POSTGRES_DB` (default: `land_admin` or `postgres`)
  - `POSTGRES_USER` (default: `postgres`)
  - `POSTGRES_PASSWORD` (default: `postgres`)

---

## 3. Requirement R2 Specification: Dependencies & Environment

### 3.1 `backend/requirements.txt`
```text
redis>=4.5.0
psycopg2-binary>=2.9.6
python-dotenv>=1.0.0
```
- `redis`: High-performance Python client for Redis queue interaction (`blpop`/`rpush`).
- `psycopg2-binary`: Standalone PostgreSQL/PostGIS database driver supporting binary extensions, transactional control, and parameterized SQL queries.
- `python-dotenv`: Environment variable loader for development and deployment flexibility.

---

## 4. Requirement R3 Specification: Python ETL Worker Design

### 4.1 Field Extraction Architecture
KoboToolbox REST API v2 payloads deliver JSON objects where key names can vary based on form design. The worker implements a resilient key-resolution mechanism:

| Field Target | Target DB Column | Key Aliases Checked (Case-Insensitive) | Default / Fallback Strategy |
|--------------|------------------|----------------------------------------|-----------------------------|
| **CNIC** | `la_party.cnic_number` | `cnic`, `respondent_cnic`, `_cnic`, `applicant_cnic`, `cnic_number` | Clean hyphens/spaces. If missing, log warning; fallback to formatted fallback ID or `None`. |
| **Full Name** | `la_party.full_name` | `respondent_name`, `name`, `full_name`, `applicant_name`, `owner_name` | Default: `"Anonymous Respondent"` |
| **Spatial String** | `la_spatial_unit.geom` | `geoshape`, `geotrace`, `geopoint`, `location`, `_geolocation` | Priority: `geoshape` > `geotrace` > `geopoint` |
| **District** | `la_spatial_unit.district` | `district`, `district_name`, `location_district` | Default: `"Quetta"` |

#### Field Extractor Implementation Logic:
```python
def extract_field(payload: dict, keys: list, default=None):
    """Recursively or top-level lookup for keys in Kobo payload dictionary."""
    # Top-level direct lookup
    for key in keys:
        if key in payload and payload[key]:
            return str(payload[key]).strip()
    
    # Case-insensitive top-level lookup
    lower_payload = {k.lower(): v for k, v in payload.items()}
    for key in keys:
        if key.lower() in lower_payload and lower_payload[key.lower()]:
            return str(lower_payload[key.lower()]).strip()
            
    # Check inside nested payload or '_submission' sub-dict
    for sub_key in ['_submission', 'data', 'answers']:
        if sub_key in payload and isinstance(payload[sub_key], dict):
            res = extract_field(payload[sub_key], keys, default=None)
            if res:
                return res
                
    return default
```

---

### 4.2 PostGIS Spatial Parsing Rules & WKT Conversion

KoboToolbox outputs coordinates in string format:
`"latitude longitude altitude accuracy"` (separated by spaces, with multiple points separated by semicolons `;`).
PostGIS OGC WKT requires:
`"LONGITUDE LATITUDE"` (X Y axis order, separated by space, coordinates in geometries separated by commas `,`).

#### 1. Geopoint -> `POINT` WKT
- **Input**: `"30.1798 66.9750 0 0"` or `"30.1798 66.9750"`
- **Parsing**: Split space, take `lat = float(parts[0])`, `lon = float(parts[1])`.
- **WKT**: `POINT(66.975000 30.179800)`

#### 2. Geotrace -> `LINESTRING` WKT
- **Input**: `"30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0"`
- **Parsing**: Split by `;`, extract `lat, lon` per point.
- **WKT**: `LINESTRING(66.975000 30.179800, 66.975000 30.180000, 66.976000 30.180000)`

#### 3. Geoshape -> `POLYGON` WKT
- **Input**: `"30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0"`
- **Ring Closure Enforcement**: In GIS standard (and PostGIS `ST_GeomFromText`), a polygon linear ring must be closed (`p_first == p_last`). If the 4th point does not equal the 1st point, append the 1st point to close the ring.
- **WKT**: `POLYGON((66.975000 30.179800, 66.975000 30.180000, 66.976000 30.180000, 66.976000 30.179800, 66.975000 30.179800))`

#### Python Spatial Parsing Function (`parse_kobo_geometry`):
```python
import re

def parse_kobo_geometry(raw_str: str, geom_type: str = None) -> tuple[str, str]:
    """
    Parses KoboToolbox spatial string and returns (wkt_string, spatial_type).
    Handles geopoint, geotrace, geoshape. Auto-detects type if geom_type is not given.
    """
    if not raw_str or not raw_str.strip():
        raise ValueError("Empty spatial string provided")
    
    raw_str = raw_str.strip()
    
    # Auto-detect type if not provided
    if not geom_type:
        if ';' in raw_str:
            # Check if geoshape vs geotrace (can default to geoshape for polygon surveys)
            geom_type = 'geoshape'
        else:
            geom_type = 'geopoint'

    geom_type = geom_type.lower()
    
    if geom_type == 'geopoint':
        parts = raw_str.split()
        if len(parts) < 2:
            raise ValueError(f"Invalid geopoint string: {raw_str}")
        lat, lon = float(parts[0]), float(parts[1])
        wkt = f"POINT({lon:.6f} {lat:.6f})"
        return wkt, "Building"
        
    elif geom_type in ('geotrace', 'geoshape'):
        raw_points = [p.strip() for p in raw_str.split(';') if p.strip()]
        coords = []
        for pt in raw_points:
            parts = pt.split()
            if len(parts) >= 2:
                lat, lon = float(parts[0]), float(parts[1])
                coords.append((lon, lat))
                
        if len(coords) < 2:
            raise ValueError(f"Insufficient coordinates for {geom_type}: {raw_str}")
            
        if geom_type == 'geotrace':
            coord_str = ", ".join([f"{lon:.6f} {lat:.6f}" for lon, lat in coords])
            wkt = f"LINESTRING({coord_str})"
            return wkt, "Usufruct_Zone"
        else:  # geoshape
            if len(coords) < 3:
                raise ValueError(f"Geoshape polygon requires at least 3 points, got {len(coords)}")
            # Enforce linear ring closure
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            coord_str = ", ".join([f"{lon:.6f} {lat:.6f}" for lon, lat in coords])
            wkt = f"POLYGON(({coord_str}))"
            return wkt, "Parcel"
            
    else:
        raise ValueError(f"Unsupported geometry type: {geom_type}")
```

---

### 4.3 Atomic Database Transaction Logic (`psycopg2`)

The transaction modifies 3 PostGIS schema tables defined in `init_schema.sql`:

1. `la_party`:
   - Upsert strategy on `cnic_number` to prevent `UNIQUE constraint` duplicate key violations during re-ingestion.
2. `la_spatial_unit`:
   - Inserts geometry with `ST_GeomFromText(%s, 4326)` and district.
3. `la_rrr`:
   - Links `party_id` and `spatial_unit_id` with `rrr_type='Usufruct'`, `approval_status='Pending_Verification'`.

#### SQL Queries:

**SQL 1: Upsert `la_party`**
```sql
INSERT INTO la_party (party_type, full_name, cnic_number, is_active)
VALUES ('Individual', %s, %s, TRUE)
ON CONFLICT (cnic_number) 
DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    is_active = TRUE
RETURNING party_id;
```

**SQL 2: Insert `la_spatial_unit`**
```sql
INSERT INTO la_spatial_unit (spatial_type, geom, district, is_active)
VALUES (%s, ST_GeomFromText(%s, 4326), %s, TRUE)
RETURNING spatial_unit_id;
```

**SQL 3: Insert `la_rrr`**
```sql
INSERT INTO la_rrr (party_id, spatial_unit_id, rrr_type, approval_status, description, is_active)
VALUES (%s, %s, 'Usufruct', 'Pending_Verification', %s, TRUE)
RETURNING rrr_id;
```

#### Transaction Function Logic:
```python
def process_payload_transaction(db_conn, payload_data: dict):
    """
    Executes atomic database transaction for survey payload.
    Rolls back automatically on failure.
    """
    cnic = extract_field(payload_data, ['cnic', 'respondent_cnic', '_cnic', 'applicant_cnic'], None)
    name = extract_field(payload_data, ['respondent_name', 'name', 'full_name', 'owner_name'], "Anonymous Respondent")
    district = extract_field(payload_data, ['district', 'district_name'], "Quetta")
    
    # Extract spatial raw string and determine type
    raw_geoshape = extract_field(payload_data, ['geoshape', 'parcel_shape', 'boundary'], None)
    raw_geotrace = extract_field(payload_data, ['geotrace', 'route'], None)
    raw_geopoint = extract_field(payload_data, ['geopoint', 'location', '_geolocation'], None)
    
    if raw_geoshape:
        wkt, spatial_type = parse_kobo_geometry(raw_geoshape, 'geoshape')
    elif raw_geotrace:
        wkt, spatial_type = parse_kobo_geometry(raw_geotrace, 'geotrace')
    elif raw_geopoint:
        wkt, spatial_type = parse_kobo_geometry(raw_geopoint, 'geopoint')
    else:
        raise ValueError("Payload missing spatial coordinate fields (geoshape/geotrace/geopoint)")

    logger.info(f"Formatted WKT [{spatial_type}]: {wkt}")

    with db_conn.cursor() as cur:
        # 1. Upsert la_party
        cur.execute(
            """
            INSERT INTO la_party (party_type, full_name, cnic_number, is_active)
            VALUES ('Individual', %s, %s, TRUE)
            ON CONFLICT (cnic_number) 
            DO UPDATE SET full_name = EXCLUDED.full_name, is_active = TRUE
            RETURNING party_id;
            """,
            (name, cnic)
        )
        party_id = cur.fetchone()[0]

        # 2. Insert la_spatial_unit
        cur.execute(
            """
            INSERT INTO la_spatial_unit (spatial_type, geom, district, is_active)
            VALUES (%s, ST_GeomFromText(%s, 4326), %s, TRUE)
            RETURNING spatial_unit_id;
            """,
            (spatial_type, wkt, district)
        )
        spatial_unit_id = cur.fetchone()[0]

        # 3. Insert la_rrr
        cur.execute(
            """
            INSERT INTO la_rrr (party_id, spatial_unit_id, rrr_type, approval_status, description, is_active)
            VALUES (%s, %s, 'Usufruct', 'Pending_Verification', %s, TRUE)
            RETURNING rrr_id;
            """,
            (party_id, spatial_unit_id, f"KoboToolbox Ingested Record for {name} ({cnic})")
        )
        rrr_id = cur.fetchone()[0]

    # Commit atomic transaction
    db_conn.commit()
    logger.info(
        f"DB Transaction Successful | party_id: {party_id} | "
        f"spatial_unit_id: {spatial_unit_id} | rrr_id: {rrr_id}"
    )
    return party_id, spatial_unit_id, rrr_id
```

---

### 4.4 Redis Queue Consumer Loop (`backend/worker.py`)

#### Loop Design:
- Uses `redis.Redis(host=..., port=..., db=0)`.
- Uses `r.blpop("kobo_payloads", timeout=2)` blocking list pop.
- Safe termination handling (`signal.SIGINT`, `signal.SIGTERM`).
- Robust error handling: if parsing/DB fails, roll back connection, log error, push message to `kobo_payloads_dlq` (Dead Letter Queue) so worker never enters an infinite crash loop.

#### Complete Worker Code Skeleton (`backend/worker.py`):
```python
import os
import json
import logging
import signal
import sys
import time
import redis
import psycopg2

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [WORKER] %(message)s'
)
logger = logging.getLogger("kobo_etl_worker")

# Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_QUEUE = os.getenv("REDIS_QUEUE_KEY", "kobo_payloads")
REDIS_DLQ = os.getenv("REDIS_DLQ_KEY", "kobo_payloads_dlq")

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", 5432))
POSTGRES_DB = os.getenv("POSTGRES_DB", "land_admin")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")

running = True

def signal_handler(signum, frame):
    global running
    logger.info("Shutdown signal received. Exiting worker loop gracefully...")
    running = False

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def get_db_connection():
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD
    )

def main():
    logger.info("Initializing KoboToolbox ETL Worker...")
    
    # Initialize Redis connection
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
    logger.info(f"Connected to Redis at {REDIS_HOST}:{REDIS_PORT}, listening on queue: {REDIS_QUEUE}")

    # Initialize DB Connection
    db_conn = None
    
    while running:
        try:
            if db_conn is None or db_conn.closed != 0:
                try:
                    db_conn = get_db_connection()
                    logger.info("Connected to PostgreSQL/PostGIS database.")
                except Exception as db_err:
                    logger.error(f"Failed to connect to database: {db_err}. Retrying in 5 seconds...")
                    time.sleep(5)
                    continue

            # Blocking pop from Redis queue (timeout 2s to allow signal handling)
            item = r.blpop(REDIS_QUEUE, timeout=2)
            if item is None:
                continue

            queue_name, raw_payload = item
            logger.info(f"Received payload from queue '{queue_name}'")

            try:
                payload_data = json.loads(raw_payload)
                process_payload_transaction(db_conn, payload_data)
            except Exception as proc_err:
                logger.error(f"Failed to process payload: {proc_err}. Rolling back DB transaction...", exc_info=True)
                if db_conn:
                    db_conn.rollback()
                # Dead-letter queue push
                r.rpush(REDIS_DLQ, raw_payload)
                logger.warning(f"Payload pushed to dead-letter queue '{REDIS_DLQ}'")

        except redis.ConnectionError as r_err:
            logger.error(f"Redis connection lost: {r_err}. Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as general_err:
            logger.error(f"Unexpected worker error: {general_err}")
            time.sleep(1)

    if db_conn and db_conn.closed == 0:
        db_conn.close()
        logger.info("Closed database connection.")
    logger.info("Worker process stopped.")

if __name__ == "__main__":
    main()
```

---

## 5. Risk Assessment & Mitigations

| Risk | Cause | Mitigation Strategy |
|------|-------|---------------------|
| **PostGIS Polygon Ring Open Error** | Kobo geoshape strings do not explicitly duplicate the 1st point at the end | `parse_kobo_geometry` automatically checks `coords[0] != coords[-1]` and appends `coords[0]` before formatting WKT. |
| **CNIC Duplicate Key Violation** | Multiple submissions for same respondent | `la_party` query uses `ON CONFLICT (cnic_number) DO UPDATE` to ensure idempotency. |
| **Invalid Coordinate Format** | Survey response contains letters or broken floats | `try/except ValueError` in coordinate parser, rollback transaction, log warning, move payload to `kobo_payloads_dlq`. |
| **DB Connection Dropped** | Network blip or Postgres restart | Worker reconnects dynamically in main loop on next iteration without process crash. |

---

## 6. Verification & Test Plan

1. **Unit Testing Spatial Parser**:
   - Test `geopoint` `"30.1798 66.9750 0 0"` -> `POINT(66.975000 30.179800)`
   - Test `geotrace` `"30.1798 66.9750 0 0; 30.1800 66.9750 0 0"` -> `LINESTRING(66.975000 30.179800, 66.975000 30.180000)`
   - Test `geoshape` without closed ring -> Verify ring closure in WKT output `POLYGON((...))`
2. **Integration Verification**:
   - Run worker with mock Redis payload.
   - Query PostgreSQL database (`la_party`, `la_spatial_unit`, `la_rrr`) to confirm inserted rows, valid UUIDs, and proper SRID 4326 geometry.
