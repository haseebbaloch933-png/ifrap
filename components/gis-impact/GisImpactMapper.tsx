'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GlassCard } from '@/components/GlassCard';
import { useAnimateIn } from '@/hooks/useAnimateIn';
import { BALOCHISTAN_DISTRICTS } from '@/lib/districts';
import type { GrmTicket } from '@/components/grm/GrmTicketingCenter';
import {
  Layers,
  MapPin,
  Eye,
  EyeOff,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  Info,
  Shield,
  AlertTriangle,
  FileText,
  Compass,
  Zap,
  Sliders,
  ChevronRight
} from 'lucide-react';

export interface SpatialFeature {
  id: string;
  name: string;
  district: string;
  riverBasin: string;
  layerCategory: 'FLOOD_EXTENT' | 'RIVER_BUFFER' | 'INFRASTRUCTURE' | 'LAND_TENURE' | 'RISK_HOTSPOT';
  usufructStatus: 'VERIFIED' | 'IN_DISPUTE' | 'PENDING_REGISTRATION';
  floodImpact: 'HIGH' | 'MODERATE' | 'MINOR' | 'NONE';
  essAlignment: string;
  lat: number;
  lng: number;
  karezName?: string;
  notes: string;
}

const mockSpatialFeatures: SpatialFeature[] = [
  {
    id: 'SP-2026-101',
    name: 'Karez Chashma Mirab Headwork',
    district: 'Mastung',
    riverBasin: 'Nari River Basin',
    layerCategory: 'INFRASTRUCTURE',
    usufructStatus: 'VERIFIED',
    floodImpact: 'HIGH',
    essAlignment: 'ESS1 Risk Assessment • ESS8 Cultural Heritage',
    lat: 29.7985,
    lng: 66.8452,
    karezName: 'Karez Chashma Mirab',
    notes: 'Ancient 400-year stone aqueduct intake headwork under active structural rehabilitation.',
  },
  {
    id: 'SP-2026-102',
    name: 'Pringabad 2022 Flood Inundation Zone',
    district: 'Mastung',
    riverBasin: 'Nari River Basin',
    layerCategory: 'FLOOD_EXTENT',
    usufructStatus: 'IN_DISPUTE',
    floodImpact: 'HIGH',
    essAlignment: 'ESS5 Land Resettlement • ESS3 Resource Efficiency',
    lat: 29.8150,
    lng: 66.8210,
    karezName: 'Karez Pringabad',
    notes: '2022 flood deposit covered 120 hectares of customary agriculture usufruct parcels.',
  },
  {
    id: 'SP-2026-103',
    name: 'Kawas Karez 500m Buffer Zone',
    district: 'Ziarat',
    riverBasin: 'Pishin Lora Basin',
    layerCategory: 'RIVER_BUFFER',
    usufructStatus: 'VERIFIED',
    floodImpact: 'MODERATE',
    essAlignment: 'ESS6 Biodiversity Conservation • ESS7 Indigenous Peoples',
    lat: 30.3811,
    lng: 67.7264,
    karezName: 'Kawas Karez',
    notes: 'Riparian buffer protected from heavy machinery excavation to prevent aquifer collapse.',
  },
  {
    id: 'SP-2026-104',
    name: 'Yaro Water Allocation Dispute Hotspot',
    district: 'Pishin',
    riverBasin: 'Pishin Lora Basin',
    layerCategory: 'RISK_HOTSPOT',
    usufructStatus: 'IN_DISPUTE',
    floodImpact: 'HIGH',
    essAlignment: 'ESS10 Stakeholder Engagement • ESS5 Land Rights',
    lat: 30.5833,
    lng: 66.9833,
    karezName: 'Karez Yaro',
    notes: 'High safeguard risk hotspot due to downstream water turn disputes between Tarain & Kakar clans.',
  },
  {
    id: 'SP-2026-105',
    name: 'Kuchlak Customary Usufruct Parcel B4',
    district: 'Quetta',
    riverBasin: 'Quetta Valley Sub-basin',
    layerCategory: 'LAND_TENURE',
    usufructStatus: 'VERIFIED',
    floodImpact: 'MINOR',
    essAlignment: 'ESS5 Customary Tenure Ledger',
    lat: 30.3725,
    lng: 66.9588,
    karezName: 'Karez Kuchlak',
    notes: 'Registered in Digital Usufruct Ledger; 45 family beneficiary households mapped.',
  },
];

