import React, { useState } from "react";
import { View, FlatList, TextInput, StyleSheet } from "react-native";
import { Play, Pause, RotateCcw, X } from "lucide-react-native";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/ui/NeonText";
import { GlowButton } from "@/components/ui/GlowButton";
import { useTheme } from "@/context/ThemeContext";
import { useTimers } from "@/hooks/useTimers";
import Svg, { Circle } from "react-native-svg";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimerStack() {
  const { timers, addTimer, startTimer, pauseTimer, resetTimer, removeTimer, canAdd } =
    useTimers();
  const { glowColor } = useTheme();
  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState("5");

  const handleAdd = () => {
    const mins = parseInt(newMinutes, 10);
    if (isNaN(mins) || mins <= 0) return;
    addTimer(newLabel || `Timer ${timers.length + 1}`, mins * 60 * 1000);
    setNewLabel("");
    setNewMinutes("5");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {canAdd && (
        <GlassCard intensity={25} style={styles.addCard}>
          <View style={styles.addRow}>
            <TextInput
              placeholder="Name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newLabel}
              onChangeText={setNewLabel}
              style={[styles.input, { borderColor: glowColor, color: glowColor, flex: 1 }]}
            />
            <TextInput
              placeholder="Min"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newMinutes}
              onChangeText={setNewMinutes}
              keyboardType="numeric"
              style={[styles.input, { borderColor: glowColor, color: glowColor, width: 60 }]}
            />
            <GlowButton label="Add" size="sm" variant="filled" onPress={handleAdd} />
          </View>
        </GlassCard>
      )}

      <FlatList
        data={timers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const progress = item.duration > 0 ? item.remaining / item.duration : 0;
          const circumference = 2 * Math.PI * 22;
          const strokeDashoffset = circumference * (1 - progress);

          return (
            <GlassCard intensity={25} style={styles.timerCard}>
              <View style={styles.timerRow}>
                <Svg width={52} height={52}>
                  <Circle
                    cx={26}
                    cy={26}
                    r={22}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={3}
                    fill="none"
                  />
                  <Circle
                    cx={26}
                    cy={26}
                    r={22}
                    stroke={item.completed ? "#FF3131" : glowColor}
                    strokeWidth={3}
                    fill="none"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 26 26)`}
                  />
                </Svg>
                <View style={styles.timerInfo}>
                  <NeonText size={13} intensity={0.5}>
                    {item.label}
                  </NeonText>
                  <NeonText size={28} intensity={item.completed ? 0.4 : 1}>
                    {item.completed ? "Done!" : formatMs(item.remaining)}
                  </NeonText>
                </View>
                <View style={styles.timerActions}>
                  {item.isRunning ? (
                    <Pressable onPress={() => pauseTimer(item.id)} style={styles.iconBtn}>
                      <Pause size={20} color={glowColor} />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => startTimer(item.id)}
                      style={styles.iconBtn}
                      disabled={item.completed}
                    >
                      <Play size={20} color={item.completed ? "rgba(255,255,255,0.2)" : glowColor} />
                    </Pressable>
                  )}
                  <Pressable onPress={() => resetTimer(item.id)} style={styles.iconBtn}>
                    <RotateCcw size={18} color="rgba(255,255,255,0.5)" />
                  </Pressable>
                  <Pressable onPress={() => removeTimer(item.id)} style={styles.iconBtn}>
                    <X size={18} color="rgba(255,100,100,0.6)" />
                  </Pressable>
                </View>
              </View>
            </GlassCard>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addCard: {
    marginHorizontal: 8,
    marginBottom: 12,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    fontFamily: "SpaceMono",
    fontSize: 13,
  },
  list: {
    gap: 8,
    paddingHorizontal: 8,
  },
  timerCard: {},
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timerInfo: {
    flex: 1,
    gap: 2,
  },
  timerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
});
