import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NeonText } from "@/components/ui/NeonText";

export function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <NeonText size={96} intensity={1.5} style={styles.digit}>
          {hours}
        </NeonText>
        <NeonText size={96} intensity={1.5} style={styles.colon}>
          :
        </NeonText>
        <NeonText size={96} intensity={1.5} style={styles.digit}>
          {minutes}
        </NeonText>
      </View>
      <NeonText size={36} intensity={0.8} style={styles.seconds}>
        {seconds}
      </NeonText>
      <NeonText size={14} intensity={0.5} style={styles.date}>
        {time.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </NeonText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  digit: {
    fontVariant: ["tabular-nums"],
  },
  colon: {
    marginHorizontal: 4,
  },
  seconds: {
    marginTop: -8,
    fontVariant: ["tabular-nums"],
  },
  date: {
    marginTop: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
