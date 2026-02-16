import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { NeonText } from "@/components/ui/NeonText";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/glass/GlassCard";
import { useStopwatch } from "@/hooks/useStopwatch";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centis
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
}

export function Stopwatch() {
  const { elapsed, laps, isRunning, start, stop, reset, lap } = useStopwatch();

  return (
    <View style={styles.container}>
      <NeonText size={48} intensity={1.3} style={styles.display}>
        {formatMs(elapsed)}
      </NeonText>

      <View style={styles.buttons}>
        {!isRunning && elapsed === 0 ? (
          <GlowButton label="Start" variant="filled" size="lg" onPress={start} />
        ) : isRunning ? (
          <>
            <GlowButton label="Lap" variant="outline" size="md" onPress={lap} />
            <GlowButton label="Stop" variant="filled" size="md" onPress={stop} />
          </>
        ) : (
          <>
            <GlowButton label="Reset" variant="outline" size="md" onPress={reset} />
            <GlowButton label="Resume" variant="filled" size="md" onPress={start} />
          </>
        )}
      </View>

      {laps.length > 0 && (
        <FlatList
          data={laps}
          keyExtractor={(_, i) => i.toString()}
          style={styles.laps}
          renderItem={({ item, index }) => (
            <GlassCard intensity={20} style={styles.lapCard}>
              <View style={styles.lapRow}>
                <NeonText size={13} intensity={0.5}>
                  Lap {laps.length - index}
                </NeonText>
                <NeonText size={16} intensity={0.8}>
                  {formatMs(item)}
                </NeonText>
              </View>
            </GlassCard>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 24,
  },
  display: {
    fontVariant: ["tabular-nums"],
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  laps: {
    width: "100%",
  },
  lapCard: {
    marginBottom: 6,
  },
  lapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
