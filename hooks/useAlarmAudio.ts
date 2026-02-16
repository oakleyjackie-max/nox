import { useRef, useState, useCallback } from "react";
import { Audio } from "expo-av";
import { CRESCENDO } from "@/lib/constants";
import { getToneUri } from "@/lib/toneGenerator";
import type { AlarmTheme } from "@/lib/constants";

export function useAlarmAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(async (theme: AlarmTheme) => {
    try {
      // Stop any existing playback first
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const uri = await getToneUri(theme);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          volume: CRESCENDO.START_VOLUME,
          isLooping: true,
          shouldPlay: true,
        }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      // Crescendo: gradually increase volume
      intervalRef.current = setInterval(async () => {
        if (!soundRef.current) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.volume < CRESCENDO.MAX_VOLUME) {
            await soundRef.current.setVolumeAsync(
              Math.min(status.volume + CRESCENDO.STEP, CRESCENDO.MAX_VOLUME)
            );
          } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        } catch {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, CRESCENDO.INTERVAL_MS);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }, []);

  const stop = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { play, stop, isPlaying };
}
