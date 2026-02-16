// Maps sun altitude (degrees) to gradient colors (top to bottom).
// SunCalc returns altitude in radians; convert before using this.

export interface GradientStop {
  maxAltitude: number; // degrees, upper bound for this range
  colors: string[];
}

export const GRADIENT_MAP: GradientStop[] = [
  { maxAltitude: -18, colors: ["#001F3F", "#001830", "#001525"] },
  { maxAltitude: -12, colors: ["#0a1a3e", "#0f1f42", "#1a2a4c"] },
  { maxAltitude: -6, colors: ["#1a1040", "#2d1b69", "#4a2c8a"] },
  { maxAltitude: 0, colors: ["#2d1b69", "#6d28d9", "#d97706", "#fbbf24"] },
  { maxAltitude: 15, colors: ["#f59e0b", "#fb923c", "#60a5fa", "#3b82f6"] },
  { maxAltitude: 40, colors: ["#2563eb", "#38bdf8", "#60a5fa"] },
  { maxAltitude: 90, colors: ["#0284c7", "#0ea5e9", "#7dd3fc"] },
];

export function getGradientForAltitude(altitudeDeg: number): string[] {
  for (const stop of GRADIENT_MAP) {
    if (altitudeDeg <= stop.maxAltitude) {
      return stop.colors;
    }
  }
  return GRADIENT_MAP[GRADIENT_MAP.length - 1].colors;
}

export function getGradientIndex(altitudeDeg: number): number {
  for (let i = 0; i < GRADIENT_MAP.length; i++) {
    if (altitudeDeg <= GRADIENT_MAP[i].maxAltitude) return i;
  }
  return GRADIENT_MAP.length - 1;
}
