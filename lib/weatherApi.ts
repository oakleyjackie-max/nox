import { getItem, setItem } from "./storage";
import { STORAGE_KEYS, WEATHER_CACHE_TTL } from "./constants";

export interface WeatherCurrent {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

export interface WeatherHourly {
  time: string[];
  temperature: number[];
  weatherCode: number[];
}

export interface WeatherData {
  current: WeatherCurrent;
  hourly: WeatherHourly;
  timestamp: number;
}

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  // Check cache first
  const cached = await getItem<CachedWeather>(STORAGE_KEYS.WEATHER_CACHE);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
    return cached.data;
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m",
    hourly: "temperature_2m,weather_code",
    forecast_days: "1",
    timezone: "auto",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

  const json = await res.json();

  const data: WeatherData = {
    current: {
      temperature: json.current.temperature_2m,
      weatherCode: json.current.weather_code,
      windSpeed: json.current.wind_speed_10m,
      humidity: json.current.relative_humidity_2m,
    },
    hourly: {
      time: json.hourly.time,
      temperature: json.hourly.temperature_2m,
      weatherCode: json.hourly.weather_code,
    },
    timestamp: Date.now(),
  };

  // Cache result
  await setItem(STORAGE_KEYS.WEATHER_CACHE, { data, timestamp: Date.now() });

  return data;
}

// WMO Weather Code to description and icon name
export function weatherCodeToInfo(code: number): { description: string; icon: string } {
  if (code === 0) return { description: "Clear Sky", icon: "Sun" };
  if (code <= 3) return { description: "Partly Cloudy", icon: "CloudSun" };
  if (code <= 49) return { description: "Foggy", icon: "CloudFog" };
  if (code <= 59) return { description: "Drizzle", icon: "CloudDrizzle" };
  if (code <= 69) return { description: "Rain", icon: "CloudRain" };
  if (code <= 79) return { description: "Snow", icon: "Snowflake" };
  if (code <= 84) return { description: "Rain Showers", icon: "CloudRain" };
  if (code <= 86) return { description: "Snow Showers", icon: "Snowflake" };
  if (code <= 99) return { description: "Thunderstorm", icon: "CloudLightning" };
  return { description: "Unknown", icon: "Cloud" };
}
