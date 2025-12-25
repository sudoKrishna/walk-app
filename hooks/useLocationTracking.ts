import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { Coord, TrackingState } from "../lib/types";
import { shouldAddPoint } from "../lib/locationUtils";

export const useLocationTracking = (): TrackingState & {
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  clearPath: () => void;
} => {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [pathCoords, setPathCoords] = useState<Coord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Permission to access location was denied");
      return;
    }

    setError(null);
    setIsTracking(true);

    // Get initial position
    const initialLoc = await Location.getCurrentPositionAsync({});
    const initialCoord: Coord = {
      latitude: initialLoc.coords.latitude,
      longitude: initialLoc.coords.longitude,
    };
    setCurrentLocation(initialLoc);
    setPathCoords([initialCoord]);

    // Start watching
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 1000,
      },
      (newLoc) => {
        const newCoord: Coord = {
          latitude: newLoc.coords.latitude,
          longitude: newLoc.coords.longitude,
        };

        setCurrentLocation(newLoc);

        setPathCoords((prev) => {
          if (shouldAddPoint(prev, newCoord, 5)) {
            return [...prev, newCoord];
          }
          return prev;
        });
      }
    );
  };

  const stopTracking = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
  };

  const clearPath = () => {
    setPathCoords([]);
    setCurrentLocation(null);
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    currentLocation,
    pathCoords,
    isTracking,
    error,
    startTracking,
    stopTracking,
    clearPath,
  };
};