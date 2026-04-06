import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Card, colors, spacing } from "@life-admin/ui";

type ModuleCardProps = {
  title: string;
  subtitle: string;
  cta: string;
  route: string;
};

export const ModuleCard = ({ title, subtitle, cta, route }: ModuleCardProps) => (
  <Card style={{ gap: spacing.sm }}>
    <Text style={{ fontSize: 20, fontWeight: "700", color: colors.ink }}>{title}</Text>
    <Text style={{ color: colors.slate, lineHeight: 22 }}>{subtitle}</Text>
    <View>
      <Link href={route} asChild>
        <Pressable
          style={{
            alignSelf: "flex-start",
            backgroundColor: colors.ink,
            borderRadius: 999,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>{cta}</Text>
        </Pressable>
      </Link>
    </View>
  </Card>
);

