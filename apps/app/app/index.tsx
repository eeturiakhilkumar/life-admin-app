import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { colors, spacing } from "@life-admin/ui";
import { useAuth } from "../src/providers/auth-provider";

export default function IndexRoute() {
  const { isInitializing, session, profile } = useAuth();

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          gap: spacing.sm
        }}
      >
        <ActivityIndicator color={colors.accent} />
        <Text style={{ color: colors.slate }}>Preparing Life Admin...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/sign-in" />;
  }

  const isProfileIncomplete = !profile?.displayName || !profile?.email || !profile?.phoneNumber;
  if (isProfileIncomplete) {
    return <Redirect href="/auth/sign-in" />;
  }

  return <Redirect href="/dashboard" />;
}
