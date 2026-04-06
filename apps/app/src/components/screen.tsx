import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@life-admin/ui";
import { useResponsiveLayout } from "../lib/layout";

type ScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightRail?: ReactNode;
}>;

export const Screen = ({ title, subtitle, rightRail, children }: ScreenProps) => {
  const { contentWidth, horizontalPadding, isTablet } = useResponsiveLayout();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: horizontalPadding,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl
        }}
      >
        <View style={{ width: "100%", maxWidth: contentWidth, gap: spacing.lg }}>
          <View
            style={{
              flexDirection: isTablet ? "row" : "column",
              alignItems: isTablet ? "flex-start" : "stretch",
              justifyContent: "space-between",
              gap: spacing.md
            }}
          >
            <View style={{ flex: 1, gap: spacing.xs, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: isTablet ? 34 : 28,
                  lineHeight: isTablet ? 40 : 34,
                  fontWeight: "800",
                  color: colors.ink
                }}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text style={{ fontSize: isTablet ? 16 : 15, lineHeight: 24, color: colors.slate }}>{subtitle}</Text>
              ) : null}
            </View>
            {rightRail ? <View style={{ alignSelf: isTablet ? "flex-start" : "stretch" }}>{rightRail}</View> : null}
          </View>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
