import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: "Inbox",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? "mail" : "mail-outline"} size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="modules"
          options={{
            title: "Modules",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? "search" : "search-outline"} size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
            )
          }}
        />
      </Tabs>
    </RequireAuth>
  );
}
