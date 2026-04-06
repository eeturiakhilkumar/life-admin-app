import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "../src/providers/app-providers";

export default function RootLayout() {
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

