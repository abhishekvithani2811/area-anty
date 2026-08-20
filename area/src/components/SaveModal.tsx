import React, { useState } from 'react';
import type { AreaUnit, DistanceUnit } from '../utils/units';
import { formatAreaValue, convertArea, convertDistance, formatDistanceValue, getAreaUnitMeta, getDistanceUnitMeta } from '../utils/units';
import type { SavedMeasurement } from '../utils/storage';
import { saveMeasurement } from '../utils/storage';
import { X, BookmarkCheck, Tag, FileText, Palette } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: [number, number][];
  areaSqMeters: number;
  perimeterMeters: number;
  areaUnit: AreaUnit;
  distanceUnit: DistanceUnit;
  onSaved: (saved: SavedMeasurement) => void;
}

const CATEGORIES = ['Agriculture / Farm', 'Residential Plot', 'Commercial Land', 'Forestry / Nature', 'Custom'];
const COLOR_OPTIONS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
];

export default function SaveModal({
  isOpen,
  onClose,
  points,
  areaSqMeters,
  perimeterMeters,
  areaUnit,
  distanceUnit,
  onSaved,
}: SaveModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);

  if (!isOpen) return null;

  const areaConverted = convertArea(areaSqMeters, areaUnit);
  const areaMeta = getAreaUnitMeta(areaUnit);

  const perimConverted = convertDistance(perimeterMeters, distanceUnit);
  const distMeta = getDistanceUnitMeta(distanceUnit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved = saveMeasurement({
      name: name.trim(),
      description: description.trim(),
      category,
      color,
      points,
      areaSqMeters,
      perimeterMeters,
    });

    onSaved(saved);
    onClose();
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-100">Save Measurement Plot</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plot Summary Badge */}
        <div className="my-4 rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Calculated Area:</span>
            <div className="text-base font-bold text-emerald-400">
              {formatAreaValue(areaConverted)} {areaMeta.shortLabel}
            </div>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Perimeter:</span>
            <div className="text-base font-bold text-cyan-400">
              {formatDistanceValue(perimConverted)} {distMeta.shortLabel}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-400" /> Plot Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Sector Farm Field #3"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500 transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Color Pin */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-amber-400" /> Color Tag
            </label>
            <div className="flex gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    color === c.value ? 'scale-110 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" /> Notes / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes, soil condition, crop type..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Save Plot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
