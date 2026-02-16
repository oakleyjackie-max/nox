import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { NeonText } from "@/components/ui/NeonText";
import { useTheme } from "@/context/ThemeContext";

interface MoonPhaseProps {
  illumination: number; // 0–100
  phaseName: string;
  phase: number; // 0–1
}

export function MoonPhase({ illumination, phaseName, phase }: MoonPhaseProps) {
  const { glowColor } = useTheme();

  return (
    <View style={styles.container}>
      <MoonIcon phase={phase} size={56} color={glowColor} />
      <View style={styles.info}>
        <NeonText size={18} intensity={0.8}>
          {illumination}% Illuminated
        </NeonText>
        <NeonText size={13} intensity={0.5} style={styles.phaseName}>
          {phaseName}
        </NeonText>
      </View>
    </View>
  );
}

function MoonIcon({ phase, size, color }: { phase: number; size: number; color: string }) {
  const r = size / 2;
  // phase: 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
  // We'll show illuminated portion as a filled arc
  const illuminatedRight = phase < 0.5;
  const sweepFraction = phase < 0.5 ? phase * 2 : (1 - phase) * 2;

  // Curve control point for the terminator line
  const curveX = r + (sweepFraction - 0.5) * 2 * r;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={r} cy={r} r={r - 1} fill="rgba(255,255,255,0.05)" stroke={color} strokeWidth={1} />
      <Circle
        cx={r}
        cy={r}
        r={r - 3}
        fill={color}
        opacity={0.15 + (phase > 0.25 && phase < 0.75 ? 0.3 : 0)}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  info: {
    gap: 2,
  },
  phaseName: {
    opacity: 0.7,
  },
});
