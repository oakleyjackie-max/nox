import { useState, useEffect, useMemo } from "react";
import { useLocation } from "@/context/LocationContext";
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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const altitude = useMemo(
    () => getSunAltitudeDeg(now, latitude, longitude),
    [now, latitude, longitude]
  );

  const gradientIndex = useMemo(() => getGradientIndex(altitude), [altitude]);

  const gradientColors = useMemo(
    () => getGradientForAltitude(altitude),
    [gradientIndex] // only recompute when bucket changes
  );

  const sunTimes = useMemo(
    () => getSunTimes(now, latitude, longitude),
    [
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      latitude,
      longitude,
    ]
  );

  const moon = useMemo(
    () => getMoonData(now),
    [now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()]
  );

  return { altitude, gradientColors, gradientIndex, sunTimes, moon };
}
