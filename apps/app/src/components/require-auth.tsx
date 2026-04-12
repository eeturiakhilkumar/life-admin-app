import type { PropsWithChildren, ReactElement } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Redirect } from "expo-router";

import { colors, spacing } from "@life-admin/ui";
import { useAuth } from "../providers/auth-provider";

export const RequireAuth = ({ children }: PropsWithChildren): ReactElement => {
  const { isInitializing, session, profile } = useAuth();

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          padding: spacing.lg,
          gap: spacing.sm
        }}
      >
        <ActivityIndicator color={colors.accent} />
        <Text style={{ color: colors.slate }}>Checking your secure session...</Text>
      </View>
    );
  }

  if (!session || !profile) {
    return <Redirect href="/auth/sign-in" />;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};
