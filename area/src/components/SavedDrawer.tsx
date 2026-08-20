import type { SavedMeasurement } from '../utils/storage';
import { exportMeasurementsToGeoJSON, exportMeasurementsToCSV } from '../utils/storage';
import type { AreaUnit } from '../utils/units';
import { formatAreaValue, convertArea } from '../utils/units';
import { X, Trash2, MapPin, Download, FolderOpen, Calendar, ExternalLink } from 'lucide-react';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedList: SavedMeasurement[];
  onLoadPlot: (item: SavedMeasurement) => void;
  onDeletePlot: (id: string) => void;
  areaUnit: AreaUnit;
}

export default function SavedDrawer({
  isOpen,
  onClose,
  savedList,
  onLoadPlot,
  onDeletePlot,
  areaUnit,
}: SavedDrawerProps) {
  if (!isOpen) return null;

  const handleDownloadGeoJSON = () => {
    if (savedList.length === 0) return;
    const dataStr = exportMeasurementsToGeoJSON(savedList);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satellite_land_plots_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (savedList.length === 0) return;
    const dataStr = exportMeasurementsToCSV(savedList);
    const blob = new Blob([dataStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satellite_land_plots_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[10001] flex w-full max-w-md flex-col bg-slate-900 border-l border-slate-800 shadow-2xl backdrop-blur-2xl text-slate-100 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-emerald-400" />
          <h3 className="text-base font-bold text-slate-100">Saved Land Measurements</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Export Toolbar */}
      {savedList.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs">
          <span className="text-slate-400">{savedList.length} Saved Plots</span>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadGeoJSON}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="Export GeoJSON"
            >
              <Download className="h-3 w-3 text-emerald-400" /> GeoJSON
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              title="Export CSV"
            >
              <Download className="h-3 w-3 text-cyan-400" /> CSV
            </button>
          </div>
        </div>
      )}

      {/* Plots List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {savedList.length === 0 ? (
          <div className="my-12 text-center text-slate-500">
            <MapPin className="mx-auto h-10 w-10 text-slate-700 mb-2" />
            <p className="text-sm font-medium">No saved land measurements yet</p>
            <p className="text-xs text-slate-600 mt-1">Measure a plot on the map and click "Save Plot"</p>
          </div>
        ) : (
          savedList.map((item) => {
            const convertedArea = convertArea(item.areaSqMeters, areaUnit);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || '#10b981' }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
                      <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeletePlot(item.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Delete saved plot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Area: </span>
                    <span className="font-bold text-emerald-400">{formatAreaValue(convertedArea)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Points: </span>
                    <span className="font-semibold text-slate-300">{item.points.length}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => {
                      onLoadPlot(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Load Map <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
