import { useQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";

import type { ItemType } from "@life-admin/domain";
import { Card, colors, Section, spacing } from "@life-admin/ui";

import { RequireAuth } from "../components/require-auth";
import { Screen } from "../components/screen";
import { lifeAdminClient } from "../lib/api";

type ModuleScreenProps = {
  type: ItemType;
  title: string;
  subtitle?: string;
};

export const ModuleScreen = ({ type, title, subtitle }: ModuleScreenProps) => {
  const { data } = useQuery({
    queryKey: ["module-items", type],
    queryFn: () => lifeAdminClient.listItemsByType(type)
  });

  return (
    <RequireAuth>
      <Screen title={title} subtitle={subtitle}>
        <Section
          eyebrow="Module"
          title={`${title} workspace`}
        />
        <View style={{ gap: spacing.md }}>
          {(data ?? []).map((item) => (
            <Card key={item.id} style={{ gap: 8 }}>
              <Text style={{ fontSize: 19, fontWeight: "700", color: colors.ink }}>{item.title}</Text>
              {item.subtitle ? <Text style={{ color: colors.slate }}>{item.subtitle}</Text> : null}
              <Text style={{ color: colors.slate }}>
                Status: {item.status} {item.dueAt ? `• Due ${new Date(item.dueAt).toLocaleDateString("en-IN")}` : ""}
              </Text>
              <Text style={{ color: colors.accent, fontWeight: "700" }}>
                {item.linkedDocumentIds.length} linked docs • {item.reminders.length} reminders
              </Text>
            </Card>
          ))}
          {!data?.length ? (
            <Card>
              <Text style={{ color: colors.slate }}>
                This module is ready for live Supabase data once your backend env is set.
              </Text>
            </Card>
          ) : null}
        </View>
      </Screen>
    </RequireAuth>
  );
};
