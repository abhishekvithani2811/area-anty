import { useState, useEffect, useMemo, useCallback } from 'react';
import * as turf from '@turf/turf';
import MapComponent from './MapComponent';
import type { MapTileLayer } from './MapComponent';
import MeasurementHUD from './MeasurementHUD';
import SaveModal from './SaveModal';
import SavedDrawer from './SavedDrawer';
import type { AreaUnit, DistanceUnit } from '../utils/units';
import type { SavedMeasurement } from '../utils/storage';
import { getSavedMeasurements, deleteSavedMeasurement } from '../utils/storage';
import { Layers, Satellite, Navigation, Globe } from 'lucide-react';

export default function AreaCalculator() {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('acres');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('meters');
  const [tileLayer, setTileLayer] = useState<MapTileLayer>('google_hybrid');

  // Map Center
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.0225, 72.5714]); // Ahmedabad default
  const [mapZoom, setMapZoom] = useState(16);

  // Modals & Drawers
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedList, setSavedList] = useState<SavedMeasurement[]>([]);

  // Layer Switcher Dropdown
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);

  // Load saved measurements on mount
  useEffect(() => {
    setSavedList(getSavedMeasurements());
  }, []);

  // Calculate real-time Area (sq meters) & Perimeter (meters) using Turf.js
  const { areaSqMeters, perimeterMeters } = useMemo(() => {
    if (points.length < 2) return { areaSqMeters: 0, perimeterMeters: 0 };

    if (points.length === 2) {
      const from = turf.point([points[0][1], points[0][0]]);
      const to = turf.point([points[1][1], points[1][0]]);
      const dist = turf.distance(from, to, { units: 'meters' });
      return { areaSqMeters: 0, perimeterMeters: dist };
    }

    try {
      // GeoJSON polygon ring format: [[lng, lat], [lng, lat], ..., [lng, lat]]
      const closedCoords = [...points.map(([lat, lng]) => [lng, lat]), [points[0][1], points[0][0]]];
      const poly = turf.polygon([closedCoords]);
      const area = turf.area(poly);

      // Line perimeter
      const line = turf.lineString(closedCoords);
      const perim = turf.length(line, { units: 'meters' });

      return { areaSqMeters: area, perimeterMeters: perim };
    } catch (err) {
      console.error('Turf area calculation error:', err);
      return { areaSqMeters: 0, perimeterMeters: 0 };
    }
  }, [points]);

  // Point Handlers
  const handleAddPoint = useCallback((pt: [number, number]) => {
    setPoints((prev) => [...prev, pt]);
  }, []);

  const handleUpdatePoint = useCallback((index: number, newPt: [number, number]) => {
    setPoints((prev) => {
      const copy = [...prev];
      copy[index] = newPt;
      return copy;
    });
  }, []);

  const handleRemovePoint = useCallback((index: number) => {
    setPoints((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleUndoPoint = useCallback(() => {
    setPoints((prev) => prev.slice(0, -1));
  }, []);

  const handleClearPoints = useCallback(() => {
    setPoints([]);
  }, []);

  // Saved Plot Handlers
  const handleLoadPlot = useCallback((item: SavedMeasurement) => {
    setPoints(item.points);
    if (item.points.length > 0) {
      setMapCenter(item.points[0]);
      setMapZoom(17);
    }
  }, []);

  const handleDeletePlot = useCallback((id: string) => {
    const updated = deleteSavedMeasurement(id);
    setSavedList(updated);
  }, []);

  const handlePlotSaved = useCallback((saved: SavedMeasurement) => {
    setSavedList((prev) => [saved, ...prev]);
  }, []);

  // Get User Current GPS Location
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapZoom(18);
        },
        () => {
          alert('Could not access your location.');
        }
      );
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Map Layer (Rendered underneath at z-0) */}
      <MapComponent
        points={points}
        onAddPoint={handleAddPoint}
        onUpdatePoint={handleUpdatePoint}
        tileLayer={tileLayer}
        distanceUnit={distanceUnit}
        center={mapCenter}
        zoom={mapZoom}
      />

      {/* 2. Top Header Navigation (Floating at z-[9999]) */}
      <header className="absolute top-2.5 left-2.5 right-2.5 z-[9999] flex items-center justify-between gap-2 pointer-events-none">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/95 px-3 py-1.5 shadow-2xl backdrop-blur-xl">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20">
              <Globe className="h-4 w-4 font-bold" />
            </div>
            <div>
              <h1 className="text-xs font-extrabold tracking-tight text-white flex items-center gap-1">
                AreaMapping <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">PRO</span>
              </h1>
              <p className="text-[9px] text-slate-400">Satellite Land Calculator</p>
            </div>
          </div>

          <button
            onClick={handleUseCurrentLocation}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800/90 bg-slate-900/95 text-slate-300 hover:text-emerald-400 shadow-xl backdrop-blur-xl transition-colors"
            title="Locate GPS Position"
          >
            <Navigation className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Map Layer Switcher (Top Right) */}
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowLayerDropdown(!showLayerDropdown)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800/90 bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-2xl backdrop-blur-xl hover:border-slate-700 hover:text-white transition-all"
          >
            <Satellite className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Satellite Map</span>
            <Layers className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showLayerDropdown && (
            <div className="absolute right-0 top-10 z-[10000] w-48 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-2xl text-xs space-y-1">
              <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Map Imagery</div>
              <button
                onClick={() => {
                  setTileLayer('google_hybrid');
                  setShowLayerDropdown(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  tileLayer === 'google_hybrid' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Google Satellite Hybrid</span>
                {tileLayer === 'google_hybrid' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </button>

              <button
                onClick={() => {
                  setTileLayer('google_satellite');
                  setShowLayerDropdown(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  tileLayer === 'google_satellite' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Google Pure Satellite</span>
                {tileLayer === 'google_satellite' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </button>

              <button
                onClick={() => {
                  setTileLayer('esri_satellite');
                  setShowLayerDropdown(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  tileLayer === 'esri_satellite' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Esri HD World Imagery</span>
                {tileLayer === 'esri_satellite' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </button>

              <button
                onClick={() => {
                  setTileLayer('osm');
                  setShowLayerDropdown(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  tileLayer === 'osm' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>OpenStreetMap</span>
                {tileLayer === 'osm' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 3. Responsive Measurement HUD Overlay Container */}
      <div className="sm:absolute sm:top-14 sm:left-2.5 z-[9999] pointer-events-none">
        <MeasurementHUD
          areaSqMeters={areaSqMeters}
          perimeterMeters={perimeterMeters}
          points={points}
          areaUnit={areaUnit}
          distanceUnit={distanceUnit}
          onAreaUnitChange={setAreaUnit}
          onDistanceUnitChange={setDistanceUnit}
          onClearPoints={handleClearPoints}
          onUndoPoint={handleUndoPoint}
          onRemovePoint={handleRemovePoint}
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
          onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
          savedCount={savedList.length}
        />
      </div>

      {/* 4. Save Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        points={points}
        areaSqMeters={areaSqMeters}
        perimeterMeters={perimeterMeters}
        areaUnit={areaUnit}
        distanceUnit={distanceUnit}
        onSaved={handlePlotSaved}
      />

      {/* 5. Saved Plots Drawer */}
      <SavedDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedList={savedList}
        onLoadPlot={handleLoadPlot}
        onDeletePlot={handleDeletePlot}
        areaUnit={areaUnit}
      />
    </div>
  );
}
