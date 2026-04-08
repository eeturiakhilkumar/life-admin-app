import { Text, View } from "react-native";

import { Card, colors, Section, spacing } from "@life-admin/ui";

import { RequireAuth } from "../../src/components/require-auth";
import { Screen } from "../../src/components/screen";

export default function PrivacySettingsRoute() {
  return (
    <RequireAuth>
      <Screen
        title="Privacy controls"
        subtitle="Server-side AI, explicit confirmation for writes, and clear data boundaries are part of the product contract."
      >
        <Section
          eyebrow="Privacy"
          title="Strong privacy by default"
          description="Only the minimum necessary document content should leave the client, and sensitive actions always require confirmation."
        />
        <View style={{ gap: spacing.md }}>
          {[
            "AI runs are logged for audit and retry visibility.",
            "Users review structured extraction suggestions before save.",
            "Document uploads can be linked without automatic downstream mutations."
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
