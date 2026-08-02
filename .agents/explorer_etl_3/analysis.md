# Milestone 4 (M4_ETL): E2E Mock Payload Test & Pipeline Verification Analysis Report

## Executive Summary
This analysis report specifies the architecture, mock payload design, HTTP request mechanics, end-to-end verification strategy, and package configuration for Milestone 4 (`M4_ETL`) of the KoboToolbox ETL Pipeline. The objective of M4_ETL is to validate that raw KoboToolbox survey submissions containing complex spatial polygons (`geoshape`) flow seamlessly from the Express HTTP webhook endpoint, through Redis queue buffering, into the Python worker process for WKT conversion, and finally into atomic PostGIS database records.

---

## 1. KoboToolbox v2 REST API Payload Design

### 1.1 Mock Payload Schema & Structure
KoboToolbox v2 REST API survey submissions follow a standardized JSON structure. For the IFRAP Digital Oversight Platform (Component 3 Land Rights Ledger), the survey payload captures respondent demographics, CNIC, land parcel attributes, and spatial coordinates.

The mock payload for `backend/test_payload.js` is structured as follows:

```json
{
  "_id": 1048576,
  "_uuid": "f3b892a0-456b-4e89-912a-3c5d7e8f90ab",
  "_submission_time": "2026-07-31T05:30:00Z",
  "_submitted_by": "enumerator_quetta_01",
  "_xform_id_string": "ifrap_usufruct_land_rights_v2",
  "respondent_name": "Gul Khan",
  "cnic": "54400-1234567-1",
  "gender": "Male",
  "district": "Quetta",
  "tehsil": "Chiltan",
  "union_council": "Hanna Valley",
  "geoshape": "30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0; 30.1798 66.9750 0 0"
}
```

### 1.2 Field Extraction Rules & Standards
- **CNIC Extraction**: Worker checks `cnic` || `respondent_cnic` || `_cnic`. Formatted as standard 13-digit Pakistani CNIC (`54400-1234567-1`).
- **Respondent Name Extraction**: Worker checks `respondent_name` || `name` || `full_name`.
- **Spatial Geometry (`geoshape`)**: KoboToolbox represents `geoshape` polygons as space-separated coordinates (`lat lon alt acc`) delimited by semicolons `;`.
  - Point 1: `30.1798 66.9750 0 0` (Lat: 30.1798, Lon: 66.9750)
  - Point 2: `30.1800 66.9750 0 0` (Lat: 30.1800, Lon: 66.9750)
  - Point 3: `30.1800 66.9760 0 0` (Lat: 30.1800, Lon: 66.9760)
  - Point 4: `30.1798 66.9760 0 0` (Lat: 30.1798, Lon: 66.9760)
  - Point 5: `30.1798 66.9750 0 0` (Lat: 30.1798, Lon: 66.9750 - Closes polygon)

---

## 2. HTTP Request Mechanics (`backend/test_payload.js`)