export function GisImpactMapper() {
  const animated = useAnimateIn(100);
  const [features, setFeatures] = useState<SpatialFeature[]>(mockSpatialFeatures);
  const [selectedFeature, setSelectedFeature] = useState<SpatialFeature | null>(mockSpatialFeatures[0]);
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Layer visibility toggles
  const [layerVisibility, setLayerVisibility] = useState({
    FLOOD_EXTENT: true,
    RIVER_BUFFER: true,
    INFRASTRUCTURE: true,
    LAND_TENURE: true,
    RISK_HOTSPOT: true,
  });

  // Base map style — real CARTO basemaps (already allow-listed in the CSP).
  const [mapStyle, setMapStyle] = useState<'DARK' | 'LIGHT' | 'STREETS'>('DARK');
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<MapRef | null>(null);

  // Real GRM ticket queue (same source GrmTicketingCenter reads), used below
  // to compute genuine active-ticket counts per district instead of the
  // static per-feature numbers this page used to invent.
  const [grmTickets, setGrmTickets] = useState<GrmTicket[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/grm')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && Array.isArray(d.tickets)) setGrmTickets(d.tickets as GrmTicket[]);
      })
      .catch(() => {
        /* leave empty when offline — counts show 0 rather than a stale guess */
      });
    return () => {
      active = false;
    };
  }, []);

  const activeGrmCountByDistrict = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ticket of grmTickets) {
      if (ticket.status === 'RESOLVED') continue;
      counts[ticket.district] = (counts[ticket.district] ?? 0) + 1;
    }
    return counts;
  }, [grmTickets]);

  const BASEMAP_STYLES: Record<'DARK' | 'LIGHT' | 'STREETS', string> = {
    DARK: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    LIGHT: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    STREETS: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  };

  // Layer category → marker fill; mirrors the legend/badge colors.
  const MARKER_COLOR: Record<SpatialFeature['layerCategory'], string> = {
    FLOOD_EXTENT: '#22d3ee',
    RIVER_BUFFER: '#3b82f6',
    INFRASTRUCTURE: '#10b981',
    LAND_TENURE: '#f59e0b',
    RISK_HOTSPOT: '#f43f5e',
  };

  const toggleLayer = (layerKey: keyof typeof layerVisibility) => {
    setLayerVisibility((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Select a feature and ease the map to its coordinates.
  const focusFeature = (feat: SpatialFeature) => {
    setSelectedFeature(feat);
    mapRef.current?.flyTo({ center: [feat.lng, feat.lat], zoom: 10, duration: 900 });
  };

  const filteredFeatures = features.filter((feat) => {
    const matchesLayer = layerVisibility[feat.layerCategory];
    const matchesDistrict = districtFilter === 'ALL' || feat.district === districtFilter;
    const matchesSearch = feat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          feat.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (feat.karezName && feat.karezName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLayer && matchesDistrict && matchesSearch;
  });

  const getLayerColor = (cat: SpatialFeature['layerCategory']) => {
    switch (cat) {
      case 'FLOOD_EXTENT': return 'bg-cyan-500 text-cyan-200 border-cyan-400';
      case 'RIVER_BUFFER': return 'bg-blue-500 text-blue-200 border-blue-400';
      case 'INFRASTRUCTURE': return 'bg-emerald-500 text-emerald-200 border-emerald-400';
      case 'LAND_TENURE': return 'bg-amber-500 text-amber-200 border-amber-400';
      case 'RISK_HOTSPOT': return 'bg-rose-500 text-rose-200 border-rose-400 animate-pulse';
    }
  };

  const getLayerBadgeText = (cat: SpatialFeature['layerCategory']) => {
    switch (cat) {
      case 'FLOOD_EXTENT': return '2022 Flood Extent';
      case 'RIVER_BUFFER': return 'River/Karez Buffer Zone';
      case 'INFRASTRUCTURE': return 'Reconstruction Civil Site';
      case 'LAND_TENURE': return 'Land Usufruct Rights';
      case 'RISK_HOTSPOT': return 'ESF Safeguard Hotspot';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-2 sm:px-0">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
              DECENTRALIZED WEBGIS PIPELINE
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
              SPATIAL IMPACT ENGINE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            GIS Impact <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">Mapper</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            World Bank IFRAP Programme WebGIS: 2022 Flood Extents, Karez Buffers, Infrastructure Sites & ESF Risk Hotspots
          </p>
        </div>

        {/* District Filter & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Karez or Site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
            />
          </div>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="ALL">All Districts</option>
            {BALOCHISTAN_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Grid: Layer Controller (Left) + Interactive Map & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Layer Controls Panel (1 Col) */}
        <GlassCard className="p-5 lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              Spatial Layers Toggle
            </h2>
            <div className="space-y-2">
              {[
                { key: 'FLOOD_EXTENT', label: '2022 Flood Extents', color: 'border-cyan-400 bg-cyan-500/20 text-cyan-300' },
                { key: 'RIVER_BUFFER', label: 'River & Karez Buffers', color: 'border-blue-400 bg-blue-500/20 text-blue-300' },
                { key: 'INFRASTRUCTURE', label: 'Civil Works Sites', color: 'border-emerald-400 bg-emerald-500/20 text-emerald-300' },
                { key: 'LAND_TENURE', label: 'Land Usufruct Rights', color: 'border-amber-400 bg-amber-500/20 text-amber-300' },
                { key: 'RISK_HOTSPOT', label: 'ESF Risk Hotspots', color: 'border-rose-400 bg-rose-500/20 text-rose-300' },
              ].map((layer) => {
                const isVisible = layerVisibility[layer.key as keyof typeof layerVisibility];
                return (
                  <button
                    key={layer.key}
                    onClick={() => toggleLayer(layer.key as keyof typeof layerVisibility)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isVisible
                        ? `${layer.color} shadow-sm`
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${layer.color.split(' ')[1]}`} />
                      {layer.label}
                    </span>
                    {isVisible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Base Map Selector */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Base Map Style</h3>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['DARK', 'LIGHT', 'STREETS'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setMapStyle(style)}
                  className={`py-1.5 font-mono text-[10px] rounded-lg transition-all ${
                    mapStyle === style
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Spatial Legend Key */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h3 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Balochistan Karez Legend
            </h3>
            <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> 2022 Flood Polygon
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> 500m Aqueduct Buffer
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Intake Headworks
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Usufruct Parcel
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" /> Safeguard Dispute
              </div>
            </div>
          </div>
        </GlassCard>

        {/* WebGIS Map Container (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          <GlassCard className="p-0 overflow-hidden relative border-cyan-500/30">
            
            {/* Real MapLibre GL JS canvas over a CARTO basemap (CSP allow-listed) */}
            <div className="w-full h-[480px] bg-slate-950 relative overflow-hidden">
              {mapError ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                  <p className="text-sm font-semibold text-rose-300">Basemap failed to load.</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    MapLibre tiles could not be reached. Feature details remain available in the inspector below.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMapError(false)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <Map
                  ref={mapRef}
                  mapLib={maplibregl as any}
                  initialViewState={{ longitude: 66.99, latitude: 30.1, zoom: 6.6 }}
                  mapStyle={BASEMAP_STYLES[mapStyle]}
                  onError={(e) => {
                    console.error('MapLibre GL Error:', e);
                    setMapError(true);
                  }}
                  style={{ width: '100%', height: '100%' }}
                  attributionControl={false}
                >
                  <NavigationControl position="top-right" showCompass={false} />
                  {filteredFeatures.map((feat) => {
                    const isSelected = selectedFeature?.id === feat.id;
                    return (
                      <Marker key={feat.id} longitude={feat.lng} latitude={feat.lat} anchor="center">
                        <button
                          type="button"
                          aria-label={feat.name}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            focusFeature(feat);
                          }}
                          className="block cursor-pointer"
                        >
                          <span
                            className={`block rounded-full border-2 border-white/80 shadow-lg transition-transform ${
                              isSelected ? 'w-5 h-5 ring-4 ring-cyan-400/40' : 'w-3.5 h-3.5 hover:scale-125'
                            } ${feat.layerCategory === 'RISK_HOTSPOT' ? 'animate-pulse' : ''}`}
                            style={{ backgroundColor: MARKER_COLOR[feat.layerCategory] }}
                          />
                        </button>
                      </Marker>
                    );
                  })}
                </Map>
              )}

              {/* Map Title Overlay — now labels a genuine MapLibre GL JS canvas */}
              <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-xs pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white font-mono">MAPLIBRE GL JS • WEBGIS SPATIAL VIEW</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Coordinate Frame: EPSG:4326 (WGS84) • {filteredFeatures.length} feature(s) shown
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Spatial Feature Detail Drawer / Inspection Card */}
          {selectedFeature && (
            <GlassCard className="p-6 border-cyan-500/40 bg-slate-900/90 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs border bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      {selectedFeature.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-xs border ${getLayerColor(selectedFeature.layerCategory)}`}>
                      {getLayerBadgeText(selectedFeature.layerCategory)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">{selectedFeature.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 font-mono text-xs rounded-lg border border-slate-700">
                    {selectedFeature.district} District
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Spatial Unit Ethnographic Notes:</span>
                    <p className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-slate-200 leading-relaxed">
                      {selectedFeature.notes}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">World Bank ESS Framework Alignment:</span>
                    <p className="bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20 text-cyan-300 font-mono">
                      {selectedFeature.essAlignment}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">River Basin Sub-system:</span>
                    <span className="font-semibold text-white">{selectedFeature.riverBasin}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">Customary Usufruct Tenure:</span>
                    <span className={`font-bold font-mono ${selectedFeature.usufructStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedFeature.usufructStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">2022 Flood Impact Severity:</span>
                    <span className="font-bold text-cyan-300 font-mono">{selectedFeature.floodImpact}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Linked Active GRM Tickets:</span>
                    <span className="font-bold text-rose-400 font-mono text-sm">{activeGrmCountByDistrict[selectedFeature.district] ?? 0} Tickets</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
