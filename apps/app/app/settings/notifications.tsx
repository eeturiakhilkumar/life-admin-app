import { Text, View } from "react-native";

import { Card, colors, Section, spacing } from "@life-admin/ui";

import { Screen } from "../../src/components/screen";

export default function NotificationSettingsRoute() {
  return (
    <Screen
      title="Notification settings"
      subtitle="Reminders span bills, appointments, renewals, and important dates, so notification plumbing is a first-class release concern."
    >
      <Section
        eyebrow="Notifications"
        title="Reminder delivery plan"
        description="Expo notifications cover local permissions today and can extend to push reminders as backend jobs come online."
      />
      <View style={{ gap: spacing.md }}>
        {[
          "Local permission request and OS-level opt-in",
          "Scheduled reminder jobs from Supabase or Trigger.dev",
          "Environment-specific push credentials for staging and production"
        ].map((item) => (
          <Card key={item}>
            <Text style={{ color: colors.slate, lineHeight: 22 }}>{item}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

