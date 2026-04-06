import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";

import { Section, spacing, StatChip } from "@life-admin/ui";

import { FeedCard } from "../../src/components/feed-card";
import { Screen } from "../../src/components/screen";
import { dashboardStats } from "../../src/content/modules";
import { lifeAdminClient } from "../../src/lib/api";
import { useResponsiveLayout } from "../../src/lib/layout";

export default function DashboardScreen() {
  const { isTablet, isLaptop } = useResponsiveLayout();
  const { data = [] } = useQuery({
    queryKey: ["dashboard-feed"],
    queryFn: () => lifeAdminClient.getDashboardFeed()
  });

  return (
    <Screen
      title="Life Admin"
      subtitle="A personal operations dashboard that prioritizes the week ahead instead of hiding work across separate apps."
      rightRail={
        <View style={{ flexDirection: isTablet ? "column" : "row", flexWrap: "wrap", gap: spacing.sm }}>
          {dashboardStats.map((stat) => (
            <StatChip key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </View>
      }
    >
      <Section
        eyebrow="Focus"
        title="Upcoming actions"
        description="A single feed blends bills, appointments, renewals, and documents into the next best actions."
      />
      <View
        style={{
          flexDirection: isLaptop ? "row" : "column",
          flexWrap: "wrap",
          gap: spacing.md
        }}
      >
        {data.map((item) => (
          <View
            key={item.id}
            style={{
              width: "100%",
              maxWidth: isLaptop ? "48.5%" : "100%"
            }}
          >
            <FeedCard item={item} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
