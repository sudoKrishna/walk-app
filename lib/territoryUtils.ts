import * as turf from "@turf/turf";
import { Coord, Territory } from "./types";
import { calculateDistance } from "./locationUtils";

// Detect if the path intersects itself (loop completed)
export const detectLoop = (path: Coord[]): Coord[] | null => {
  if (path.length < 4) return null; // Need at least 4 points to form a loop

  const line = turf.lineString(path.map((c) => [c.longitude, c.latitude]));
  const intersect = turf.lineIntersect(line, line);

  if (intersect.features.length > 0) {
    // Found an intersection
    const intersection = intersect.features[0].geometry.coordinates;
    const intersectionCoord: Coord = {
      latitude: intersection[1],
      longitude: intersection[0],
    };

    // Find the loop segment (from start to intersection and back)
    let loopStartIdx = 0;
    let loopEndIdx = path.length - 1;
    for (let i = 1; i < path.length - 1; i++) {
      if (calculateDistance(path[i], intersectionCoord) < 0.1) {
        loopStartIdx = i;
        break;
      }
    }

    // Extract loop coordinates
    const loopCoords = [
      ...path.slice(loopStartIdx),
      intersectionCoord,
      path[loopStartIdx], // Close the loop
    ];

    return loopCoords;
  }

  return null;
};

// Convert path to polygon (territory) and calculate area
export const pathToTerritory = (path: Coord[]): Territory | null => {
  if (path.length < 3) return null; // Need at least 3 points for a polygon

  const polygon = turf.polygon([
    path.map((c) => [c.longitude, c.latitude]),
  ]);
  const area = turf.area(polygon); // Area in square meters

  return {
    id: `${Date.now()}-${Math.random()}`, // Simple unique ID
    coordinates: path,
    area,
  };
};

// Check if new territory overlaps with existing ones
export const hasOverlap = (newTerritory: Territory, existingTerritories: Territory[]): boolean => {
  const newPoly = turf.polygon([
    newTerritory.coordinates.map((c) => [c.longitude, c.latitude]),
  ]);

  for (const territory of existingTerritories) {
    const existingPoly = turf.polygon([
      territory.coordinates.map((c) => [c.longitude, c.latitude]),
    ]);
    const intersection = turf.intersect(newPoly, existingPoly);
    if (intersection) return true; // Overlap detected
  }
  return false;
};

// Merge new territory with existing ones (union)
export const mergeTerritories = (
  newTerritory: Territory,
  existingTerritories: Territory[]
): Territory[] => {
  let mergedPolys = [...existingTerritories];
  const newPoly = turf.polygon([
    newTerritory.coordinates.map((c) => [c.longitude, c.latitude]),
  ]);

  // Union with any overlapping territories
  const overlapping = mergedPolys.filter((t) => {
    const poly = turf.polygon([t.coordinates.map((c) => [c.longitude, c.latitude])]);
    return turf.intersect(newPoly, poly);
  });

  if (overlapping.length > 0) {
    let unionPoly = newPoly;
    for (const t of overlapping) {
      const poly = turf.polygon([t.coordinates.map((c) => [c.longitude, c.latitude])]);
      unionPoly = turf.union(unionPoly, poly) as turf.Polygon;
    }

    // Convert union back to Territory
    const unionCoords = unionPoly.geometry.coordinates[0].map(([lng, lat]) => ({
      latitude: lat,
      longitude: lng,
    }));
    const unionArea = turf.area(unionPoly);

    // Remove old overlapping territories and add the merged one
    mergedPolys = mergedPolys.filter(
      (t) => !overlapping.some((o) => o.id === t.id)
    );
    mergedPolys.push({
      id: `${Date.now()}-${Math.random()}`,
      coordinates: unionCoords,
      area: unionArea,
    });
  } else {
    // No overlap, just add the new territory
    mergedPolys.push(newTerritory);
  }

  return mergedPolys;
};