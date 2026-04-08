import type { ReactElement } from "react";
import { Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type StatChipProps = {
  label: string;
  value: string;
};

export const StatChip = ({ label, value }: StatChipProps): ReactElement => (
  <View
    style={{
      backgroundColor: colors.accentSoft,
      borderRadius: radii.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: 2
    }}
  >
    <Text style={{ fontSize: 11, color: colors.slate, textTransform: "uppercase" }}>{label}</Text>
    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.ink }}>{value}</Text>
  </View>
);
