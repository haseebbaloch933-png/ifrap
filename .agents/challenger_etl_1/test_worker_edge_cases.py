import unittest
import sys
import os

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.worker import (
    parse_geopoint,
    parse_geotrace,
    parse_geoshape,
    extract_payload_data,
    process_payload_db
)

class MockCursor:
    def __init__(self, conn):
        self.conn = conn
        self.executed = []

    def execute(self, sql, params=None):
        self.executed.append((sql.strip(), params))
        if "la_party" in sql:
            self.conn.party_counter += 1
            if params and len(params) > 1 and params[1] in self.conn.existing_cnics:
                # Simulate ON CONFLICT RETURNING party_id for existing CNIC
                self.last_party_id = self.conn.existing_cnics[params[1]]
            else:
                self.last_party_id = self.conn.party_counter
                if params and len(params) > 1:
                    self.conn.existing_cnics[params[1]] = self.last_party_id
        elif "la_spatial_unit" in sql:
            self.conn.spatial_counter += 1
            self.last_spatial_id = self.conn.spatial_counter
            if params and len(params) > 1:
                self.conn.spatial_records.append(params[1]) # wkt
        elif "la_rrr" in sql:
            self.conn.rrr_counter += 1
            self.last_rrr_id = self.conn.rrr_counter

    def fetchone(self):
        if hasattr(self, 'last_party_id'):
            val = self.last_party_id
            delattr(self, 'last_party_id')
            return (val,)
        elif hasattr(self, 'last_spatial_id'):
            val = self.last_spatial_id
            delattr(self, 'last_spatial_id')
            return (val,)
        elif hasattr(self, 'last_rrr_id'):
            val = self.last_rrr_id
            delattr(self, 'last_rrr_id')
            return (val,)
        return (1,)

    def close(self):
        pass

class MockDBConnection:
    def __init__(self):
        self.party_counter = 0
        self.spatial_counter = 0
        self.rrr_counter = 0
        self.existing_cnics = {}
        self.spatial_records = []
        self.committed = False
        self.rolled_back = False

    def cursor(self):
        return MockCursor(self)

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        pass

