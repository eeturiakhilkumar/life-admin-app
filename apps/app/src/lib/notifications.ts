import { Platform } from "react-native";

let notificationSetupPromise: Promise<void> | null = null;

const ensureNotificationsModule = async () => {
  if (Platform.OS === "web") {
    return null;
  }

  const Notifications = await import("expo-notifications");

  if (!notificationSetupPromise) {
    notificationSetupPromise = (async () => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true
        })
      });
    })();
  }

  await notificationSetupPromise;
  return Notifications;
};

export const registerForReminders = async () => {
  const Notifications = await ensureNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  const status = existing === "granted" ? existing : (await Notifications.requestPermissionsAsync()).status;

  return status === "granted";
};
