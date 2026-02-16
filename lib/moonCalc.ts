import SunCalc from "suncalc";
import { MOON_PHASE_NAMES } from "./constants";

export interface MoonData {
  illumination: number; // 0–100
  phaseName: string;
  phase: number; // 0–1
}

export function getMoonData(date: Date): MoonData {
  const illum = SunCalc.getMoonIllumination(date);
  const phaseIndex = Math.round(illum.phase * 8) % 8;

  return {
    illumination: Math.round(illum.fraction * 100),
    phaseName: MOON_PHASE_NAMES[phaseIndex],
    phase: illum.phase,
  };
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
}

export function getSunTimes(date: Date, lat: number, lng: number): SunTimes {
  const times = SunCalc.getTimes(date, lat, lng);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
  };
}

export function getSunAltitudeDeg(date: Date, lat: number, lng: number): number {
  const pos = SunCalc.getPosition(date, lat, lng);
  return (pos.altitude * 180) / Math.PI;
}
