export type AreaUnit =
  | 'acres'
  | 'hectares'
  | 'sq_meters'
  | 'sq_feet'
  | 'sq_yards'
  | 'bigha'
  | 'guntha'
  | 'marla'
  | 'kanal';

export type DistanceUnit = 'meters' | 'feet' | 'km' | 'miles' | 'yards';

export interface AreaConversion {
  unit: AreaUnit;
  label: string;
  shortLabel: string;
  value: number;
}

// 1 Sq Meter conversion factors
const AREA_CONVERSIONS: Record<AreaUnit, { factor: number; label: string; shortLabel: string }> = {
  sq_meters: { factor: 1, label: 'Square Meters', shortLabel: 'm²' },
  acres: { factor: 0.000247105, label: 'Acres', shortLabel: 'ac' },
  hectares: { factor: 0.0001, label: 'Hectares', shortLabel: 'ha' },
  sq_feet: { factor: 10.7639, label: 'Square Feet', shortLabel: 'sq ft' },
  sq_yards: { factor: 1.19599, label: 'Square Yards', shortLabel: 'sq yd' },
  bigha: { factor: 0.000395368, label: 'Bigha (Standard)', shortLabel: 'Bigha' }, // ~2529.3 m²
  guntha: { factor: 0.00988422, label: 'Guntha', shortLabel: 'Guntha' }, // ~101.17 m²
  marla: { factor: 0.0395368, label: 'Marla', shortLabel: 'Marla' }, // ~25.29 m²
  kanal: { factor: 0.00197684, label: 'Kanal', shortLabel: 'Kanal' }, // ~505.85 m²
};

const DISTANCE_CONVERSIONS: Record<DistanceUnit, { factor: number; label: string; shortLabel: string }> = {
  meters: { factor: 1, label: 'Meters', shortLabel: 'm' },
  feet: { factor: 3.28084, label: 'Feet', shortLabel: 'ft' },
  km: { factor: 0.001, label: 'Kilometers', shortLabel: 'km' },
  miles: { factor: 0.000621371, label: 'Miles', shortLabel: 'mi' },
  yards: { factor: 1.09361, label: 'Yards', shortLabel: 'yd' },
};

export function convertArea(sqMeters: number, targetUnit: AreaUnit): number {
  return sqMeters * (AREA_CONVERSIONS[targetUnit]?.factor || 1);
}

export function convertDistance(meters: number, targetUnit: DistanceUnit): number {
  return meters * (DISTANCE_CONVERSIONS[targetUnit]?.factor || 1);
}

export function formatAreaValue(value: number): string {
  if (value >= 1000000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 100) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

export function formatDistanceValue(value: number): string {
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 10) return value.toFixed(2);
  return value.toFixed(2);
}

export function getAreaUnitMeta(unit: AreaUnit) {
  return AREA_CONVERSIONS[unit] || AREA_CONVERSIONS.sq_meters;
}

export function getDistanceUnitMeta(unit: DistanceUnit) {
  return DISTANCE_CONVERSIONS[unit] || DISTANCE_CONVERSIONS.meters;
}

export function getAllAreaConversions(sqMeters: number): AreaConversion[] {
  return (Object.keys(AREA_CONVERSIONS) as AreaUnit[]).map((unit) => ({
    unit,
    label: AREA_CONVERSIONS[unit].label,
    shortLabel: AREA_CONVERSIONS[unit].shortLabel,
    value: convertArea(sqMeters, unit),
  }));
}
