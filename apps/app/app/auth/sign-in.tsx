import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Card, colors, Section, spacing } from "@life-admin/ui";
import { Screen } from "../../src/components/screen";

const authMethods = ["Email magic link", "Continue with Google", "Continue with Apple"];

export default function SignInScreen() {
  return (
    <Screen title="Sign in securely" subtitle="V1 auth supports email, Google, and Apple with server-side session handling in Supabase.">
      <Card style={{ gap: spacing.md }}>
        <Section
          eyebrow="Auth"
          title="Choose an account path"
          description="Apple sign-in is included from the beginning so iOS distribution stays store-compliant."
        />
        {authMethods.map((label) => (
          <Pressable
            key={label}
            style={{
              backgroundColor: label.includes("Apple") ? colors.ink : "#ffffff",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.mist,
              padding: spacing.md
            }}
          >
            <Text style={{ color: label.includes("Apple") ? "#ffffff" : colors.ink, fontWeight: "700" }}>{label}</Text>
          </Pressable>
        ))}
        <Link href="/(tabs)/dashboard" asChild>
          <Pressable
            style={{
              alignSelf: "flex-start",
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm
            }}
          >
            <Text style={{ color: colors.accent, fontWeight: "700" }}>Skip to MVP shell</Text>
          </Pressable>
        </Link>
      </Card>
    </Screen>
  );
}

