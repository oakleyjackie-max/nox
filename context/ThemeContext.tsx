import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  GlowMode,
  GLOW_COLORS,
  GLOW_SHADOW_RADIUS,
  STORAGE_KEYS,
  ColorScheme,
  SchemeColors,
  LIGHT_COLORS,
  DARK_COLORS,
} from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import type { SassLevel } from "@/lib/wakeUpMessages";
import type { TTSOptions } from "@/lib/speech";
import { DEFAULT_TTS_OPTIONS } from "@/lib/speech";

interface ThemeContextValue {
  glowMode: GlowMode;
  glowColor: string;
  glowRadius: number;
  setGlowMode: (mode: GlowMode) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isDark: boolean;
  dimmer: number;
  setDimmer: (value: number) => void;
  colors: SchemeColors;
  wakeMessagesEnabled: boolean;
  setWakeMessagesEnabled: (enabled: boolean) => void;
  wakeSassLevel: SassLevel;
  setWakeSassLevel: (level: SassLevel) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  ttsOptions: TTSOptions;
  setTtsLanguage: (lang: string) => void;
  setTtsPitch: (pitch: number) => void;
  setTtsRate: (rate: number) => void;
  /** Minutes of day (0-1439) override for sky gradient, or null for real time */
  skyTimeOverride: number | null;
  setSkyTimeOverride: (minutes: number | null) => void;
  /** User-provided Google Cloud TTS API key (stored locally) */
  googleTtsApiKey: string;
  setGoogleTtsApiKey: (key: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  glowMode: "moonlight",
  glowColor: GLOW_COLORS.moonlight,
  glowRadius: GLOW_SHADOW_RADIUS.moonlight,
  setGlowMode: () => {},
  colorScheme: "dark",
  setColorScheme: () => {},
  isDark: true,
  dimmer: 0,
  setDimmer: () => {},
  colors: DARK_COLORS,
  wakeMessagesEnabled: true,
  setWakeMessagesEnabled: () => {},
  wakeSassLevel: "medium",
  setWakeSassLevel: () => {},
  ttsEnabled: false,
  setTtsEnabled: () => {},
  ttsOptions: DEFAULT_TTS_OPTIONS,
  setTtsLanguage: () => {},
  setTtsPitch: () => {},
  setTtsRate: () => {},
  skyTimeOverride: null,
  setSkyTimeOverride: () => {},
  googleTtsApiKey: "",
  setGoogleTtsApiKey: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [glowMode, setGlowModeState] = useState<GlowMode>("moonlight");
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("dark");
  const [dimmer, setDimmerState] = useState(0);
  const [wakeMessagesEnabled, setWakeMessagesEnabledState] = useState(true);
  const [wakeSassLevel, setWakeSassLevelState] = useState<SassLevel>("medium");
  const [ttsEnabled, setTtsEnabledState] = useState(false);
  const [ttsLanguage, setTtsLanguageState] = useState(DEFAULT_TTS_OPTIONS.language);
  const [ttsPitch, setTtsPitchState] = useState(DEFAULT_TTS_OPTIONS.pitch);
  const [ttsRate, setTtsRateState] = useState(DEFAULT_TTS_OPTIONS.rate);
  const [skyTimeOverride, setSkyTimeOverrideState] = useState<number | null>(null);
  const [googleTtsApiKey, setGoogleTtsApiKeyState] = useState("");

  useEffect(() => {
    getItem<GlowMode>(STORAGE_KEYS.GLOW_MODE).then((saved) => {
      if (saved) setGlowModeState(saved);
    });
    getItem<ColorScheme>(STORAGE_KEYS.COLOR_SCHEME).then((saved) => {
      if (saved) setColorSchemeState(saved);
    });
    getItem<number>(STORAGE_KEYS.DIMMER).then((saved) => {
      if (saved !== null && saved !== undefined) setDimmerState(saved);
    });
    getItem<boolean>(STORAGE_KEYS.WAKE_MESSAGES_ENABLED).then((saved) => {
      if (saved !== null && saved !== undefined) setWakeMessagesEnabledState(saved);
    });
    getItem<SassLevel>(STORAGE_KEYS.WAKE_SASS_LEVEL).then((saved) => {
      if (saved) setWakeSassLevelState(saved);
    });
    getItem<boolean>(STORAGE_KEYS.TTS_ENABLED).then((saved) => {
      if (saved !== null && saved !== undefined) setTtsEnabledState(saved);
    });
    getItem<string>(STORAGE_KEYS.TTS_LANGUAGE).then((saved) => {
      if (saved) setTtsLanguageState(saved);
    });
    getItem<number>(STORAGE_KEYS.TTS_PITCH).then((saved) => {
      if (saved !== null && saved !== undefined) setTtsPitchState(saved);
    });
    getItem<number>(STORAGE_KEYS.TTS_RATE).then((saved) => {
      if (saved !== null && saved !== undefined) setTtsRateState(saved);
    });
    getItem<string>(STORAGE_KEYS.GOOGLE_TTS_API_KEY).then((saved) => {
      if (saved) setGoogleTtsApiKeyState(saved);
    });
  }, []);

  const setGlowMode = useCallback((mode: GlowMode) => {
    setGlowModeState(mode);
    setItem(STORAGE_KEYS.GLOW_MODE, mode);
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    setItem(STORAGE_KEYS.COLOR_SCHEME, scheme);
  }, []);

  const setDimmer = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setDimmerState(clamped);
    setItem(STORAGE_KEYS.DIMMER, clamped);
  }, []);

  const setWakeMessagesEnabled = useCallback((enabled: boolean) => {
    setWakeMessagesEnabledState(enabled);
    setItem(STORAGE_KEYS.WAKE_MESSAGES_ENABLED, enabled);
  }, []);

  const setWakeSassLevel = useCallback((level: SassLevel) => {
    setWakeSassLevelState(level);
    setItem(STORAGE_KEYS.WAKE_SASS_LEVEL, level);
  }, []);

  const setTtsEnabled = useCallback((enabled: boolean) => {
    setTtsEnabledState(enabled);
    setItem(STORAGE_KEYS.TTS_ENABLED, enabled);
  }, []);

  const setTtsLanguage = useCallback((lang: string) => {
    setTtsLanguageState(lang);
    setItem(STORAGE_KEYS.TTS_LANGUAGE, lang);
  }, []);

  const setTtsPitch = useCallback((pitch: number) => {
    const clamped = Math.max(0.5, Math.min(2.0, pitch));
    setTtsPitchState(clamped);
    setItem(STORAGE_KEYS.TTS_PITCH, clamped);
  }, []);

  const setTtsRate = useCallback((rate: number) => {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    setTtsRateState(clamped);
    setItem(STORAGE_KEYS.TTS_RATE, clamped);
  }, []);

  const setSkyTimeOverride = useCallback((minutes: number | null) => {
    setSkyTimeOverrideState(minutes);
  }, []);

  const setGoogleTtsApiKey = useCallback((key: string) => {
    setGoogleTtsApiKeyState(key);
    if (key) {
      setItem(STORAGE_KEYS.GOOGLE_TTS_API_KEY, key);
    } else {
      setItem(STORAGE_KEYS.GOOGLE_TTS_API_KEY, "");
    }
  }, []);

  const isDark = colorScheme === "dark";
  const glowColor = GLOW_COLORS[glowMode];
  const glowRadius = GLOW_SHADOW_RADIUS[glowMode];

  const colors: SchemeColors = useMemo(() => {
    if (!isDark) return LIGHT_COLORS;
    return {
      ...DARK_COLORS,
      text: glowColor,
    };
  }, [isDark, glowColor]);

  const ttsOptions: TTSOptions = useMemo(
    () => ({ language: ttsLanguage, pitch: ttsPitch, rate: ttsRate }),
    [ttsLanguage, ttsPitch, ttsRate]
  );

  return (
    <ThemeContext.Provider
      value={{
        glowMode,
        glowColor,
        glowRadius,
        setGlowMode,
        colorScheme,
        setColorScheme,
        isDark,
        dimmer,
        setDimmer,
        colors,
        wakeMessagesEnabled,
        setWakeMessagesEnabled,
        wakeSassLevel,
        setWakeSassLevel,
        ttsEnabled,
        setTtsEnabled,
        ttsOptions,
        setTtsLanguage,
        setTtsPitch,
        setTtsRate,
        skyTimeOverride,
        setSkyTimeOverride,
        googleTtsApiKey,
        setGoogleTtsApiKey,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
