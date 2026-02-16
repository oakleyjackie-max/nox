import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/ui/NeonText";
import { useTheme } from "@/context/ThemeContext";
import { useLocation } from "@/context/LocationContext";
import { GlowMode, GLOW_COLORS, GLOW_LABELS, GLOW_SHADOW_RADIUS } from "@/lib/constants";
import { MapPin, Sun, Moon } from "lucide-react-native";
import { NeonIcon } from "@/components/ui/NeonIcon";

const GLOW_MODES: GlowMode[] = ["moonlight", "nightVision", "deepSpace", "radar"];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    glowMode,
    setGlowMode,
    colorScheme,
    setColorScheme,
    isDark,
    dimmer,
    setDimmer,
    colors,
  } = useTheme();
  const { latitude, longitude, error: locError } = useLocation();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: 100 },
      ]}
    >
      <NeonText size={13} intensity={0.4} style={styles.header}>
        SETTINGS
      </NeonText>

      {/* Display Mode */}
      <GlassCard>
        <NeonText size={13} intensity={0.5} style={styles.sectionTitle}>
          DISPLAY
        </NeonText>

        {/* Light/Dark Toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleBtn,
              !isDark && styles.toggleBtnActive,
              !isDark && { borderColor: colors.text },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setColorScheme("light");
            }}
          >
            <Sun size={16} color={!isDark ? colors.text : colors.textSecondary} />
            <NeonText size={13} intensity={!isDark ? 0.9 : 0.4}>
              Light
            </NeonText>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              isDark && styles.toggleBtnActive,
              isDark && { borderColor: colors.text },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setColorScheme("dark");
            }}
          >
            <Moon size={16} color={isDark ? colors.text : colors.textSecondary} />
            <NeonText size={13} intensity={isDark ? 0.9 : 0.4}>
              Dark
            </NeonText>
          </Pressable>
        </View>

        {/* Dimmer Slider */}
        <View style={styles.dimmerSection}>
          <NeonText size={12} intensity={0.4} style={styles.dimmerLabel}>
            DIMMER
          </NeonText>
          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderFill,
                {
                  width: `${dimmer * 100}%`,
                  backgroundColor: isDark ? colors.text : colors.textSecondary,
                },
              ]}
            />
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                // We need the track width; use layout measurement
              }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                handleSliderTouch(e.nativeEvent.locationX, setDimmer);
              }}
              onResponderMove={(e) => {
                handleSliderTouch(e.nativeEvent.locationX, setDimmer);
              }}
            />
          </View>
          <View style={styles.dimmerLabels}>
            <NeonText size={10} intensity={0.3}>
              Bright
            </NeonText>
            <NeonText size={10} intensity={0.3}>
              {Math.round(dimmer * 100)}%
            </NeonText>
            <NeonText size={10} intensity={0.3}>
              Dim
            </NeonText>
          </View>
        </View>
      </GlassCard>

      {/* Theme Picker — only show in dark mode */}
      {isDark && (
        <GlassCard>
          <NeonText size={13} intensity={0.5} style={styles.sectionTitle}>
            GLOW THEME
          </NeonText>
          <View style={styles.themeGrid}>
            {GLOW_MODES.map((mode) => {
              const color = GLOW_COLORS[mode];
              const active = glowMode === mode;
              return (
                <Pressable
                  key={mode}
                  style={[
                    styles.themeCard,
                    {
                      borderColor: active ? color : colors.border,
                      backgroundColor: active ? `${color}15` : "transparent",
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGlowMode(mode);
                  }}
                >
                  <View
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: color,
                        shadowColor: color,
                        shadowRadius: GLOW_SHADOW_RADIUS[mode],
                        shadowOpacity: 0.8,
                        shadowOffset: { width: 0, height: 0 },
                      },
                    ]}
                  />
                  <NeonText
                    size={13}
                    intensity={active ? 1 : 0.4}
                    style={{ color }}
                  >
                    {GLOW_LABELS[mode]}
                  </NeonText>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>
      )}

      {/* Location */}
      <GlassCard>
        <NeonText size={13} intensity={0.5} style={styles.sectionTitle}>
          LOCATION
        </NeonText>
        <View style={styles.locationRow}>
          <NeonIcon icon={MapPin} size={18} intensity={0.6} />
          <NeonText size={14} intensity={0.6}>
            {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
          </NeonText>
        </View>
        {locError && (
          <NeonText size={12} intensity={0.4} style={{ marginTop: 8, color: "#FF3131" }}>
            {locError}
          </NeonText>
        )}
      </GlassCard>

      {/* About */}
      <GlassCard>
        <NeonText size={13} intensity={0.5} style={styles.sectionTitle}>
          ABOUT
        </NeonText>
        <NeonText size={14} intensity={0.4}>
          Nox v1.0.0
        </NeonText>
        <NeonText size={12} intensity={0.3} style={{ marginTop: 4 }}>
          Celestial Alarm & Utility App
        </NeonText>
      </GlassCard>
    </ScrollView>
  );
}

const SLIDER_WIDTH = 280;

function handleSliderTouch(
  locationX: number,
  setDimmer: (v: number) => void
) {
  const ratio = Math.max(0, Math.min(1, locationX / SLIDER_WIDTH));
  setDimmer(ratio);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
  header: {
    letterSpacing: 4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  sectionTitle: {
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  toggleBtnActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dimmerSection: {
    gap: 6,
  },
  dimmerLabel: {
    letterSpacing: 2,
  },
  sliderTrack: {
    height: 6,
    width: SLIDER_WIDTH,
    maxWidth: "100%",
    borderRadius: 3,
    backgroundColor: "rgba(128,128,128,0.2)",
    overflow: "hidden",
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 3,
  },
  dimmerLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 150,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    elevation: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
