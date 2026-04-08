import { Tabs } from "expo-router";

import { colors } from "@life-admin/ui";
import { RequireAuth } from "../../src/components/require-auth";

export default function TabsLayout() {
  return (
    <RequireAuth>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.slate,
          tabBarStyle: {
            backgroundColor: colors.panel
          }
        }}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="inbox" options={{ title: "Inbox" }} />
        <Tabs.Screen name="modules" options={{ title: "Modules" }} />
        <Tabs.Screen name="search" options={{ title: "Search" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </RequireAuth>
  );
}
