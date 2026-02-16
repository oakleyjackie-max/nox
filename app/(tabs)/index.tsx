import React, { useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Platform, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RefreshCw } from "lucide-react-native";
import { DigitalClock } from "@/components/clock/DigitalClock";
import { MoonPhase } from "@/components/clock/MoonPhase";
import { SunTimesDisplay } from "@/components/clock/SunTimes";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/ui/NeonText";
import { useSkySync } from "@/hooks/useSkySync";
import { useTheme } from "@/context/ThemeContext";

/** Format minutes-of-day (0-1439) to HH:MM string */
function formatMinutes(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

/** Get current real-time as minutes of day */
function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export default function ClockScreen() {
  const insets = useSafeAreaInsets();
  const { sunTimes, moon } = useSkySync();
  const { glowColor, skyTimeOverride, setSkyTimeOverride } = useTheme();

  const isOverrideActive = skyTimeOverride !== null;
  const sliderValue = skyTimeOverride ?? nowMinutes();

  // --- Sky time slider track ---
  const trackRef = useRef<View>(null);
  const trackLayoutRef = useRef({ x: 0, width: 280 });

  const remeasure = () => {
    if (Platform.OS === "web" && trackRef.current) {
      const node = trackRef.current as any;
      if (node && typeof node.getBoundingClientRect === "function") {
        const rect = node.getBoundingClientRect();
        trackLayoutRef.current.x = rect.left;
        trackLayoutRef.current.width = rect.width;
      }
    }
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    trackLayoutRef.current.width = e.nativeEvent.layout.width;
    remeasure();
  };

  const handleSliderInteraction = useCallback(
    (pageXOrLocationX: number, isWeb: boolean) => {
      if (isWeb) {
        remeasure();
        const { x, width } = trackLayoutRef.current;
        if (width <= 0) return;
        const ratio = Math.max(0, Math.min(1, (pageXOrLocationX - x) / width));
        setSkyTimeOverride(Math.round(ratio * 1439));
      } else {
        const ratio = Math.max(
          0,
          Math.min(1, pageXOrLocationX / trackLayoutRef.current.width)
        );
        setSkyTimeOverride(Math.round(ratio * 1439));
      }
    },
    [setSkyTimeOverride]
  );

  const resetToNow = useCallback(() => {
    setSkyTimeOverride(null);
  }, [setSkyTimeOverride]);

  const normalizedSlider = sliderValue / 1439;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.clockArea}>
        <DigitalClock />
        {isOverrideActive && (
          <NeonText size={11} intensity={0.4} style={styles.simLabel}>
            SKY SIMULATION
          </NeonText>
        )}
      </View>

      {/* Sky Time Slider */}
      <GlassCard style={styles.skySliderCard}>
        <View style={styles.skySliderHeader}>
          <NeonText size={11} intensity={0.5} style={styles.skySliderLabel}>
            SKY TIME
          </NeonText>
          <NeonText size={14} intensity={0.8}>
            {formatMinutes(sliderValue)}
          </NeonText>
          {isOverrideActive && (
            <Pressable onPress={resetToNow} style={styles.resetBtn}>
              <RefreshCw size={14} color={glowColor} />
              <NeonText size={10} intensity={0.6}>
                Reset
              </NeonText>
            </Pressable>
          )}
        </View>
        <View
          ref={trackRef}
          style={styles.skySliderTrack}
          onLayout={handleLayout}
        >
          <View
            style={[
              styles.skySliderFill,
              {
                width: `${normalizedSlider * 100}%`,
                backgroundColor: glowColor,
              },
            ]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={(e) => {
              if (Platform.OS === "web") {
                handleSliderInteraction((e.nativeEvent as any).pageX, true);
              } else {
                handleSliderInteraction(e.nativeEvent.locationX, false);
              }
            }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              if (Platform.OS === "web") {
                handleSliderInteraction((e.nativeEvent as any).pageX, true);
              } else {
                handleSliderInteraction(e.nativeEvent.locationX, false);
              }
            }}
            onResponderMove={(e) => {
              if (Platform.OS === "web") {
                handleSliderInteraction((e.nativeEvent as any).pageX, true);
              } else {
                handleSliderInteraction(e.nativeEvent.locationX, false);
              }
            }}
          />
        </View>
        {/* Time scale labels */}
        <View style={styles.timeScale}>
          <NeonText size={9} intensity={0.3}>12 AM</NeonText>
          <NeonText size={9} intensity={0.3}>6 AM</NeonText>
          <NeonText size={9} intensity={0.3}>12 PM</NeonText>
          <NeonText size={9} intensity={0.3}>6 PM</NeonText>
          <NeonText size={9} intensity={0.3}>12 AM</NeonText>
        </View>
      </GlassCard>

      <View style={styles.infoRow}>
        <GlassCard style={styles.infoCard}>
          <MoonPhase
            illumination={moon.illumination}
            phaseName={moon.phaseName}
            phase={moon.phase}
          />
        </GlassCard>

        <GlassCard style={styles.infoCard}>
          <SunTimesDisplay
            sunrise={sunTimes.sunrise}
            sunset={sunTimes.sunset}
          />
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  clockArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  simLabel: {
    letterSpacing: 3,
    marginTop: 4,
  },
  skySliderCard: {
    marginBottom: 16,
  },
  skySliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  skySliderLabel: {
    letterSpacing: 2,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  skySliderTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    position: "relative",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  skySliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  timeScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
  },
});
