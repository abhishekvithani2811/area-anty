import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import type { DistanceUnit } from '../utils/units';
import { convertDistance, formatDistanceValue, getDistanceUnitMeta } from '../utils/units';
import 'leaflet/dist/leaflet.css';

export type MapTileLayer = 'google_hybrid' | 'google_satellite' | 'esri_satellite' | 'osm';

interface MapComponentProps {
  points: [number, number][];
  onAddPoint: (point: [number, number]) => void;
  onUpdatePoint: (index: number, newPoint: [number, number]) => void;
  tileLayer: MapTileLayer;
  distanceUnit: DistanceUnit;
  center?: [number, number];
  zoom?: number;
}

// Custom Leaflet DivIcon for glowing numbered point markers (Compact 20px size)
function createNumberedMarkerIcon(index: number) {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div class="marker-pin"><span class="marker-number">${index + 1}</span></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Click Handler Component inside Leaflet Map
function MapClickHandler({ onAddPoint }: { onAddPoint: (pt: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Center view updater when search or preset changes
function MapViewUpdater({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 16, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export const MAP_TILES: Record<MapTileLayer, { url: string; attribution: string; subdomains?: string[] }> = {
  google_hybrid: {
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Hybrid Satellite',
  },
  google_satellite: {
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite',
  },
  esri_satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

export default function MapComponent({
  points,
  onAddPoint,
  onUpdatePoint,
  tileLayer,
  distanceUnit,
  center = [23.0225, 72.5714], // Default center: Ahmedabad / Gujarat India
  zoom = 16,
}: MapComponentProps) {
  // Calculate edge segment midpoints and lengths for tooltips
  const segments = useMemo(() => {
    if (points.length < 2) return [];

    const result = [];
    const count = points.length;

    for (let i = 0; i < count; i++) {
      // Connect last point back to first if points >= 3 to close polygon
      if (i === count - 1 && count < 3) continue;

      const p1 = points[i];
      const p2 = points[(i + 1) % count];

      const from = turf.point([p1[1], p1[0]]);
      const to = turf.point([p2[1], p2[0]]);
      const distMeters = turf.distance(from, to, { units: 'meters' });
      const midLat = (p1[0] + p2[0]) / 2;
      const midLng = (p1[1] + p2[1]) / 2;

      const convertedDist = convertDistance(distMeters, distanceUnit);
      const unitMeta = getDistanceUnitMeta(distanceUnit);

      result.push({
        id: `seg_${i}_${(i + 1) % count}`,
        mid: [midLat, midLng] as [number, number],
        label: `${formatDistanceValue(convertedDist)} ${unitMeta.shortLabel}`,
      });
    }

    return result;
  }, [points, distanceUnit]);

  const tileConfig = MAP_TILES[tileLayer] || MAP_TILES.google_hybrid;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full z-0 bg-slate-950"
        zoomControl={false}
      >
        <TileLayer
          key={tileLayer}
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          maxZoom={21}
          maxNativeZoom={19}
        />

        <MapClickHandler onAddPoint={onAddPoint} />
        <MapViewUpdater center={center} zoom={zoom} />

        {/* Closed Polygon when 3 or more points exist */}
        {points.length >= 3 && (
          <Polygon
            positions={points}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.3,
              weight: 2.5,
              dashArray: '',
            }}
          />
        )}

        {/* Polyline line connecting points when only 2 points */}
        {points.length === 2 && (
          <Polyline
            positions={points}
            pathOptions={{
              color: '#34d399',
              weight: 2.5,
              dashArray: '5, 5',
            }}
          />
        )}

        {/* Draggable Markers for Vertices */}
        {points.map((pt, idx) => (
          <Marker
            key={`marker_${idx}_${pt[0]}_${pt[1]}`}
            position={pt}
            icon={createNumberedMarkerIcon(idx)}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const newLatLng = marker.getLatLng();
                onUpdatePoint(idx, [newLatLng.lat, newLatLng.lng]);
              },
            }}
          />
        ))}

        {/* Segment Distance Tooltips */}
        {segments.map((seg) => (
          <Marker
            key={seg.id}
            position={seg.mid}
            icon={L.divIcon({
              className: 'segment-tooltip-icon',
              html: `<div class="segment-pill">${seg.label}</div>`,
              iconAnchor: [25, 10],
            })}
            interactive={false}
          />
        ))}
      </MapContainer>
    </div>
  );
}
