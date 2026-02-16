export type GlowMode = "moonlight" | "nightVision" | "deepSpace" | "radar";

export const GLOW_COLORS: Record<GlowMode, string> = {
  moonlight: "#D1D5DB",
  nightVision: "#FF3131",
  deepSpace: "#00D4FF",
  radar: "#39FF14",
};

export const GLOW_LABELS: Record<GlowMode, string> = {
  moonlight: "Moonlight",
  nightVision: "Night Vision",
  deepSpace: "Deep Space",
  radar: "Radar",
};

export const GLOW_SHADOW_RADIUS: Record<GlowMode, number> = {
  moonlight: 8,
  nightVision: 14,
  deepSpace: 12,
  radar: 12,
};

export const ALARM_THEMES = ["pulsar", "nebula", "quasar", "saturn"] as const;
export type AlarmTheme = (typeof ALARM_THEMES)[number];

export const ALARM_THEME_LABELS: Record<AlarmTheme, string> = {
  pulsar: "Pulsar",
  nebula: "Nebula",
  quasar: "Quasar",
  saturn: "Saturn",
};

export const MOON_PHASE_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;

export const STORAGE_KEYS = {
  GLOW_MODE: "nox_glow_mode",
  COLOR_SCHEME: "nox_color_scheme",
  DIMMER: "nox_dimmer",
  ALARMS: "nox_alarms",
  TIMERS: "nox_timers",
  LOCATION: "nox_location",
  WEATHER_CACHE: "nox_weather_cache",
  WAKE_MESSAGES_ENABLED: "nox_wake_msg_enabled",
  WAKE_SASS_LEVEL: "nox_wake_sass_level",
  TTS_ENABLED: "nox_tts_enabled",
  TTS_LANGUAGE: "nox_tts_language",
  TTS_PITCH: "nox_tts_pitch",
  TTS_RATE: "nox_tts_rate",
  GOOGLE_TTS_API_KEY: "nox_google_tts_api_key",
} as const;

export type ColorScheme = "light" | "dark";

export interface SchemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  blurTint: "light" | "dark";
}

export const ACCENT_GOLD = "#FFD700";

export const LIGHT_COLORS: SchemeColors = {
  background: "#F0F4F8",
  surface: "rgba(255,255,255,0.7)",
  text: "#1E293B",
  textSecondary: "#64748B",
  border: "rgba(0,0,0,0.1)",
  accent: "#1E293B",
  blurTint: "light",
};

export const DARK_COLORS: SchemeColors = {
  background: "#001F3F",
  surface: "rgba(255,215,0,0.06)",
  text: "#D1D5DB", // fallback; overridden by glowColor at runtime
  textSecondary: "rgba(255,255,255,0.4)",
  border: "rgba(255,255,255,0.15)",
  accent: "#FFD700",
  blurTint: "dark",
};

export const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.006,
};

export const WEATHER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const MAX_TIMERS = 5;

export const CRESCENDO = {
  START_VOLUME: 0.1,
  MAX_VOLUME: 1.0,
  STEP: 0.05,
  INTERVAL_MS: 2000,
};
