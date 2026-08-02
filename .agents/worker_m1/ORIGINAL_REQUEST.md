## 2026-07-31T01:15:43Z

You are Worker M1 for the Anthropology Portfolio frontend refactoring project.
Working Directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m1
Project Directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio

Task: Implement Milestone 1 - GIS Visualization Enhancements & GeoServer Vector Tile Integration.
Refer to Explorer 1 findings at `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_1\analysis.md`.

Requirements:
1. Update `components/DecolonialMap.tsx` to include an import reference to `"mapbox-gl"` (e.g., `import type mapboxgl from 'mapbox-gl';` or `import 'mapbox-gl';`) alongside `react-map-gl/maplibre` so that E2E test `TC-T1-F2-02` passes while retaining MapLibre GL JS vector rendering.
2. Refactor `components/DecolonialMap.tsx` to integrate GeoServer vector tile sources (`<Source id="geoserver-vector" type="vector" tiles={["http://localhost:8080/geoserver/ifrap/wms?service=WMS&version=1.1.0&request=GetMap&layers=ifrap:spatial_layers&styles=&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857&format=application/vnd.mapbox-vector-tile"]} />`).
3. Implement interactive toggleable spatial layers with state management (`SpatialLayerVisibility`):
   - Historical 2022 flood extents (`flood_extents_2022`)
   - Active river basin buffer zones (`river_basin_buffers`)
   - Infrastructure reconstruction sites (`reconstruction_sites`)
   - Land parcel tenure status (`parcel_tenure_status`)
4. Include GeoJSON mock fallback layer datasets in `lib/map-data.ts` for offline/mock map rendering so map layers display beautifully even when an external GeoServer is offline.
5. Provide a glassmorphic layer control widget on the map allowing users to toggle each of the 4 spatial layers on/off.
6. Verify your implementation by running `node tests/run-tests.js` and `npm run build`.
