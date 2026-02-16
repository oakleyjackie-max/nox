import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import type { LucideIcon } from "lucide-react-native";

interface NeonIconProps {
  icon: LucideIcon;
  size?: number;
  intensity?: number;
}

export function NeonIcon({ icon: Icon, size = 24, intensity = 1 }: NeonIconProps) {
  const { glowColor, glowRadius, isDark, dimmer, colors } = useTheme();

  const iconColor = isDark ? glowColor : colors.text;
  const shadowRadius = isDark ? glowRadius * intensity * (1 - dimmer * 0.7) : 0;

  return (
    <View
      style={[
        styles.container,
        isDark
          ? {
              shadowColor: glowColor,
              shadowRadius: shadowRadius,
              shadowOpacity: 0.8,
              shadowOffset: { width: 0, height: 0 },
            }
          : undefined,
      ]}
    >
      <Icon size={size} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 8,
  },
});
