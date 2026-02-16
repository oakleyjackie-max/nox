import { useState, useEffect, useRef, useCallback } from "react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { getItem, setItem } from "@/lib/storage";
import { STORAGE_KEYS, MAX_TIMERS } from "@/lib/constants";

export interface Timer {
  id: string;
  label: string;
  duration: number; // total ms
  remaining: number; // ms
  isRunning: boolean;
  completed: boolean;
}

interface PersistedTimer {
  id: string;
  label: string;
  duration: number;
  endTimestamp: number | null; // null if paused
  remaining: number;
}

export function useTimers() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Restore timers from storage on mount
  useEffect(() => {
    getItem<PersistedTimer[]>(STORAGE_KEYS.TIMERS).then((saved) => {
      if (!saved) return;
      const restored = saved.map((pt) => {
        if (pt.endTimestamp) {
          const remaining = Math.max(0, pt.endTimestamp - Date.now());
          return {
            id: pt.id,
            label: pt.label,
            duration: pt.duration,
            remaining,
            isRunning: remaining > 0,
            completed: remaining <= 0,
          };
        }
        return {
          id: pt.id,
          label: pt.label,
          duration: pt.duration,
          remaining: pt.remaining,
          isRunning: false,
          completed: false,
        };
      });
      setTimers(restored);
    });
  }, []);

  const persist = useCallback((updated: Timer[]) => {
    const toPersist: PersistedTimer[] = updated.map((t) => ({
      id: t.id,
      label: t.label,
      duration: t.duration,
      endTimestamp: t.isRunning ? Date.now() + t.remaining : null,
      remaining: t.remaining,
    }));
    setItem(STORAGE_KEYS.TIMERS, toPersist);
  }, []);

  const tick = useCallback((id: string) => {
    setTimers((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id || !t.isRunning) return t;
        const remaining = Math.max(0, t.remaining - 100);
        if (remaining <= 0) {
          // Timer complete
          const interval = intervalsRef.current.get(id);
          if (interval) {
            clearInterval(interval);
            intervalsRef.current.delete(id);
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Fire immediate local notification
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Timer Done",
              body: t.label || "Your timer has finished!",
              sound: true,
            },
            trigger: null,
          });
          return { ...t, remaining: 0, isRunning: false, completed: true };
        }
        return { ...t, remaining };
      });
      return updated;
    });
  }, []);

  const addTimer = useCallback(
    (label: string, durationMs: number) => {
      if (timers.length >= MAX_TIMERS) return;
      const id = crypto.randomUUID();
      const newTimer: Timer = {
        id,
        label,
        duration: durationMs,
        remaining: durationMs,
        isRunning: false,
        completed: false,
      };
      const updated = [...timers, newTimer];
      setTimers(updated);
      persist(updated);
    },
    [timers, persist]
  );

  const startTimer = useCallback(
    (id: string) => {
      const interval = setInterval(() => tick(id), 100);
      intervalsRef.current.set(id, interval);
      setTimers((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, isRunning: true, completed: false } : t
        );
        persist(updated);
        return updated;
      });
    },
    [tick, persist]
  );

  const pauseTimer = useCallback(
    (id: string) => {
      const interval = intervalsRef.current.get(id);
      if (interval) {
        clearInterval(interval);
        intervalsRef.current.delete(id);
      }
      setTimers((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, isRunning: false } : t
        );
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const resetTimer = useCallback(
    (id: string) => {
      const interval = intervalsRef.current.get(id);
      if (interval) {
        clearInterval(interval);
        intervalsRef.current.delete(id);
      }
      setTimers((prev) => {
        const updated = prev.map((t) =>
          t.id === id
            ? { ...t, remaining: t.duration, isRunning: false, completed: false }
            : t
        );
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const removeTimer = useCallback(
    (id: string) => {
      const interval = intervalsRef.current.get(id);
      if (interval) {
        clearInterval(interval);
        intervalsRef.current.delete(id);
      }
      setTimers((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        persist(updated);
        return updated;
      });
    },
    [persist]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
    };
  }, []);

  return {
    timers,
    addTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    removeTimer,
    canAdd: timers.length < MAX_TIMERS,
  };
}