### 2.1 Implementation Details
`backend/test_payload.js` is a standalone Node.js execution script designed with zero external HTTP dependencies (utilizing Node's native `http` module).

```javascript
/**
 * Milestone 4 (M4_ETL): End-to-End Test Payload Script
 * Submits a mock KoboToolbox v2 survey payload containing geoshape spatial polygon to Express webhook.
 */

const http = require('http');

const HOST = process.env.WEBHOOK_HOST || 'localhost';
const PORT = process.env.WEBHOOK_PORT || 4000;
const PATH = process.env.WEBHOOK_PATH || '/webhook';

const mockPayload = {
  _id: 1048576,
  _uuid: 'f3b892a0-456b-4e89-912a-3c5d7e8f90ab',
  _submission_time: '2026-07-31T05:30:00Z',
  _submitted_by: 'enumerator_quetta_01',
  _xform_id_string: 'ifrap_usufruct_land_rights_v2',
  respondent_name: 'Gul Khan',
  cnic: '54400-1234567-1',
  gender: 'Male',
  district: 'Quetta',
  tehsil: 'Chiltan',
  union_council: 'Hanna Valley',
  geoshape: '30.1798 66.9750 0 0; 30.1800 66.9750 0 0; 30.1800 66.9760 0 0; 30.1798 66.9760 0 0; 30.1798 66.9750 0 0'
};

const payloadData = JSON.stringify(mockPayload);

const options = {
  hostname: HOST,
  port: PORT,
  path: PATH,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payloadData),
    'User-Agent': 'KoboToolbox-Webhook/2.0'
  }
};

console.log(`[M4_ETL] Submitting mock KoboToolbox payload to http://${HOST}:${PORT}${PATH}...`);

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`[M4_ETL] Express Webhook Response Status: ${res.statusCode}`);
    console.log(`[M4_ETL] Express Webhook Response Body: ${body}`);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const responseJson = JSON.parse(body);
        if (responseJson.status === 'success') {
          console.log('[M4_ETL PASS] Payload successfully accepted and queued by Express webhook.');
          process.exit(0);
        } else {
          console.error('[M4_ETL FAIL] Express webhook returned error status:', responseJson);
          process.exit(1);
        }
      } catch (err) {
        console.error('[M4_ETL FAIL] Failed to parse response JSON:', err.message);
        process.exit(1);
      }
    } else {
      console.error(`[M4_ETL FAIL] HTTP request failed with status code ${res.statusCode}`);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('[M4_ETL FAIL] HTTP Request error:', err.message);
  process.exit(1);
});

req.write(payloadData);
req.end();
```

---

## 3. End-to-End Pipeline Verification Strategy

Verification covers all 5 pipeline layers:

| Layer | Component | Verification Procedure | Expected Outcome |
|-------|-----------|------------------------|------------------|
| 1 | Express Ingestion Server (`backend/ingest.js`) | Execute `node backend/test_payload.js` | HTTP 200 OK, `{ status: "success", message: "Payload queued" }` |
| 2 | Redis Queue (`kobo_payloads`) | Inspect Redis list using `LLEN kobo_payloads` / `LINDEX kobo_payloads 0` | Queue length increments by 1; list head matches raw JSON string |
| 3 | Python Worker (`backend/worker.py`) | Check worker stdout log | `[WORKER] Dequeued payload for respondent Gul Khan (CNIC: 54400-1234567-1)` |
| 4 | Spatial WKT Parsing | Verify WKT polygon conversion string | `POLYGON((66.9750 30.1798, 66.9750 30.1800, 66.9760 30.1800, 66.9760 30.1798, 66.9750 30.1798))` |
| 5 | PostGIS Atomic Transactions | Query database tables `la_party`, `la_spatial_unit`, `la_rrr` | 1 inserted row per table linked by primary UUID keys |

### SQL Verification Query:
```sql
SELECT 
    p.full_name, 
    p.cnic_number, 
    s.spatial_type, 
    ST_AsText(s.geom) AS geometry_wkt, 
    r.rrr_type, 
    r.approval_status
FROM la_party p
JOIN la_rrr r ON p.party_id = r.party_id
JOIN la_spatial_unit s ON s.spatial_unit_id = r.spatial_unit_id
WHERE p.cnic_number = '54400-1234567-1';
```

---

## 4. Package & Configuration Declarations

### 4.1 `package.json` Updates
Root `package.json` must contain script entries and dependencies:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "start:ingest": "node backend/ingest.js",
  "start:worker": "python backend/worker.py",
  "test": "node tests/run-tests.js",
  "test:etl": "node backend/test_payload.js"
},
"dependencies": {
  "express": "^4.21.1",
  "redis": "^4.7.0"
}
```

### 4.2 `backend/requirements.txt`
Python requirements for worker process:
```txt
redis>=4.5.0
psycopg2-binary>=2.9.0
```

---

## 5. Risk Assessment & Verification Matrix

1. **Polygon Vertex Ordering**: PostGIS requires `(longitude latitude)`. KoboToolbox provides `(latitude longitude elevation accuracy)`. The worker MUST swap 1st and 2nd elements during parsing.
2. **Polygon Closure**: `geoshape` WKT must close the ring (last coordinate identical to first coordinate).
3. **Database Connection Resiliency**: Python worker should retry DB/Redis connection on startup if containers boot asynchronously.
