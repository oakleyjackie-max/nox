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
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [glowMode, setGlowModeState] = useState<GlowMode>("moonlight");
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("dark");
  const [dimmer, setDimmerState] = useState(0);

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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
