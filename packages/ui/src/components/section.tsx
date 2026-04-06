import type { PropsWithChildren, ReactElement } from "react";
import { Text, View } from "react-native";

import { colors, spacing } from "../theme";

type SectionProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
}>;

export const Section = ({ eyebrow, title, description, children }: SectionProps): ReactElement => (
  <View style={{ gap: spacing.sm }}>
    {eyebrow ? (
      <Text style={{ textTransform: "uppercase", letterSpacing: 1.2, color: colors.accent, fontSize: 12 }}>
        {eyebrow}
      </Text>
    ) : null}
    <Text style={{ fontSize: 24, fontWeight: "700", color: colors.ink }}>{title}</Text>
    {description ? <Text style={{ fontSize: 15, lineHeight: 22, color: colors.slate }}>{description}</Text> : null}
    {children}
  </View>
);
