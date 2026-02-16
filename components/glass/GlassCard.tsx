import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/context/ThemeContext";

interface GlassCardProps extends ViewProps {
  intensity?: number;
  children: React.ReactNode;
}

export function GlassCard({ intensity = 40, style, children, ...props }: GlassCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]} {...props}>
      <BlurView intensity={intensity} tint={colors.blurTint} style={StyleSheet.absoluteFill} />
      <View style={[styles.specularBorder, { borderColor: colors.border }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  specularBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
  },
  content: {
    padding: 20,
  },
});
