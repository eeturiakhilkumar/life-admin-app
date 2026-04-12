import { Text, View } from "react-native";

import { Card, colors, Section, spacing } from "@life-admin/ui";

import { RequireAuth } from "../../src/components/require-auth";
import { Screen } from "../../src/components/screen";

export default function NotificationSettingsRoute() {
  return (
    <RequireAuth>
      <Screen
        title="Notification settings"
      >
        <Section
          eyebrow="Notifications"
          title="Reminder delivery plan"
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
    </RequireAuth>
  );
}
