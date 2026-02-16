import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Snowflake,
  Wind,
  Droplets,
} from "lucide-react-native";
import { NeonText } from "@/components/ui/NeonText";
import { NeonIcon } from "@/components/ui/NeonIcon";
import { useTheme } from "@/context/ThemeContext";
import { weatherCodeToInfo, WeatherCurrent } from "@/lib/weatherApi";
import type { LucideIcon } from "lucide-react-native";

const ICON_MAP: Record<string, LucideIcon> = {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Snowflake,
};

interface WeatherCardContentProps {
  current: WeatherCurrent;
}

export function WeatherCardContent({ current }: WeatherCardContentProps) {
  const info = weatherCodeToInfo(current.weatherCode);
  const Icon = ICON_MAP[info.icon] || Cloud;

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <NeonIcon icon={Icon} size={48} intensity={1.2} />
        <NeonText size={64} intensity={1.3} style={styles.temp}>
          {Math.round(current.temperature)}°
        </NeonText>
      </View>
      <NeonText size={18} intensity={0.7} style={styles.description}>
        {info.description}
      </NeonText>
      <View style={styles.detailRow}>
        <View style={styles.detail}>
          <NeonIcon icon={Wind} size={16} intensity={0.6} />
          <NeonText size={14} intensity={0.6}>
            {current.windSpeed} km/h
          </NeonText>
        </View>
        <View style={styles.detail}>
          <NeonIcon icon={Droplets} size={16} intensity={0.6} />
          <NeonText size={14} intensity={0.6}>
            {current.humidity}%
          </NeonText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  temp: {
    fontVariant: ["tabular-nums"],
  },
  description: {
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  detailRow: {
    flexDirection: "row",
    gap: 32,
    marginTop: 8,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
