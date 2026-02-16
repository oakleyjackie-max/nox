import React from "react";
import { View, StyleSheet, ViewProps, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/context/ThemeContext";

interface GlassCardProps extends ViewProps {
  intensity?: number;
  children: React.ReactNode;
}

export function GlassCard({ intensity = 40, style, children, ...props }: GlassCardProps) {
  const { colors, isDark } = useTheme();

  const blurPx = Math.round(intensity / 2);

  return (
    <View style={[styles.container, style]} {...props}>
      {Platform.OS === "web" ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark ? "rgba(0,15,40,0.55)" : "rgba(255,255,255,0.45)",
              // @ts-ignore web-only CSS
              backdropFilter: `blur(${blurPx}px)`,
              // @ts-ignore web-only CSS
              WebkitBackdropFilter: `blur(${blurPx}px)`,
            },
          ]}
        />
      ) : (
        <BlurView intensity={intensity} tint={colors.blurTint} style={StyleSheet.absoluteFill} />
      )}
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
