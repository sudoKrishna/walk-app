import { Coord } from "./types";

export const calculateDistance = (prev: Coord, next: Coord): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

  const lat1 = toRad(prev.latitude);
  const lat2 = toRad(next.latitude);
  const deltaLat = toRad(next.latitude - prev.latitude);
  const deltaLon = toRad(next.longitude - prev.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const shouldAddPoint = (prev: Coord[], next: Coord, minDistance: number = 5): boolean => {
  if (prev.length === 0) return true;
  const last = prev[prev.length - 1];
  return calculateDistance(last, next) >= minDistance;
};