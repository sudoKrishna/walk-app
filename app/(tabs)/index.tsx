import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import MapViewComponent from "../../components/map/MapViewComponent";
import { useLocationTracking } from "../../hooks/useLocationTracking";

export default function HomeScreen() {
  const {
    currentLocation,
    pathCoords,
    isTracking,
    error,
    startTracking,
    stopTracking,
    clearPath,
  } = useLocationTracking();

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.center}>
        <Text>Waiting for location...</Text>
        <Button title="Start Tracking" onPress={startTracking} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapViewComponent
        pathCoords={pathCoords}
        currentLocation={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        }}
      />

      <View style={styles.controls}>
        {!isTracking ? (
          <Button title="Start Tracking" onPress={startTracking} />
        ) : (
          <Button title="Stop Tracking" color="red" onPress={stopTracking} />
        )}
        <Button title="Clear Path" onPress={clearPath} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", fontSize: 18, textAlign: "center" },
  controls: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    borderRadius: 10,
  },
});