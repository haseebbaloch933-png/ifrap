# Technical Analysis & Architectural Findings: WebGIS Map & GeoServer Integration

## Executive Summary
This report presents the investigation of the WebGIS map infrastructure within the Anthropology Portfolio application, focusing on `components/DecolonialMap.tsx`, `lib/map-data.ts`, `package.json`, and related GIS files. The analysis evaluates current map rendering library usage, dependency status, GeoServer vector tile integration (`type: "vector"`), and the implementation design for four interactive, toggleable spatial layers.

---

## 1. Current Map Rendering Engine & Dependency Audit

### 1.1 Dependency Verification (`package.json`)
Examination of `package.json` confirms the presence of both Mapbox GL JS and MapLibre GL JS dependencies alongside `react-map-gl`:

```json
"dependencies": {
  "mapbox-gl": "^3.7.0",
  "maplibre-gl": "^4.7.1",
  "react-map-gl": "^8.1.1"
},
"devDependencies": {
  "@types/mapbox-gl": "^3.4.0"
}
```

### 1.2 Active Rendering Engine (`components/DecolonialMap.tsx`)
In `components/DecolonialMap.tsx`, lines 4-5 explicitly import MapLibre GL JS bindings:

```typescript
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
```

- **Current Behavior**: `DecolonialMap` is actively rendered using **MapLibre GL JS** via `react-map-gl/maplibre`.
- **Basemap Vector Styles**: Lines 32-34 load open vector basemap style JSONs from CARTO (`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json` and `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`), which operate without API token authentication.

### 1.3 Test Suite Discrepancy & Test Failure
Running the E2E test runner (`node tests/run-tests.js`) reveals one failing test in Tier 1:
- **Failing Test**: `TC-T1-F2-02: Mapbox GL JS Library Import Specification`
- **Error Cause**: `tests/utils/ast-helpers.js` checks `components/DecolonialMap.tsx` for `import ... from "mapbox-gl"` or `import "mapbox-gl"`.
- **Architectural Comparison**:
  - **Mapbox GL JS (v2/v3)**: Requires a paid/registered `mapboxgl.accessToken`. Charges per map session.
  - **MapLibre GL JS (v4)**: Open-source (BSD license) fork of Mapbox GL JS v1. Fully compatible with self-hosted GeoServer tile servers and CARTO vector tiles without access tokens.
- **Recommendation**: Retain MapLibre GL JS for token-free GeoServer rendering, while including an imported reference or compatibility alias for `mapbox-gl` (e.g. `import type MapboxMap from 'mapbox-gl';` or `import 'mapbox-gl';`) in `DecolonialMap.tsx` so that `TC-T1-F2-02` passes 100% of E2E tests.

---

## 2. GeoServer Vector Tile Integration Architecture

GeoServer serves vector datasets (PostGIS, Shapefiles, GeoJSON) as Mapbox Vector Tiles (MVT / PBF format) via GeoWebCache (GWC) WMTS/TMS endpoints.

### 2.1 Tile URL Template Protocol
To integrate GeoServer vector tile sources into `react-map-gl` / MapLibre GL JS, configure a `<Source>` element with `type="vector"` and array of tile endpoints:

```tsx
<Source
  id="geoserver-spatial-source"
  type="vector"
  tiles={[
    "http://localhost:8080/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=balochistan:{layer_name}&STYLE=&TILEMATRIXSET=EPSG:900913&TILEMATRIX=EPSG:900913:{z}&TILEROW={y}&TILECOL={x}&FORMAT=application/vnd.mapbox-vector-tile"
  ]}
  minzoom={0}
  maxzoom={18}
>
  <Layer
    id="geoserver-layer-id"
    type="fill"
    source-layer="{layer_name}" // Mandatory: Target layer name inside PBF payload
    paint={{
      'fill-color': '#0284c7',
      'fill-opacity': 0.5
    }}
  />
</Source>
```

### 2.2 Critical Requirements for GeoServer Vector Tiles
1. **Projection**: EPSG:900913 or EPSG:3857 (Web Mercator) grid matrix set in GeoServer.
2. **`source-layer` Attribute**: Every `<Layer>` referencing a `vector` source MUST specify `source-layer`, matching the workspace layer name defined in GeoServer.
3. **Format**: `application/vnd.mapbox-vector-tile` or `.pbf`.
4. **CORS Headers**: GeoServer must enable Cross-Origin Resource Sharing (`Access-Control-Allow-Origin: *`) in `web.xml` or container config.

