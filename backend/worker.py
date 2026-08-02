import os
import sys
import json
import time

try:
    import redis
except ImportError:
    redis = None

try:
    import psycopg2
except ImportError:
    psycopg2 = None

try:
    from backend.pii_scrubber import scrub_pii_payload
except ImportError:
    try:
        from pii_scrubber import scrub_pii_payload
    except ImportError:
        scrub_pii_payload = lambda p: p

def parse_geopoint(geopoint_str):
    """
    Converts KoboToolbox geopoint format ("lat lon alt acc") to WKT POINT(lon lat).
    """
    if not geopoint_str or not isinstance(geopoint_str, str):
        raise ValueError("Invalid geopoint string")
    tokens = [t for t in geopoint_str.strip().split() if t]
    if len(tokens) < 2:
        raise ValueError(f"Geopoint requires at least lat and lon, got '{geopoint_str}'")
    lat = float(tokens[0])
    lon = float(tokens[1])
    return f"POINT({lon} {lat})"

def parse_geotrace(geotrace_str):
    """
    Converts KoboToolbox geotrace format ("lat1 lon1 alt1 acc1; lat2 lon2 alt2 acc2...")
    to WKT LINESTRING(lon1 lat1, lon2 lat2, ...).
    """
    if not geotrace_str or not isinstance(geotrace_str, str):
        raise ValueError("Invalid geotrace string")
    
    if ';' in geotrace_str:
        raw_points = [p.strip() for p in geotrace_str.strip().split(';') if p.strip()]
    else:
        raw_points = [p.strip() for p in geotrace_str.strip().splitlines() if p.strip()]
        if len(raw_points) <= 1:
            tokens = [t for t in geotrace_str.strip().split() if t]
            if len(tokens) >= 4:
                stride = 4 if len(tokens) % 4 == 0 else 2
                raw_points = [' '.join(tokens[i:i+stride]) for i in range(0, len(tokens), stride)]

    coords = []
    for pt in raw_points:
        tokens = [t for t in pt.split() if t]
        if len(tokens) >= 2:
            lat = float(tokens[0])
            lon = float(tokens[1])
            coords.append(f"{lon} {lat}")

    if len(coords) < 2:
        raise ValueError(f"Geotrace requires at least 2 vertices, got {len(coords)}")
    
    return f"LINESTRING({', '.join(coords)})"

def parse_geoshape(geoshape_str):
    """
    Converts KoboToolbox geoshape format ("lat1 lon1 alt1 acc1; lat2 lon2 alt2 acc2...")
    to WKT POLYGON((lon1 lat1, lon2 lat2, ..., lon1 lat1)), ensuring closing linear ring.
    """
    if not geoshape_str or not isinstance(geoshape_str, str):
        raise ValueError("Invalid geoshape string")

    if ';' in geoshape_str:
        raw_points = [p.strip() for p in geoshape_str.strip().split(';') if p.strip()]
    else:
        raw_points = [p.strip() for p in geoshape_str.strip().splitlines() if p.strip()]
        if len(raw_points) <= 1:
            tokens = [t for t in geoshape_str.strip().split() if t]
            if len(tokens) >= 6:
                stride = 4 if len(tokens) % 4 == 0 else 2
                raw_points = [' '.join(tokens[i:i+stride]) for i in range(0, len(tokens), stride)]

    coords = []
    for pt in raw_points:
        tokens = [t for t in pt.split() if t]
        if len(tokens) >= 2:
            lat = float(tokens[0])
            lon = float(tokens[1])
            coords.append((lon, lat))

    if len(coords) < 3:
        raise ValueError(f"Geoshape requires at least 3 vertices, got {len(coords)}")

    # Close linear ring if first and last vertex differ
    if coords[0] != coords[-1]:
        coords.append(coords[0])

    coord_strings = [f"{lon} {lat}" for lon, lat in coords]
    return f"POLYGON(({', '.join(coord_strings)}))"

