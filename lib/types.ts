import type { LocationObject } from "expo-location";

export type Coord = {
  latitude: number;
  longitude: number;
};

export type Territory = {
  id: string; // Unique ID for each territory
  coordinates: Coord[]; // Polygon vertices
  area: number; // Area in square meters
};

export type TrackingState = {
  currentLocation: LocationObject | null;
  pathCoords: Coord[];
  territories: Territory[];
  isTracking: boolean;
  error: string | null;
};