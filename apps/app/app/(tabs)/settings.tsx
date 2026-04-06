import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Card, colors, Section, spacing } from "@life-admin/ui";

import { Screen } from "../../src/components/screen";
import { registerForReminders } from "../../src/lib/notifications";
import { useAppStore } from "../../src/state/use-app-store";

export default function SettingsScreen() {
  const { aiAssistEnabled, privacyMode, notificationsEnabled, setAiAssistEnabled, setNotificationsEnabled } =
    useAppStore();

  return (
    <Screen title="Settings" subtitle="Privacy, notification consent, and release readiness live here from day one.">
      <Section
        eyebrow="Control"
        title="Store-ready app controls"
        description="These controls map directly to the privacy posture, notifications, and disclosure work needed for Firebase, App Store, and Play Store launches."
      />
      <View style={{ gap: spacing.md }}>
        <Card style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.ink }}>AI assistance</Text>
          <Text style={{ color: colors.slate }}>
            Assistive AI is {aiAssistEnabled ? "enabled" : "disabled"} and always requires user confirmation for writes.
          </Text>
          <Pressable onPress={() => setAiAssistEnabled(!aiAssistEnabled)}>
            <Text style={{ color: colors.accent, fontWeight: "700" }}>
              {aiAssistEnabled ? "Disable AI" : "Enable AI"}
            </Text>
          </Pressable>
        </Card>
        <Card style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.ink }}>Notification access</Text>
          <Text style={{ color: colors.slate }}>
            Notifications are {notificationsEnabled ? "ready" : "not granted"} for reminders and due-date nudges.
          </Text>
          <Pressable
            onPress={async () => {
              const granted = await registerForReminders();
              setNotificationsEnabled(granted);
            }}
          >
            <Text style={{ color: colors.accent, fontWeight: "700" }}>Request permissions</Text>
          </Pressable>
        </Card>
        <Card style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.ink }}>Privacy mode</Text>
          <Text style={{ color: colors.slate }}>Current mode: {privacyMode}</Text>
          <Link href="/settings/privacy" asChild>
            <Pressable>
              <Text style={{ color: colors.accent, fontWeight: "700" }}>Review privacy controls</Text>
            </Pressable>
          </Link>
        </Card>
        <Link href="/settings/notifications" asChild>
          <Pressable>
            <Text style={{ color: colors.ink, fontWeight: "700" }}>Open notification settings</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