class TestWorkerAdversarialEdgeCases(unittest.TestCase):

    # ==================== SPATIAL PARSING EDGE CASES ==================== #

    def test_geopoint_extra_whitespace_and_3d_4d(self):
        # 4D coordinate string with leading/trailing spaces
        wkt = parse_geopoint("   30.1798   66.9750   1500.5   12.3   ")
        self.assertEqual(wkt, "POINT(66.975 30.1798)")

    def test_geopoint_negative_coordinates(self):
        # Negative latitude and longitude (e.g. South/West hemisphere)
        wkt = parse_geopoint("-33.8688 -151.2093 10 5")
        self.assertEqual(wkt, "POINT(-151.2093 -33.8688)")

    def test_geopoint_invalid_types_and_tokens(self):
        with self.assertRaises(ValueError):
            parse_geopoint(None)
        with self.assertRaises(ValueError):
            parse_geopoint(12345)
        with self.assertRaises(ValueError):
            parse_geopoint("30.1798") # Only 1 token
        with self.assertRaises(ValueError):
            parse_geopoint("invalid non_numeric") # ValueError on float()

    def test_geotrace_semicolons_newlines_spaces(self):
        # Semicolon separated, newline separated, multi-space
        trace_str = "  30.1 66.1 0 0 ; \n 30.2 66.2 0 0 ;  30.3 66.3 0 0  "
        wkt = parse_geotrace(trace_str)
        self.assertEqual(wkt, "LINESTRING(66.1 30.1, 66.2 30.2, 66.3 30.3)")

    def test_geotrace_degenerate_single_point(self):
        # 1 vertex geotrace -> Should fail (LINESTRING requires >= 2 points)
        with self.assertRaises(ValueError):
            parse_geotrace("30.1798 66.9750 0 0")

    def test_geotrace_stride_fallback(self):
        # Geotrace without semicolons or newlines: 8 numbers -> 2 vertices of 4 stride
        trace_raw = "30.1 66.1 0 0 30.2 66.2 0 0"
        wkt = parse_geotrace(trace_raw)
        self.assertEqual(wkt, "LINESTRING(66.1 30.1, 66.2 30.2)")

    def test_geoshape_1_point_and_2_point_degenerate(self):
        # 1-point geoshape -> Failure (Polygon requires >= 3 points)
        with self.assertRaises(ValueError):
            parse_geoshape("30.1798 66.9750 0 0")

        # 2-point geoshape -> Failure
        with self.assertRaises(ValueError):
            parse_geoshape("30.1798 66.9750 0 0; 30.1800 66.9750 0 0")

    def test_geoshape_open_linear_ring_auto_close(self):
        # 3 points provided (open triangle) -> Automatically closed by appending 1st point as 4th point
        open_triangle = "30.0 66.0 0 0; 30.0 67.0 0 0; 31.0 67.0 0 0"
        wkt = parse_geoshape(open_triangle)
        self.assertEqual(wkt, "POLYGON((66.0 30.0, 67.0 30.0, 67.0 31.0, 66.0 30.0))")

    def test_geoshape_negative_coordinates_and_floats(self):
        shape = "-30.5 -66.5; -30.5 -66.6; -30.6 -66.6; -30.5 -66.5"
        wkt = parse_geoshape(shape)
        self.assertEqual(wkt, "POLYGON((-66.5 -30.5, -66.6 -30.5, -66.6 -30.6, -66.5 -30.5))")

    # ==================== PAYLOAD & SQL INJECTION EDGE CASES ==================== #

    def test_sql_injection_in_payload_data(self):
        # SQL Injection attempt in name, cnic, district
        injection_payload = {
            "respondent_name": "Robert'; DROP TABLE la_party; --",
            "cnic": "54400-0000000-0'; DELETE FROM la_rrr; --",
            "district": "Quetta'; TRUNCATE la_spatial_unit; --",
            "geopoint": "30.1798 66.9750 0 0"
        }
        extracted = extract_payload_data(injection_payload)
        
        # Verify parameterized query execution with mock connection
        conn = MockDBConnection()
        res = process_payload_db(conn, extracted)
        
        # Check that parameterized query was passed safely as tuple args, NOT concatenated SQL
        cursor = conn.cursor()
        self.assertTrue(conn.committed)
        self.assertEqual(res['party_id'], 1)
        self.assertEqual(res['spatial_unit_id'], 1)
        self.assertEqual(res['rrr_id'], 1)

    def test_missing_or_empty_cnic_and_name_defaults(self):
        # Missing CNIC -> returns empty string ''
        # Missing respondent_name -> defaults to 'Anonymous'
        payload = {
            "district": "Pishin",
            "geopoint": "30.2 66.8"
        }
        extracted = extract_payload_data(payload)
        self.assertEqual(extracted['cnic'], '')
        self.assertEqual(extracted['name'], 'Anonymous')
        self.assertEqual(extracted['district'], 'Pishin')

    # ==================== IDEMPOTENCY EDGE CASES ==================== #

    def test_idempotency_duplicate_cnic_processing(self):
        conn = MockDBConnection()

        payload1 = {
            "respondent_name": "Gul Khan",
            "cnic": "54400-1234567-1",
            "geopoint": "30.1798 66.9750 0 0"
        }
        extracted1 = extract_payload_data(payload1)
        res1 = process_payload_db(conn, extracted1)

        payload2 = {
            "respondent_name": "Gul Khan Updated Name",
            "cnic": "54400-1234567-1", # Same CNIC
            "geopoint": "30.1800 66.9760 0 0"
        }
        extracted2 = extract_payload_data(payload2)
        res2 = process_payload_db(conn, extracted2)

        # Same party_id due to ON CONFLICT (cnic_number) DO UPDATE
        self.assertEqual(res1['party_id'], res2['party_id'])
        
        # New spatial_unit_id and rrr_id created for each submission
        self.assertNotEqual(res1['spatial_unit_id'], res2['spatial_unit_id'])
        self.assertNotEqual(res1['rrr_id'], res2['rrr_id'])

    def test_idempotency_duplicate_spatial_payload(self):
        conn = MockDBConnection()

        payload = {
            "respondent_name": "Fatima",
            "cnic": "54400-9999999-9",
            "geoshape": "30 66 0 0; 30 67 0 0; 31 67 0 0; 30 66 0 0"
        }
        extracted = extract_payload_data(payload)

        res1 = process_payload_db(conn, extracted)
        res2 = process_payload_db(conn, extracted)

        # Party ID remains unchanged (1)
        self.assertEqual(res1['party_id'], res2['party_id'])

        # Two spatial unit records created in spatial database
        self.assertEqual(len(conn.spatial_records), 2)
        self.assertEqual(conn.spatial_records[0], conn.spatial_records[1])


if __name__ == '__main__':
    unittest.main()
