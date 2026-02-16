import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import {
  Clock,
  CloudSun,
  AlarmClock,
  Settings,
} from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_ICONS = [Clock, CloudSun, AlarmClock, Settings];
const TAB_LABELS = ["Clock", "Weather", "Alarms", "Settings"];

export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const { glowColor, glowRadius, isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const focusedColor = isDark ? colors.accent : colors.text;
  const unfocusedColor = colors.textSecondary;

  return (
    <View style={[styles.outer, { paddingBottom: insets.bottom, borderTopColor: colors.border }]}>
      <BlurView intensity={60} tint={colors.blurTint} style={StyleSheet.absoluteFill} />
      <View style={[styles.specular, { borderTopColor: colors.border }]} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const Icon = TAB_ICONS[index];

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
            >
              <View
                style={
                  focused && isDark
                    ? {
                        shadowColor: glowColor,
                        shadowRadius: glowRadius,
                        shadowOpacity: 0.9,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 8,
                      }
                    : undefined
                }
              >
                <Icon
                  size={26}
                  color={focused ? focusedColor : unfocusedColor}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderTopWidth: 1,
  },
  specular: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: "row",
    height: 60,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
