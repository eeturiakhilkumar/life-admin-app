import { Tabs } from "expo-router";
import { View } from "react-native";
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
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: "Inbox",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "mail" : "mail-outline"} size={24} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="modules"
          options={{
            title: "Modules",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
            )
          }}
        />
      </Tabs>
    </RequireAuth>
  );
}
