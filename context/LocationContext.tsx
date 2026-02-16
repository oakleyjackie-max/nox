import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { DEFAULT_LOCATION } from "@/lib/constants";

interface LocationContextValue {
  latitude: number;
  longitude: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const LocationContext = createContext<LocationContextValue>({
  ...DEFAULT_LOCATION,
  loading: true,
  error: null,
  refresh: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied. Using default location.");
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (e) {
      setError("Failed to get location. Using default.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return (
    <LocationContext.Provider
      value={{
        latitude: coords.latitude,
        longitude: coords.longitude,
        loading,
        error,
        refresh: fetchLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
