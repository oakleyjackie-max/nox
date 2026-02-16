import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSkySync } from "@/hooks/useSkySync";

export function SkySyncBackground() {
  const { gradientColors } = useSkySync();

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      style={StyleSheet.absoluteFill}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />
  );
}
