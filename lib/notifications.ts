import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
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
  label: string
): Promise<string[]> {
  const notifIds: string[] = [];

  if (repeat.length === 0) {
    // One-shot: schedule for the next occurrence of this time
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Nox Alarm",
        body: label || "Time to wake up!",
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
    // Repeating: one notification per day of week
    for (const weekday of repeat) {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nox Alarm",
          body: label || "Time to wake up!",
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
  for (const id of notifIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}

export async function cancelAllAlarms(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}
