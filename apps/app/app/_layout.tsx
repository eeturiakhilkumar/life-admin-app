import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { AppProviders } from "../src/providers/app-providers";

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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