def extract_payload_data(payload):
    """
    Extracts respondent attribute, CNIC, administrative units, and spatial geometry WKT.
    Automatically scrubs PII before PostGIS insertion.
    """
    payload = scrub_pii_payload(payload)

    cnic = (
        payload.get('cnic') or
        payload.get('respondent_cnic') or
        payload.get('_cnic') or
        ''
    )
    name = (
        payload.get('respondent_name') or
        payload.get('name') or
        payload.get('full_name') or
        'Anonymous'
    )
    district = payload.get('district') or 'Quetta'
    tehsil = payload.get('tehsil') or 'Chiltan'
    union_council = payload.get('union_council') or 'Hanna Valley'

    geom_wkt = None
    spatial_type = 'Parcel'

    if payload.get('geoshape'):
        geom_wkt = parse_geoshape(payload['geoshape'])
    elif payload.get('geotrace'):
        geom_wkt = parse_geotrace(payload['geotrace'])
    elif payload.get('geopoint'):
        geom_wkt = parse_geopoint(payload['geopoint'])
    else:
        raise ValueError("Payload lacking spatial attributes (geoshape, geotrace, or geopoint)")

    return {
        'cnic': cnic,
        'name': name,
        'district': district,
        'tehsil': tehsil,
        'union_council': union_council,
        'wkt': geom_wkt,
        'spatial_type': spatial_type
    }


def process_payload_db(conn, data):
    """
    Performs atomic PostGIS database transaction inserting into la_party, la_spatial_unit, and la_rrr.
    """
    cursor = conn.cursor()
    try:
        # 1. Insert into la_party
        party_sql = """
            INSERT INTO la_party (full_name, cnic_number, party_type)
            VALUES (%s, %s, 'Individual')
            ON CONFLICT (cnic_number) DO UPDATE SET full_name = EXCLUDED.full_name
            RETURNING party_id;
        """
        cursor.execute(party_sql, (data['name'], data['cnic']))
        party_id = cursor.fetchone()[0]

        # 2. Insert into la_spatial_unit
        spatial_sql = """
            INSERT INTO la_spatial_unit (spatial_type, geom, district, tehsil, union_council)
            VALUES (%s, ST_GeomFromText(%s, 4326), %s, %s, %s)
            RETURNING spatial_unit_id;
        """
        cursor.execute(spatial_sql, (
            data['spatial_type'],
            data['wkt'],
            data['district'],
            data['tehsil'],
            data['union_council']
        ))
        spatial_unit_id = cursor.fetchone()[0]

        # 3. Insert into la_rrr
        rrr_sql = """
            INSERT INTO la_rrr (party_id, spatial_unit_id, rrr_type, approval_status)
            VALUES (%s, %s, 'Usufruct', 'Pending_Verification')
            RETURNING rrr_id;
        """
        cursor.execute(rrr_sql, (party_id, spatial_unit_id))
        rrr_id = cursor.fetchone()[0]

        conn.commit()
        print(f"[Worker DB] Transaction committed successfully:")
        print(f"            Respondent: {data['name']} | CNIC: {data['cnic']}")
        print(f"            Spatial WKT: {data['wkt']}")
        print(f"            Record IDs: party_id={party_id}, spatial_unit_id={spatial_unit_id}, rrr_id={rrr_id}")
        return {
            'party_id': party_id,
            'spatial_unit_id': spatial_unit_id,
            'rrr_id': rrr_id
        }
    except Exception as e:
        conn.rollback()
        print(f"[Worker DB Error] DB transaction failed, rolled back: {e}")
        raise
    finally:
        cursor.close()

def get_redis_connection():
    if redis is None:
        print("[Worker Warning] redis Python package not installed.")
        return None
    redis_host = os.environ.get('REDIS_HOST', 'localhost')
    redis_port = int(os.environ.get('REDIS_PORT', 6379))
    try:
        client = redis.Redis(host=redis_host, port=redis_port, db=0, socket_timeout=3)
        client.ping()
        print(f"[Worker] Connected to Redis at {redis_host}:{redis_port}")
        return client
    except Exception as e:
        print(f"[Worker Warning] Could not connect to Redis ({e}). Operating in dry-run/fallback mode.")
        return None

