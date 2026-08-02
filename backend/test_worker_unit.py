import unittest
import sys
from backend.worker import (
    parse_geopoint,
    parse_geotrace,
    parse_geoshape,
    extract_payload_data
)

class TestWorkerETL(unittest.TestCase):

    def test_parse_geopoint(self):
        wkt = parse_geopoint("30.1798 66.9750 0 0")
        self.assertEqual(wkt, "POINT(66.975 30.1798)")

        wkt2 = parse_geopoint("30.1798 66.9750")
        self.assertEqual(wkt2, "POINT(66.975 30.1798)")

        with self.assertRaises(ValueError):
            parse_geopoint("30.1798")

    def test_parse_geotrace(self):
        trace_str = "30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0"
        wkt = parse_geotrace(trace_str)
        self.assertEqual(wkt, "LINESTRING(66.975 30.1798, 66.975 30.18, 66.976 30.18)")

        with self.assertRaises(ValueError):
            parse_geotrace("30.1798 66.9750 0 0")

    def test_parse_geoshape_closing(self):
        # Open ring polygon (4 vertices) -> should automatically close 5th vertex equal to 1st
        shape_open = "30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0"
        wkt = parse_geoshape(shape_open)
        self.assertEqual(
            wkt,
            "POLYGON((66.975 30.1798, 66.975 30.18, 66.976 30.18, 66.976 30.1798, 66.975 30.1798))"
        )

    def test_parse_geoshape_already_closed(self):
        shape_closed = "30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0; 30.1798 66.9750 0 0"
        wkt = parse_geoshape(shape_closed)
        self.assertEqual(
            wkt,
            "POLYGON((66.975 30.1798, 66.975 30.18, 66.976 30.18, 66.976 30.1798, 66.975 30.1798))"
        )

    def test_extract_payload_data(self):
        payload = {
            "respondent_name": "Gul Khan",
            "cnic": "54400-1234567-1",
            "district": "Quetta",
            "tehsil": "Chiltan",
            "union_council": "Hanna Valley",
            "geoshape": "30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0; 30.1798 66.9750 0 0"
        }
        data = extract_payload_data(payload)
        self.assertTrue(data['name'].startswith("ANON_NAME_") or "[REDACTED" in data['name'])
        self.assertTrue(data['cnic'].startswith("CNIC_HASH_"))
        self.assertEqual(data['district'], "Quetta")
        self.assertEqual(data['tehsil'], "Chiltan")
        self.assertEqual(data['union_council'], "Hanna Valley")
        self.assertEqual(data['spatial_type'], "Parcel")
        self.assertTrue(data['wkt'].startswith("POLYGON(("))


if __name__ == '__main__':
    unittest.main()
