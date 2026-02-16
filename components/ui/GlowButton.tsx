import React from "react";
import { Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/context/ThemeContext";
import { NeonText } from "./NeonText";

interface GlowButtonProps extends PressableProps {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "filled";
  style?: ViewStyle;
}

export function GlowButton({
  label,
  size = "md",
  variant = "outline",
  style,
  onPress,
  ...props
}: GlowButtonProps) {
  const { glowColor, glowRadius, isDark, dimmer, colors } = useTheme();

  const sizeStyles = {
    sm: { paddingHorizontal: 12, paddingVertical: 6 },
    md: { paddingHorizontal: 20, paddingVertical: 10 },
    lg: { paddingHorizontal: 28, paddingVertical: 14 },
  };

  const fontSizes = { sm: 13, md: 15, lg: 18 };

  const borderColor = isDark ? (variant === "filled" ? colors.accent : glowColor) : colors.text;
  const shadowRad = isDark ? glowRadius * 0.6 * (1 - dimmer * 0.7) : 0;

  return (
    <Pressable
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        {
          borderColor,
          shadowColor: isDark ? glowColor : "transparent",
          shadowRadius: shadowRad,
          shadowOpacity: pressed ? 1 : 0.5,
          shadowOffset: { width: 0, height: 0 },
          opacity: pressed ? 0.8 : 1,
          backgroundColor:
            variant === "filled"
              ? isDark
                ? `${glowColor}22`
                : `${colors.text}10`
              : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <NeonText size={fontSizes[size]}>{label}</NeonText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
