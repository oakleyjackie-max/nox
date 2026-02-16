import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DigitalClock } from "@/components/clock/DigitalClock";
import { MoonPhase } from "@/components/clock/MoonPhase";
import { SunTimesDisplay } from "@/components/clock/SunTimes";
import { GlassCard } from "@/components/glass/GlassCard";
import { useSkySync } from "@/hooks/useSkySync";

export default function ClockScreen() {
  const insets = useSafeAreaInsets();
  const { sunTimes, moon } = useSkySync();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.clockArea}>
        <DigitalClock />
      </View>

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
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
  },
});
