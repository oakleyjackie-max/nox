import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Snowflake,
} from "lucide-react-native";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/ui/NeonText";
import { NeonIcon } from "@/components/ui/NeonIcon";
import { weatherCodeToInfo, WeatherHourly } from "@/lib/weatherApi";
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

interface HourlyForecastProps {
  hourly: WeatherHourly;
}

interface HourItem {
  time: string;
  temp: number;
  code: number;
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const items: HourItem[] = hourly.time.map((t, i) => ({
    time: t,
    temp: hourly.temperature[i],
    code: hourly.weatherCode[i],
  }));

  return (
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.time}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const info = weatherCodeToInfo(item.code);
        const Icon = ICON_MAP[info.icon] || Cloud;
        const hour = new Date(item.time).getHours().toString().padStart(2, "0");

        return (
          <GlassCard intensity={30} style={styles.card}>
            <NeonText size={12} intensity={0.5}>
              {hour}:00
            </NeonText>
            <NeonIcon icon={Icon} size={20} intensity={0.7} />
            <NeonText size={16} intensity={0.8}>
              {Math.round(item.temp)}°
            </NeonText>
          </GlassCard>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingHorizontal: 16,
  },
  card: {
    alignItems: "center",
    width: 72,
  },
});
