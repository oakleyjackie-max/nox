import { useState, useEffect, useMemo } from "react";
import { useLocation } from "@/context/LocationContext";
import { useTheme } from "@/context/ThemeContext";
import { getGradientForAltitude, getGradientIndex } from "@/lib/skyGradients";
import { getSunAltitudeDeg, getSunTimes, getMoonData } from "@/lib/moonCalc";
import type { MoonData, SunTimes } from "@/lib/moonCalc";

interface SkySyncData {
  altitude: number;
  gradientColors: string[];
  gradientIndex: number;
  sunTimes: SunTimes;
  moon: MoonData;
}

export function useSkySync(): SkySyncData {
  const { latitude, longitude } = useLocation();
  const { skyTimeOverride } = useTheme();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // When manual override is active, don't auto-update (user controls time)
    if (skyTimeOverride !== null) return;
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, [skyTimeOverride]);

  // Compute effective time: override or real
  const effectiveNow = useMemo(() => {
    if (skyTimeOverride === null) return now;
    const d = new Date();
    d.setHours(Math.floor(skyTimeOverride / 60), skyTimeOverride % 60, 0, 0);
    return d;
  }, [skyTimeOverride, now]);

  const altitude = useMemo(
    () => getSunAltitudeDeg(effectiveNow, latitude, longitude),
    [effectiveNow, latitude, longitude]
  );

  const gradientIndex = useMemo(() => getGradientIndex(altitude), [altitude]);

  const gradientColors = useMemo(
    () => getGradientForAltitude(altitude),
    [gradientIndex] // only recompute when bucket changes
  );

  const sunTimes = useMemo(
    () => getSunTimes(effectiveNow, latitude, longitude),
    [
      effectiveNow.getFullYear(),
      effectiveNow.getMonth(),
      effectiveNow.getDate(),
      latitude,
      longitude,
    ]
  );

  const moon = useMemo(
    () => getMoonData(effectiveNow),
    [effectiveNow.getFullYear(), effectiveNow.getMonth(), effectiveNow.getDate(), effectiveNow.getHours()]
  );

  return { altitude, gradientColors, gradientIndex, sunTimes, moon };
}
