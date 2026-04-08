import type { Href } from "expo-router";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Card, colors, spacing } from "@life-admin/ui";

type ModuleCardProps = {
  title: string;
  subtitle: string;
  cta: string;
  route: Href;
};

export const ModuleCard = ({ title, subtitle, cta, route }: ModuleCardProps) => (
  <Card style={{ gap: spacing.sm, minWidth: 0 }}>
    <Text style={{ fontSize: 20, fontWeight: "700", color: colors.ink, flexShrink: 1 }}>{title}</Text>
    <Text style={{ color: colors.slate, lineHeight: 22, flexShrink: 1 }}>{subtitle}</Text>
    <View>
      <Link href={route} asChild>
        <Pressable
          style={{
            alignSelf: "flex-start",
            maxWidth: "100%",
            backgroundColor: colors.ink,
            borderRadius: 999,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", flexShrink: 1 }}>{cta}</Text>
        </Pressable>
      </Link>
    </View>
  </Card>
);
