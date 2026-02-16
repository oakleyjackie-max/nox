import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getRandomMessage, type SassLevel } from "./wakeUpMessages";

// ── Web alarm scheduler ────────────────────────────────────────
// On web, expo-notifications can't schedule DATE/WEEKLY triggers.
// We use setTimeout and the browser Notification API instead.

type WebAlarmCallback = (title: string, body: string, alarmId: string) => void;

const webAlarmTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
let webAlarmCallback: WebAlarmCallback | null = null;

/** Register a callback that fires when a web alarm triggers (used by _layout.tsx) */
export function setWebAlarmCallback(cb: WebAlarmCallback | null) {
  webAlarmCallback = cb;
}

function fireWebAlarm(title: string, body: string, alarmId: string) {
  // Browser Notification API
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.png" });
  }
  // In-app callback (for TTS banner, etc.)
  webAlarmCallback?.(title, body, alarmId);
}

function scheduleWebTimeout(
  id: string,
  hour: number,
  minute: number,
  title: string,
  body: string,
  alarmId: string
): string {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const ms = target.getTime() - now.getTime();
  const timeoutId = id + "_" + Date.now();

  const handle = setTimeout(() => {
    fireWebAlarm(title, body, alarmId);
    webAlarmTimeouts.delete(timeoutId);
  }, ms);

  webAlarmTimeouts.set(timeoutId, handle);
  return timeoutId;
}

// ── Native notification handler ─────────────────────────────

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const result = await Notification.requestPermission();
    return result === "granted";
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleAlarm(
  id: string,
  hour: number,
  minute: number,
  repeat: number[], // days of week: 1=Sunday, 2=Monday, etc.
  label: string,
  wakeMessagesEnabled?: boolean,
  sassLevel?: SassLevel
): Promise<string[]> {
  const notifIds: string[] = [];

  const getBody = () => {
    if (wakeMessagesEnabled && sassLevel) {
      return getRandomMessage(sassLevel);
    }
    return label || "Time to wake up!";
  };

  // ── Web path ──
  if (Platform.OS === "web") {
    if (repeat.length === 0) {
      const webId = scheduleWebTimeout(id, hour, minute, "Nox Alarm", getBody(), id);
      notifIds.push(webId);
    } else {
      // For repeating alarms on web, schedule the next occurrence
      // (can't truly repeat without service workers, but schedule next hit)
      const webId = scheduleWebTimeout(id, hour, minute, "Nox Alarm", getBody(), id);
      notifIds.push(webId);
    }
    return notifIds;
  }

  // ── Native path ──
  if (repeat.length === 0) {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Nox Alarm",
        body: getBody(),
        data: { alarmId: id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: target,
      },
    });
    notifIds.push(notifId);
  } else {
    for (const weekday of repeat) {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nox Alarm",
          body: getBody(),
          data: { alarmId: id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
        },
      });
      notifIds.push(notifId);
    }
  }

  return notifIds;
}

export async function cancelAlarm(notifIds: string[]): Promise<void> {
  if (Platform.OS === "web") {
    for (const id of notifIds) {
      const handle = webAlarmTimeouts.get(id);
      if (handle) {
        clearTimeout(handle);
        webAlarmTimeouts.delete(id);
      }
    }
    return;
  }
  for (const id of notifIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

export async function cancelAllAlarms(): Promise<void> {
  if (Platform.OS === "web") {
    webAlarmTimeouts.forEach((handle) => clearTimeout(handle));
    webAlarmTimeouts.clear();
    return;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  if (Platform.OS === "web") {
    // No-op on web — web alarms use the callback system instead
    return { remove: () => {} };
  }
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  if (Platform.OS === "web") {
    return { remove: () => {} };
  }
  return Notifications.addNotificationReceivedListener(callback);
}
