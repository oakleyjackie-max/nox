import React from "react";
import { View, StyleSheet } from "react-native";
import { Sunrise, Sunset } from "lucide-react-native";
import { NeonText } from "@/components/ui/NeonText";
import { NeonIcon } from "@/components/ui/NeonIcon";

interface SunTimesProps {
  sunrise: Date;
  sunset: Date;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SunTimesDisplay({ sunrise, sunset }: SunTimesProps) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <NeonIcon icon={Sunrise} size={22} intensity={0.7} />
        <NeonText size={16} intensity={0.7}>
          {formatTime(sunrise)}
        </NeonText>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <NeonIcon icon={Sunset} size={22} intensity={0.7} />
        <NeonText size={16} intensity={0.7}>
          {formatTime(sunset)}
        </NeonText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
});
