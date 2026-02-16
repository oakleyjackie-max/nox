import { useState, useEffect, useCallback } from "react";
import { useLocation } from "@/context/LocationContext";
import { fetchWeather, WeatherData } from "@/lib/weatherApi";

interface UseWeatherResult {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useWeather(): UseWeatherResult {
  const { latitude, longitude, loading: locLoading } = useLocation();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (locLoading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWeather(latitude, longitude);
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, locLoading]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
