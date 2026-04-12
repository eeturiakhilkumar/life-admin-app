import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";

import { AppProviders } from "../src/providers/app-providers";

export default function RootLayout() {
  useEffect(() => {
    void Font.loadAsync(Ionicons.font);
  }, []);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modules/bills" />
        <Stack.Screen name="modules/appointments" />
        <Stack.Screen name="modules/renewals" />
        <Stack.Screen name="modules/important-dates" />
        <Stack.Screen name="modules/shopping-lists" />
        <Stack.Screen name="modules/documents" />
        <Stack.Screen name="settings/privacy" />
        <Stack.Screen name="settings/notifications" />
      </Stack>
    </AppProviders>
  );
}