def get_db_connection():
    if psycopg2 is None:
        print("[Worker Warning] psycopg2 Python package not installed.")
        return None
    dbname = os.environ.get('DB_NAME', os.environ.get('POSTGRES_DB', 'anthropology_db'))
    user = os.environ.get('DB_USER', os.environ.get('POSTGRES_USER', 'postgres'))
    password = os.environ.get('DB_PASSWORD', os.environ.get('POSTGRES_PASSWORD', 'postgres'))
    host = os.environ.get('DB_HOST', 'localhost')
    port = os.environ.get('DB_PORT', '5432')
    try:
        conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port,
            connect_timeout=3
        )
        print(f"[Worker] Connected to PostGIS DB at {host}:{port}/{dbname}")
        return conn
    except Exception as e:
        print(f"[Worker Warning] Could not connect to PostGIS DB ({e}). Operating in dry-run/fallback mode.")
        return None

def run_dry_run():
    print("=== [KoboToolbox Worker Dry-Run Mode] ===")
    mock_payload = {
        "respondent_name": "Gul Khan",
        "cnic": "54400-1234567-1",
        "district": "Quetta",
        "tehsil": "Chiltan",
        "union_council": "Hanna Valley",
        "geoshape": "30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0; 30.1798 66.9750 0 0"
    }
    extracted = extract_payload_data(mock_payload)
    print(f"Respondent Name : {extracted['name']}")
    print(f"CNIC            : {extracted['cnic']}")
    print(f"Location        : {extracted['district']}, {extracted['tehsil']}, {extracted['union_council']}")
    print(f"Spatial Type    : {extracted['spatial_type']}")
    print(f"WKT Geometry    : {extracted['wkt']}")

    conn = get_db_connection()
    if conn:
        try:
            process_payload_db(conn, extracted)
        finally:
            conn.close()
    else:
        print("[Dry-Run] DB unavailable. Simulating SQL execution:")
        print("  1. INSERT INTO la_party (full_name, cnic_number, party_type) VALUES ('Gul Khan', '54400-1234567-1', 'Individual') ...")
        print(f"  2. INSERT INTO la_spatial_unit (spatial_type, geom, district, tehsil, union_council) VALUES ('Parcel', ST_GeomFromText('{extracted['wkt']}', 4326), 'Quetta', 'Chiltan', 'Hanna Valley') ...")
        print("  3. INSERT INTO la_rrr (party_id, spatial_unit_id, rrr_type, approval_status) VALUES (party_id, spatial_unit_id, 'Usufruct', 'Pending_Verification') ...")
    print("=== [Dry-Run Complete: SUCCESS] ===")

def main():
    if '--dry-run' in sys.argv or '--standalone' in sys.argv:
        run_dry_run()
        return

    r = get_redis_connection()
    conn = get_db_connection()

    if not r or not conn:
        print("[Worker] Redis or DB connection unavailable. Falling back to dry-run test mode.")
        run_dry_run()
        return

    print("[Worker] Starting Redis consumer loop polling queue 'kobo_payloads'...")
    try:
        while True:
            try:
                item = r.blpop('kobo_payloads', timeout=5)
                if item:
                    _, payload_bytes = item
                    payload = json.loads(payload_bytes)
                    print(f"[Worker] Processing payload for: {payload.get('respondent_name', 'Unknown')}")
                    extracted = extract_payload_data(payload)
                    process_payload_db(conn, extracted)
            except Exception as e:
                print(f"[Worker Loop Error] Error processing payload: {e}")
                time.sleep(1)
    except KeyboardInterrupt:
        print("[Worker] Shutting down worker.")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    main()
