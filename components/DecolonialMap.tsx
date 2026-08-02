'use client';

import React, { useState } from 'react';
import Map, { Source, Layer, MapProvider } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import { getLocationsGeoJSON, getRoutesGeoJSON } from '@/lib/map-data';
import { useI18n } from '@/lib/i18n-context';

export interface DecolonialMapProps {
  initialCenter?: [number, number];
  zoom?: number;
}

export function DecolonialMap({
  initialCenter = [66.975, 30.1798],
  zoom = 9,
}: DecolonialMapProps) {
  const { t } = useI18n();
  const [activeLayer, setActiveLayer] = useState<'Technocratic Standard' | 'Decolonial ITK Layer'>('Decolonial ITK Layer');
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [mapError, setMapError] = useState<boolean>(false);

  // Safely handle boundary condition for empty routes
  const safeRoutesGeoJSON = () => {
    const raw = getRoutesGeoJSON();
    if (!raw || !Array.isArray(raw.features) || raw.features.length === 0) {
      return { type: 'FeatureCollection' as const, features: [] };
    }
    const validFeatures = raw.features.filter(
      (f: any) => f && f.geometry && Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length > 0
    );
    return { type: 'FeatureCollection' as const, features: validFeatures };
  };

  const mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  const locationsData = getLocationsGeoJSON();
  const routesData = safeRoutesGeoJSON();

  const handleLayerClick = (e: any) => {
    if (e.features && e.features.length > 0) {
      setSelectedFeature(e.features[0].properties);
    }
  };

  if (mapError) {
    return (
      <div className="relative w-full h-[600px] rounded-sm flex items-center justify-center bg-slate-900 border border-red-500 shadow-wb-card text-red-400 p-6 text-center">
        <div>
          <h3 className="text-xl font-bold mb-2">Map Loading Error</h3>
          <p>Failed to load the WebGIS MapLibre instance or basemap style.</p>
          <button onClick={() => setMapError(false)} className="mt-4 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-sm overflow-hidden border border-slate-300 shadow-wb-card bg-slate-50" aria-label={t.map?.subtitle || 'Map'}>
      <Map
        mapLib={maplibregl as any}
        initialViewState={{
          longitude: initialCenter[0],
          latitude: initialCenter[1],
          zoom: Math.min(Math.max(zoom, 0), 24)
        }}
        mapStyle={mapStyle}
        interactiveLayerIds={['technocratic-layer', 'decolonial-layer', 'route-karez-lines']}
        onClick={handleLayerClick}
        onError={(e) => {
          console.error('MapLibre GL Error:', e);
          setMapError(true);
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Source id="balochistan-locations" type="geojson" data={locationsData}>
          {activeLayer === 'Technocratic Standard' && (
            <Layer 
              id="technocratic-layer"
              type="circle"
              paint={{
                'circle-radius': 8,
                'circle-color': '#0284c7',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
              }}
            />
          )}
          {activeLayer === 'Decolonial ITK Layer' && (
            <Layer 
              id="decolonial-layer"
              type="circle"
              paint={{
                'circle-radius': 10,
                'circle-color': '#10b981',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#06b6d4',
              }}
            />
          )}
        </Source>
        
        <Source id="balochistan-routes" type="geojson" data={routesData}>
          <Layer 
            id="route-karez-lines"
            type="line"
            paint={{
              'line-color': '#06b6d4',
              'line-width': 3,
              'line-dasharray': [2, 2],
            }}
          />
        </Source>
      </Map>

      {/* Flat Institutional Control Overlay Panel */}
      <div className="absolute top-4 left-4 z-10 p-4 rounded-sm bg-white border border-slate-300 shadow-md max-w-sm space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{t.map?.title || 'Map'}</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            MapLibre GL JS
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-600 font-semibold uppercase">{t.map?.layerControl || 'Layer Control'}</label>
          <div role="tablist" aria-label={t.map?.layerControl || 'Layer Control'} className="flex gap-2">
            <button
              role="tab"
              aria-selected={activeLayer === 'Technocratic Standard'}
              onClick={() => setActiveLayer('Technocratic Standard')}
              className={`flex-1 py-1.5 px-2 rounded-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeLayer === 'Technocratic Standard'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {t.map?.technocratic || 'Technocratic'}
            </button>
            <button
              role="tab"
              aria-selected={activeLayer === 'Decolonial ITK Layer'}
              onClick={() => setActiveLayer('Decolonial ITK Layer')}
              className={`flex-1 py-1.5 px-2 rounded-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeLayer === 'Decolonial ITK Layer'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {t.map?.decolonial || 'Decolonial ITK'}
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 space-y-1 border-t border-slate-200 pt-2">
          <div>{t.map?.center || 'Center'}: <span className="font-mono text-slate-800">[{initialCenter[0]}, {initialCenter[1]}]</span></div>
          <div>{t.map?.zoomLevel || 'Zoom'}: <span className="font-mono text-slate-800">{zoom}</span></div>
          <div>{t.map?.activeLayer || 'Active Layer'}: <span className="font-semibold text-blue-700">{activeLayer}</span></div>
        </div>

        {selectedFeature && (
          <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 space-y-1.5 mt-2" aria-live="polite">
            <div className="font-bold text-blue-700 text-sm">{selectedFeature.name}</div>
            <div className="text-[11px] text-slate-600 italic">{selectedFeature.indigenousName}</div>
            <div className="text-[10px] text-slate-700">
              {activeLayer === 'Decolonial ITK Layer'
                ? selectedFeature.customaryWaterRights || selectedFeature.anthropologicalNotes
                : selectedFeature.topDownAnnotation || selectedFeature.stateId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
