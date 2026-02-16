import { useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { scheduleAlarm, cancelAlarm } from "@/lib/notifications";
import type { AlarmTheme } from "@/lib/constants";

export interface Alarm {
  id: string;
  label: string;
  hour: number;
  minute: number;
  repeat: number[]; // day of week (1=Sun..7=Sat)
  enabled: boolean;
  soundTheme: AlarmTheme;
  vibrate: boolean;
  notifIds: string[];
}

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getItem<Alarm[]>(STORAGE_KEYS.ALARMS).then((saved) => {
      if (saved) setAlarms(saved);
      setLoaded(true);
    });
  }, []);

  const persist = useCallback(async (updated: Alarm[]) => {
    setAlarms(updated);
    await setItem(STORAGE_KEYS.ALARMS, updated);
  }, []);

  const addAlarm = useCallback(
    async (alarm: Omit<Alarm, "id" | "notifIds">) => {
      const id = crypto.randomUUID();
      let notifIds: string[] = [];
      if (alarm.enabled) {
        notifIds = await scheduleAlarm(id, alarm.hour, alarm.minute, alarm.repeat, alarm.label);
      }
      const newAlarm: Alarm = { ...alarm, id, notifIds };
      await persist([...alarms, newAlarm]);
      return newAlarm;
    },
    [alarms, persist]
  );

  const updateAlarm = useCallback(
    async (id: string, updates: Partial<Omit<Alarm, "id">>) => {
      const updated = await Promise.all(
        alarms.map(async (a) => {
          if (a.id !== id) return a;
          const merged = { ...a, ...updates };

          // Reschedule if time/repeat/enabled changed
          if (
            updates.hour !== undefined ||
            updates.minute !== undefined ||
            updates.repeat !== undefined ||
            updates.enabled !== undefined
          ) {
            await cancelAlarm(a.notifIds);
            if (merged.enabled) {
              merged.notifIds = await scheduleAlarm(
                id,
                merged.hour,
                merged.minute,
                merged.repeat,
                merged.label
              );
            } else {
              merged.notifIds = [];
            }
          }
          return merged;
        })
      );
      await persist(updated);
    },
    [alarms, persist]
  );

  const removeAlarm = useCallback(
    async (id: string) => {
      const alarm = alarms.find((a) => a.id === id);
      if (alarm) await cancelAlarm(alarm.notifIds);
      await persist(alarms.filter((a) => a.id !== id));
    },
    [alarms, persist]
  );

  const toggleAlarm = useCallback(
    async (id: string) => {
      const alarm = alarms.find((a) => a.id === id);
      if (!alarm) return;
      await updateAlarm(id, { enabled: !alarm.enabled });
    },
    [alarms, updateAlarm]
  );

  return { alarms, loaded, addAlarm, updateAlarm, removeAlarm, toggleAlarm };
}
