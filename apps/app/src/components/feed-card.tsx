import { Text, View } from "react-native";

import type { DashboardFeedItem } from "@life-admin/domain";
import { Card, colors, spacing } from "@life-admin/ui";

const urgencyStyles: Record<DashboardFeedItem["urgency"], { backgroundColor: string; color: string }> = {
  today: { backgroundColor: "#ffd2cc", color: "#8a1c12" },
  soon: { backgroundColor: "#ffe7ba", color: "#8c5a00" },
  upcoming: { backgroundColor: "#e8f1ff", color: "#274c77" },
  done: { backgroundColor: "#dff3e4", color: "#166534" }
};

export const FeedCard = ({ item }: { item: DashboardFeedItem }) => (
  <Card style={{ gap: spacing.sm }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap" }}>
      <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.ink, flexShrink: 1 }}>{item.title}</Text>
        <Text style={{ color: colors.slate, textTransform: "capitalize" }}>{item.type.replace("_", " ")}</Text>
      </View>
      <View
        style={{
          alignSelf: "flex-start",
          maxWidth: "100%",
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: urgencyStyles[item.urgency].backgroundColor
        }}
      >
        <Text style={{ fontWeight: "700", color: urgencyStyles[item.urgency].color, flexShrink: 1 }}>
          {item.urgency.toUpperCase()}
        </Text>
      </View>
    </View>
    <Text style={{ color: colors.slate }}>Due: {item.dueLabel}</Text>
    <Text style={{ color: colors.accent, fontWeight: "700" }}>{item.actionLabel}</Text>
  </Card>
);
