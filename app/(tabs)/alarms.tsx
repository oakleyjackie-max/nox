import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { AlarmList } from "@/components/alarms/AlarmList";
import { AlarmEditor } from "@/components/alarms/AlarmEditor";
import { NeonText } from "@/components/ui/NeonText";
import { useTheme } from "@/context/ThemeContext";
import { useAlarms, Alarm } from "@/hooks/useAlarms";
import { requestNotificationPermissions, addNotificationReceivedListener } from "@/lib/notifications";
import * as Haptics from "expo-haptics";

function safeHaptic(fn: () => void) {
  if (Platform.OS !== "web") {
    try { fn(); } catch {}
  }
}

export default function AlarmsScreen() {
  const insets = useSafeAreaInsets();
  const { glowColor } = useTheme();
  const { alarms, addAlarm, updateAlarm, removeAlarm, toggleAlarm } = useAlarms();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    const sub = addNotificationReceivedListener(() => {
      safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    });
    return () => sub.remove();
  }, []);

  const handleEdit = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setEditorVisible(true);
  };

  const handleSave = async (data: {
    label: string;
    hour: number;
    minute: number;
    repeat: number[];
    soundTheme: any;
    vibrate: boolean;
    enabled: boolean;
  }) => {
    if (editingAlarm) {
      await updateAlarm(editingAlarm.id, data);
    } else {
      await addAlarm(data);
    }
    setEditingAlarm(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <NeonText size={13} intensity={0.4} style={styles.header}>
        ALARMS
      </NeonText>

      <AlarmList
        alarms={alarms}
        onToggle={toggleAlarm}
        onEdit={handleEdit}
        onDelete={removeAlarm}
      />

      {/* FAB */}
      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: `${glowColor}20`,
            borderColor: glowColor,
            shadowColor: glowColor,
            bottom: insets.bottom + 80,
          },
        ]}
        onPress={() => {
          setEditingAlarm(null);
          setEditorVisible(true);
          safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
        }}
      >
        <Plus size={28} color={glowColor} />
      </Pressable>

      <AlarmEditor
        visible={editorVisible}
        onClose={() => {
          setEditorVisible(false);
          setEditingAlarm(null);
        }}
        onSave={handleSave}
        initial={
          editingAlarm
            ? {
                label: editingAlarm.label,
                hour: editingAlarm.hour,
                minute: editingAlarm.minute,
                repeat: editingAlarm.repeat,
                soundTheme: editingAlarm.soundTheme,
                vibrate: editingAlarm.vibrate,
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    letterSpacing: 4,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 12,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowRadius: 12,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
  },
});
