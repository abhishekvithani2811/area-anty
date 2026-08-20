import { useState } from 'react';
import type { AreaUnit, DistanceUnit } from '../utils/units';
import {
  convertArea,
  convertDistance,
  formatAreaValue,
  formatDistanceValue,
  getAllAreaConversions,
  getAreaUnitMeta,
  getDistanceUnitMeta,
} from '../utils/units';
import {
  Layers,
  Trash2,
  Undo2,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  Ruler,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface MeasurementHUDProps {
  areaSqMeters: number;
  perimeterMeters: number;
  points: [number, number][];
  areaUnit: AreaUnit;
  distanceUnit: DistanceUnit;
  onAreaUnitChange: (unit: AreaUnit) => void;
  onDistanceUnitChange: (unit: DistanceUnit) => void;
  onClearPoints: () => void;
  onUndoPoint: () => void;
  onRemovePoint: (index: number) => void;
  onOpenSaveModal: () => void;
  onOpenSavedDrawer: () => void;
  savedCount: number;
}

export default function MeasurementHUD({
  areaSqMeters,
  perimeterMeters,
  points,
  areaUnit,
  distanceUnit,
  onAreaUnitChange,
  onDistanceUnitChange,
  onClearPoints,
  onUndoPoint,
  onRemovePoint,
  onOpenSaveModal,
  onOpenSavedDrawer,
  savedCount,
}: MeasurementHUDProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showPointsList, setShowPointsList] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const convertedArea = convertArea(areaSqMeters, areaUnit);
  const areaMeta = getAreaUnitMeta(areaUnit);

  const convertedPerimeter = convertDistance(perimeterMeters, distanceUnit);
  const distMeta = getDistanceUnitMeta(distanceUnit);

  const conversions = getAllAreaConversions(areaSqMeters);

  return (
    <div className="w-full max-w-sm sm:max-w-xs md:max-w-sm transition-all duration-300">
      {/* HUD Container Card */}
      <div className="hud-card rounded-2xl border border-slate-800/90 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl text-slate-100 transition-all duration-300">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Ruler className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-200 tracking-tight">Field Measurement</h2>
              <p className="text-[10px] text-slate-400">
                {points.length === 0 && 'Click map to measure area'}
                {points.length === 1 && '1 point • Click 2nd point'}
                {points.length === 2 && '2 points • Click 3rd to close'}
                {points.length >= 3 && `${points.length} points • Polygon active`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSavedDrawer}
              className="relative flex items-center gap-1 rounded-lg bg-slate-800/90 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="View Saved Measurements"
            >
              <Layers className="h-3 w-3 text-emerald-400" />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="ml-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-extrabold text-slate-950">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Mobile Expand / Collapse Toggle Button */}
            <button
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              className="sm:hidden flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title={isMobileExpanded ? 'Minimize HUD' : 'Expand HUD'}
            >
              {isMobileExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Primary Metrics (Area & Perimeter Boxes) */}
        <div className={`mt-2.5 grid grid-cols-2 gap-2 ${!isMobileExpanded ? 'block sm:grid' : ''}`}>
          {/* Area Metric */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Area</span>
              <select
                value={areaUnit}
                onChange={(e) => onAreaUnitChange(e.target.value as AreaUnit)}
                className="rounded bg-slate-800/90 px-1 py-0.5 text-[10px] font-semibold text-emerald-400 outline-none border border-slate-700 hover:border-emerald-500/50 cursor-pointer"
              >
                <option value="acres">Acres (ac)</option>
                <option value="hectares">Hectares (ha)</option>
                <option value="sq_meters">Sq Meters (m²)</option>
                <option value="sq_feet">Sq Feet (sq ft)</option>
                <option value="sq_yards">Sq Yards (sq yd)</option>
                <option value="bigha">Bigha</option>
                <option value="guntha">Guntha</option>
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
              </select>
            </div>
            <div className="mt-1">
              <div className="text-lg font-extrabold text-emerald-400 tracking-tight leading-none">
                {points.length >= 3 ? formatAreaValue(convertedArea) : '0.00'}
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                {areaMeta.shortLabel}
              </div>
            </div>
          </div>

          {/* Perimeter Metric */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Perimeter</span>
              <select
                value={distanceUnit}
                onChange={(e) => onDistanceUnitChange(e.target.value as DistanceUnit)}
                className="rounded bg-slate-800/90 px-1 py-0.5 text-[10px] font-semibold text-cyan-400 outline-none border border-slate-700 hover:border-cyan-500/50 cursor-pointer"
              >
                <option value="meters">Meters (m)</option>
                <option value="feet">Feet (ft)</option>
                <option value="km">Kilometers (km)</option>
                <option value="miles">Miles (mi)</option>
                <option value="yards">Yards (yd)</option>
              </select>
            </div>
            <div className="mt-1">
              <div className="text-lg font-extrabold text-cyan-400 tracking-tight leading-none">
                {points.length >= 2 ? formatDistanceValue(convertedPerimeter) : '0.00'}
              </div>
              <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                {distMeta.shortLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Content for Mobile / Desktop */}
        <div className={`${!isMobileExpanded ? 'hidden sm:block' : 'block'}`}>
          {/* Unit Conversions Toggle */}
          {points.length >= 3 && (
            <div className="mt-2">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex w-full items-center justify-between rounded-lg bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  All Unit Conversions
                </span>
                {showBreakdown ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {showBreakdown && (
                <div className="mt-1 max-h-36 overflow-y-auto rounded-lg bg-slate-950/90 p-2 border border-slate-800 text-[11px] space-y-1">
                  {conversions.map((conv) => (
                    <div key={conv.unit} className="flex justify-between items-center py-0.5 border-b border-slate-900 last:border-0">
                      <span className="text-slate-400">{conv.label}:</span>
                      <span className="font-semibold text-slate-200">
                        {formatAreaValue(conv.value)} <span className="text-[9px] text-slate-500">{conv.shortLabel}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Points List Toggle */}
          {points.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowPointsList(!showPointsList)}
                className="flex w-full items-center justify-between rounded-lg bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  Points ({points.length})
                </span>
                {showPointsList ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {showPointsList && (
                <div className="mt-1 max-h-32 overflow-y-auto rounded-lg bg-slate-950/90 p-1.5 border border-slate-800 text-[11px] space-y-1">
                  {points.map((pt, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 px-1 rounded bg-slate-900/60 hover:bg-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-400">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-[10px] text-slate-300">
                          {pt[0].toFixed(5)}, {pt[1].toFixed(5)}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemovePoint(idx)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Toolbar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={onUndoPoint}
              disabled={points.length === 0}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Undo point"
            >
              <Undo2 className="h-3 w-3" />
              Undo
            </button>

            <button
              onClick={onClearPoints}
              disabled={points.length === 0}
              className="flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[11px] font-medium text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 transition-colors"
              title="Clear all"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>

          <button
            onClick={onOpenSaveModal}
            disabled={points.length < 3}
            className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 hover:bg-emerald-400 shadow-md disabled:opacity-40 transition-all cursor-pointer"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save Plot
          </button>
        </div>
      </div>
    </div>
  );
}
