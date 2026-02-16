import React from "react";
import { Text, TextProps, StyleSheet, PixelRatio } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface NeonTextProps extends TextProps {
  size?: number;
  intensity?: number;
}

export function NeonText({ style, size, intensity = 1, ...props }: NeonTextProps) {
  const { glowColor, glowRadius, isDark, dimmer, colors } = useTheme();

  const textColor = isDark ? glowColor : colors.text;
  const shadowRadius = isDark ? glowRadius * intensity * (1 - dimmer * 0.7) : 0;
  const scaledSize = size
    ? size * Math.max(1, PixelRatio.getFontScale())
    : undefined;

  return (
    <Text
      {...props}
      style={[
        styles.base,
        {
          color: textColor,
          textShadowColor: isDark ? glowColor : "transparent",
          textShadowRadius: shadowRadius,
          textShadowOffset: { width: 0, height: 0 },
        },
        scaledSize ? { fontSize: scaledSize } : undefined,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: "SpaceMono",
  },
});
