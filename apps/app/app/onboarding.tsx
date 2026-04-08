import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Card, colors, Section, spacing, StatChip } from "@life-admin/ui";
import { RequireAuth } from "../src/components/require-auth";
import { Screen } from "../src/components/screen";
import { useResponsiveLayout } from "../src/lib/layout";

export default function OnboardingScreen() {
  const { isTablet } = useResponsiveLayout();

  return (
    <RequireAuth>
      <Screen
        title="Your life, one calm operating system"
        subtitle="Life Admin unifies bills, renewals, appointments, important dates, shopping lists, and documents into one workflow-focused home."
        rightRail={
          <View style={{ flexDirection: isTablet ? "column" : "row", flexWrap: "wrap", gap: spacing.sm }}>
            <StatChip label="Platforms" value="Web + iOS + Android" />
            <StatChip label="AI mode" value="Assistive only" />
          </View>
        }
      >
        <Card style={{ gap: spacing.md }}>
          <Section
            eyebrow="What changes"
            title="Less hunting across apps"
            description="Capture something once, connect it to reminders and documents, then let AI suggest next steps while you stay in control."
          />
          <View style={{ flexDirection: isTablet ? "row" : "column", flexWrap: "wrap", gap: spacing.sm }}>
            {[
              "One inbox for everyday admin tasks",
              "Unified dashboard across all modules",
              "AI summaries and extraction with confirmation gates"
            ].map((line) => (
              <Text
                key={line}
                style={{
                  color: colors.slate,
                  fontSize: 16,
                  flexBasis: isTablet ? "48%" : "100%"
                }}
              >
                • {line}
              </Text>
            ))}
          </View>
          <Link href="/dashboard" asChild>
            <Pressable
              style={{
                backgroundColor: colors.accent,
                alignSelf: "flex-start",
                paddingHorizontal: isTablet ? spacing.lg : spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 999
              }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "800" }}>Open workspace</Text>
            </Pressable>
          </Link>
        </Card>
      </Screen>
    </RequireAuth>
  );
}