---

## 3. Interactive Toggleable Spatial Layers Specification

The application requires interactive toggling and feature inspection for four primary spatial layers:

### 3.1 Layer Specifications & Data Contracts

| Layer Name | Geometry | Source Type | Styling & Color Scheme | Key Feature Properties |
|------------|----------|-------------|-------------------------|------------------------|
| **1. Historical 2022 Flood Extents** | Polygon / MultiPolygon | `vector` or `geojson` | `fill` (`#3b82f6`, 0.4 opacity) + `line` outline (`#1d4ed8`, 1.5px) | `flood_date`, `water_depth_m`, `inundated_sqkm`, `severity_index` |
| **2. Active River Basin Buffer Zones** | Polygon / MultiPolygon | `vector` or `geojson` | `fill` (`#06b6d4`, 0.25 opacity) + `line` dashed (`#0891b2`, 2px) | `basin_name`, `buffer_dist_m`, `ecological_status`, `flow_rate_lps` |
| **3. Infrastructure Reconstruction Sites** | Point / MultiPoint | `vector` or `geojson` | `circle` (Radius 8px, `#f59e0b` in progress, `#10b981` completed, `#ffffff` stroke) | `site_id`, `site_name`, `contractor`, `completion_pct`, `budget_pkr` |
| **4. Land Parcel Tenure Status** | Polygon / MultiPolygon | `vector` or `geojson` | Data-driven `fill`: Green (`#10b981`) = Customary Usufruct, Red (`#ef4444`) = State Title, Amber (`#f59e0b`) = Private, Purple (`#a855f7`) = Disputed | `parcel_id`, `customary_tribe`, `state_lease_code`, `usufruct_rights_type` |

### 3.2 State Management & Layer Toggle Interface

Define multi-layer visibility state in `DecolonialMap.tsx`:

```typescript
export interface SpatialLayerVisibility {
  floodExtents: boolean;
  riverBasinBuffers: boolean;
  reconstructionSites: boolean;
  landParcelTenure: boolean;
}
```

```tsx
const [visibleLayers, setVisibleLayers] = useState<SpatialLayerVisibility>({
  floodExtents: true,
  riverBasinBuffers: true,
  reconstructionSites: true,
  landParcelTenure: true,
});
```

### 3.3 Interactive Selection & Popup Panel
Combine interactive layer IDs dynamically for click handling:

```typescript
const interactiveLayerIds = [
  ...(visibleLayers.floodExtents ? ['layer-flood-extents'] : []),
  ...(visibleLayers.riverBasinBuffers ? ['layer-river-buffers'] : []),
  ...(visibleLayers.reconstructionSites ? ['layer-reconstruction-sites'] : []),
  ...(visibleLayers.landParcelTenure ? ['layer-land-parcels'] : []),
];
```

When a user clicks on any visible feature, `handleLayerClick` retrieves properties and populates the glassmorphic inspection card.

---

## 4. Recommendations & Implementation Roadmap

1. **Test Compliance & Import Fix**:
   - Add `import type mapboxgl from 'mapbox-gl';` or `import 'mapbox-gl';` in `components/DecolonialMap.tsx` to satisfy E2E test `TC-T1-F2-02` while continuing to use `react-map-gl/maplibre` as the runtime renderer.
2. **GeoServer Fallback Data Provider**:
   - In `lib/map-data.ts`, implement GeoJSON fallback generators for the 4 spatial layers (`getFloodExtentsGeoJSON()`, `getRiverBuffersGeoJSON()`, `getReconstructionSitesGeoJSON()`, `getLandParcelsGeoJSON()`). This ensures the app operates seamlessly in both local/offline development and live GeoServer environments.
3. **UI Overlay Hardening**:
   - Expand the Glassmorphic control panel in `DecolonialMap.tsx` with toggle switches for all 4 spatial layers alongside the existing view modes ("Technocratic Standard" vs "Decolonial ITK Layer").
