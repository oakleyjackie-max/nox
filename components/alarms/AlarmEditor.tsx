import React, { useState } from "react";
import { View, Modal, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/ui/NeonText";
import { GlowButton } from "@/components/ui/GlowButton";
import { AlarmSoundPicker } from "./AlarmSoundPicker";
import { useTheme } from "@/context/ThemeContext";
import type { AlarmTheme } from "@/lib/constants";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface AlarmEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (alarm: {
    label: string;
    hour: number;
    minute: number;
    repeat: number[];
    soundTheme: AlarmTheme;
    vibrate: boolean;
    enabled: boolean;
  }) => void;
  initial?: {
    label: string;
    hour: number;
    minute: number;
    repeat: number[];
    soundTheme: AlarmTheme;
    vibrate: boolean;
  };
}

export function AlarmEditor({ visible, onClose, onSave, initial }: AlarmEditorProps) {
  const { glowColor, isDark, colors } = useTheme();
  const [hour, setHour] = useState(initial?.hour ?? 7);
  const [minute, setMinute] = useState(initial?.minute ?? 0);
  const [label, setLabel] = useState(initial?.label ?? "");
  const [repeat, setRepeat] = useState<number[]>(initial?.repeat ?? []);
  const [soundTheme, setSoundTheme] = useState<AlarmTheme>(initial?.soundTheme ?? "nebula");
  const [vibrate, setVibrate] = useState(initial?.vibrate ?? true);

  const toggleDay = (dayIndex: number) => {
    const day = dayIndex + 1; // 1=Sun
    setRepeat((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const adjustHour = (delta: number) => {
    setHour((h) => (h + delta + 24) % 24);
    Haptics.selectionAsync();
  };

  const adjustMinute = (delta: number) => {
    setMinute((m) => (m + delta + 60) % 60);
    Haptics.selectionAsync();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={30} tint={colors.blurTint} style={StyleSheet.absoluteFill} />
        <GlassCard style={styles.editor}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <NeonText size={20} intensity={1} style={styles.title}>
              Set Alarm
            </NeonText>

            {/* Time Picker */}
            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <Pressable onPress={() => adjustHour(1)} style={styles.arrow}>
                  <NeonText size={24} intensity={0.6}>
                    ▲
                  </NeonText>
                </Pressable>
                <NeonText size={64} intensity={1.3}>
                  {hour.toString().padStart(2, "0")}
                </NeonText>
                <Pressable onPress={() => adjustHour(-1)} style={styles.arrow}>
                  <NeonText size={24} intensity={0.6}>
                    ▼
                  </NeonText>
                </Pressable>
              </View>
              <NeonText size={64} intensity={1.3}>
                :
              </NeonText>
              <View style={styles.timeCol}>
                <Pressable onPress={() => adjustMinute(1)} style={styles.arrow}>
                  <NeonText size={24} intensity={0.6}>
                    ▲
                  </NeonText>
                </Pressable>
                <NeonText size={64} intensity={1.3}>
                  {minute.toString().padStart(2, "0")}
                </NeonText>
                <Pressable onPress={() => adjustMinute(-1)} style={styles.arrow}>
                  <NeonText size={24} intensity={0.6}>
                    ▼
                  </NeonText>
                </Pressable>
              </View>
            </View>

            {/* Label */}
            <TextInput
              placeholder="Alarm label"
              placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
              value={label}
              onChangeText={setLabel}
              maxLength={100}
              style={[styles.input, { borderColor: colors.text, color: colors.text }]}
            />

            {/* Day Picker */}
            <View style={styles.daysRow}>
              {DAYS.map((day, i) => {
                const active = repeat.includes(i + 1);
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(i)}
                    style={[
                      styles.dayChip,
                      {
                        borderColor: active ? colors.text : colors.border,
                        backgroundColor: active ? `${colors.text}20` : "transparent",
                      },
                    ]}
                  >
                    <NeonText size={12} intensity={active ? 0.9 : 0.4}>
                      {day}
                    </NeonText>
                  </Pressable>
                );
              })}
            </View>

            {/* Sound Picker */}
            <AlarmSoundPicker selected={soundTheme} onSelect={setSoundTheme} />

            {/* Actions */}
            <View style={styles.actions}>
              <GlowButton label="Cancel" variant="outline" onPress={onClose} />
              <GlowButton
                label="Save"
                variant="filled"
                onPress={() => {
                  onSave({
                    label,
                    hour,
                    minute,
                    repeat,
                    soundTheme,
                    vibrate,
                    enabled: true,
                  });
                  onClose();
                }}
              />
            </View>
          </ScrollView>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  editor: {
    width: "100%",
    maxWidth: 480,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  timeCol: {
    alignItems: "center",
  },
  arrow: {
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontFamily: "SpaceMono",
    fontSize: 14,
    marginBottom: 16,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
  },
});
