import React from "react";
import { View, FlatList, Switch, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Trash2 } from "lucide-react-native";
import { GlassCard } from "@/components/glass/GlassCard";
import { NeonText } from "@/components/ui/NeonText";
import { useTheme } from "@/context/ThemeContext";
import { ALARM_THEME_LABELS } from "@/lib/constants";
import type { Alarm } from "@/hooks/useAlarms";

interface AlarmListProps {
  alarms: Alarm[];
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

export function AlarmList({ alarms, onToggle, onEdit, onDelete }: AlarmListProps) {
  const { glowColor } = useTheme();

  if (alarms.length === 0) {
    return (
      <View style={styles.empty}>
        <NeonText size={18} intensity={0.4}>
          No alarms set
        </NeonText>
        <NeonText size={13} intensity={0.3}>
          Tap + to create one
        </NeonText>
      </View>
    );
  }

  return (
    <FlatList
      data={alarms}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable onPress={() => onEdit(item)}>
          <GlassCard style={styles.card}>
            <View style={styles.row}>
              <View style={styles.timeInfo}>
                <NeonText size={36} intensity={item.enabled ? 1 : 0.3}>
                  {item.hour.toString().padStart(2, "0")}:
                  {item.minute.toString().padStart(2, "0")}
                </NeonText>
                {item.label ? (
                  <NeonText size={13} intensity={0.5}>
                    {item.label}
                  </NeonText>
                ) : null}
                <NeonText size={11} intensity={0.3}>
                  {ALARM_THEME_LABELS[item.soundTheme]}
                  {item.repeat.length > 0
                    ? ` · ${item.repeat
                        .sort()
                        .map((d) => ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                        .join(", ")}`
                    : " · Once"}
                </NeonText>
              </View>
              <View style={styles.controls}>
                <Switch
                  value={item.enabled}
                  onValueChange={() => {
                    Haptics.selectionAsync();
                    onToggle(item.id);
                  }}
                  trackColor={{
                    false: "rgba(255,255,255,0.1)",
                    true: `${glowColor}60`,
                  }}
                  thumbColor={item.enabled ? glowColor : "#666"}
                />
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onDelete(item.id);
                  }}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={18} color="rgba(255,100,100,0.7)" />
                </Pressable>
              </View>
            </View>
          </GlassCard>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    padding: 16,
  },
  card: {},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeInfo: {
    gap: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteBtn: {
    padding: 8,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
