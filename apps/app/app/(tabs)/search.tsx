import { useDeferredValue, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { mockItems } from "@life-admin/domain";
import { Card, Section, colors, spacing } from "@life-admin/ui";

import { Screen } from "../../src/components/screen";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const results = mockItems.filter((item) => {
    const haystack = `${item.title} ${item.subtitle ?? ""} ${item.tags.join(" ")}`.toLowerCase();
    return haystack.includes(deferredQuery.trim().toLowerCase());
  });

  return (
    <Screen title="Search">
      <Section
        eyebrow="Cross-module"
        title="One search across your life admin surface"
      />
      <Card style={{ gap: spacing.md }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search bills, appointments, renewals, documents..."
          style={{
            borderWidth: 1,
            borderColor: colors.mist,
            borderRadius: 18,
            padding: spacing.md,
            backgroundColor: "#ffffff"
          }}
        />
        <View style={{ gap: spacing.sm }}>
          {results.map((item) => (
            <View key={item.id} style={{ gap: 4 }}>
              <Text style={{ fontWeight: "700", color: colors.ink }}>{item.title}</Text>
              <Text style={{ color: colors.slate }}>{item.subtitle}</Text>
            </View>
          ))}
          {results.length === 0 ? <Text style={{ color: colors.slate }}>No matches yet.</Text> : null}
        </View>
      </Card>
    </Screen>
  );
}

