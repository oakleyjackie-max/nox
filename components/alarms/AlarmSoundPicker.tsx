import React, { useRef, useState, useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { NeonText } from "@/components/ui/NeonText";
import { useTheme } from "@/context/ThemeContext";
import { ALARM_THEMES, ALARM_THEME_LABELS, AlarmTheme } from "@/lib/constants";
import { getToneUri } from "@/lib/toneGenerator";

interface AlarmSoundPickerProps {
  selected: AlarmTheme;
  onSelect: (theme: AlarmTheme) => void;
}

export function AlarmSoundPicker({ selected, onSelect }: AlarmSoundPickerProps) {
  const { glowColor, isDark, colors } = useTheme();
  const [previewing, setPreviewing] = useState<AlarmTheme | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const stopPreview = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setPreviewing(null);
  }, []);

  const togglePreview = useCallback(
    async (theme: AlarmTheme) => {
      Haptics.selectionAsync();

      // If already previewing this theme, stop it
      if (previewing === theme) {
        await stopPreview();
        return;
      }

      // Stop any current preview
      await stopPreview();

      try {
        const uri = await getToneUri(theme);
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true, isLooping: true, volume: 0.5 }
        );
        soundRef.current = sound;
        setPreviewing(theme);

        // Auto-stop after 4 seconds
        setTimeout(() => {
          stopPreview();
        }, 4000);
      } catch (e) {
        console.warn("Preview error:", e);
        setPreviewing(null);
      }
    },
    [previewing, stopPreview]
  );

  return (
    <View style={styles.container}>
      <NeonText size={13} intensity={0.5} style={styles.label}>
        ALARM SOUND
      </NeonText>
      <View style={styles.row}>
        {ALARM_THEMES.map((theme) => {
          const isSelected = selected === theme;
          const isPreviewing = previewing === theme;

          return (
            <Pressable
              key={theme}
              style={[
                styles.chip,
                {
                  borderColor: isSelected ? (isDark ? glowColor : colors.text) : colors.border,
                  backgroundColor: isSelected ? `${isDark ? glowColor : colors.text}15` : "transparent",
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(theme);
              }}
            >
              <NeonText
                size={13}
                intensity={isSelected ? 0.9 : 0.4}
              >
                {ALARM_THEME_LABELS[theme]}
              </NeonText>

              {/* Preview button */}
              <Pressable
                onPress={() => togglePreview(theme)}
                hitSlop={8}
                style={[
                  styles.previewBtn,
                  {
                    borderColor: isPreviewing
                      ? (isDark ? glowColor : colors.text)
                      : colors.border,
                    backgroundColor: isPreviewing
                      ? `${isDark ? glowColor : colors.text}25`
                      : "transparent",
                  },
                ]}
              >
                <NeonText size={10} intensity={isPreviewing ? 1 : 0.5}>
                  {isPreviewing ? "■" : "▶"}
                </NeonText>
              </Pressable>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    letterSpacing: 2,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
