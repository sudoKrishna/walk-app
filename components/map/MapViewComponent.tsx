import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Polyline, Region } from "react-native-maps";
import { Coord } from "../../lib/types";

type Props = {
  pathCoords: Coord[];
  currentLocation: { latitude: number; longitude: number } | null;
};

export default function MapViewComponent({ pathCoords, currentLocation }: Props) {
  const mapRef = useRef<MapView>(null);

  const region: Region | undefined = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region} // Helps with smooth following
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled
      >
        {pathCoords.length > 1 && (
          <Polyline
            coordinates={pathCoords}
            strokeColor="#007AFF"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});