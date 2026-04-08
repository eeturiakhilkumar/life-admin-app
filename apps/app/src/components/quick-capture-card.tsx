import { useState, useTransition } from "react";
import { Text, TextInput, Pressable, View } from "react-native";

import { colors, Card, spacing } from "@life-admin/ui";
import { lifeAdminClient } from "../lib/api";

export const QuickCaptureCard = () => {
  const [value, setValue] = useState("Renew my motor insurance next Friday and upload the policy PDF");
  const [result, setResult] = useState<null | { detectedType: string; confidence: number }>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ fontSize: 19, fontWeight: "700", color: colors.ink }}>Quick capture inbox</Text>
        <Text style={{ color: colors.slate, lineHeight: 22 }}>
          Turn free text into structured records without letting AI commit changes automatically.
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={setValue}
        multiline
        style={{
          minHeight: 96,
          borderWidth: 1,
          borderColor: colors.mist,
          borderRadius: 18,
          padding: spacing.md,
          backgroundColor: "#ffffff",
          textAlignVertical: "top"
        }}
      />
      <Pressable
        onPress={() =>
          startTransition(async () => {
            const next = await lifeAdminClient.submitQuickCapture({
              text: value,
              locale: "en-IN",
              timezone: "Asia/Kolkata",
              source: "manual"
            });
            setResult({ detectedType: next.detectedType, confidence: next.confidence });
          })
        }
        style={{
          backgroundColor: colors.accent,
          borderRadius: 999,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          alignSelf: "flex-start"
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "700" }}>{isPending ? "Analyzing..." : "Preview AI parsing"}</Text>
      </Pressable>
      {result ? (
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.ink, fontWeight: "700" }}>Detected type: {result.detectedType}</Text>
          <Text style={{ color: colors.slate }}>Confidence: {Math.round(result.confidence * 100)}%</Text>
        </View>
      ) : null}
    </Card>
  );
};

