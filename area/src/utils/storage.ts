export interface SavedMeasurement {
  id: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  createdAt: string;
  points: [number, number][]; // [lat, lng]
  areaSqMeters: number;
  perimeterMeters: number;
}

const STORAGE_KEY = 'satellite_area_saved_measurements_v1';

export function getSavedMeasurements(): SavedMeasurement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved measurements', err);
    return [];
  }
}

export function saveMeasurement(item: Omit<SavedMeasurement, 'id' | 'createdAt'>): SavedMeasurement {
  const all = getSavedMeasurements();
  const newItem: SavedMeasurement = {
    ...item,
    id: 'plot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...all];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newItem;
}

export function deleteSavedMeasurement(id: string): SavedMeasurement[] {
  const all = getSavedMeasurements();
  const updated = all.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAllSavedMeasurements(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportMeasurementsToGeoJSON(measurements: SavedMeasurement[]): string {
  const features = measurements.map((item) => ({
    type: 'Feature',
    properties: {
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      areaSqMeters: item.areaSqMeters,
      perimeterMeters: item.perimeterMeters,
      createdAt: item.createdAt,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [...item.points.map(([lat, lng]) => [lng, lat]), [item.points[0][1], item.points[0][0]]],
      ],
    },
  }));

  const geojson = {
    type: 'FeatureCollection',
    features,
  };

  return JSON.stringify(geojson, null, 2);
}

export function exportMeasurementsToCSV(measurements: SavedMeasurement[]): string {
  const headers = ['ID', 'Name', 'Category', 'Area (Sq M)', 'Perimeter (M)', 'Points Count', 'Created At'];
  const rows = measurements.map((m) => [
    m.id,
    `"${m.name.replace(/"/g, '""')}"`,
    m.category,
    m.areaSqMeters.toFixed(2),
    m.perimeterMeters.toFixed(2),
    m.points.length,
    m.createdAt,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
