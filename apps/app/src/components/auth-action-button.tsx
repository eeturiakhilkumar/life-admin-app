import type { ReactElement, ReactNode } from "react";
import { Pressable, Text } from "react-native";

import { colors, spacing } from "@life-admin/ui";

type AuthActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export const AuthActionButton = ({
  label,
  onPress,
  disabled = false,
  variant = "primary"
}: AuthActionButtonProps): ReactElement => {
  const palette = getPalette(variant, disabled);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{
        alignSelf: "flex-start",
        borderRadius: 999,
        borderWidth: variant === "secondary" ? 1 : 0,
        borderColor: variant === "secondary" ? colors.mist : "transparent",
        backgroundColor: palette.backgroundColor,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm
      }}
    >
      <Text style={{ color: palette.textColor, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
};

const getPalette = (
  variant: "primary" | "secondary" | "ghost",
  disabled: boolean
): { backgroundColor: string; textColor: string } => {
  if (disabled) {
    return {
      backgroundColor: colors.mist,
      textColor: colors.slate
    };
  }

  if (variant === "secondary") {
    return {
      backgroundColor: "#ffffff",
      textColor: colors.ink
    };
  }

  if (variant === "ghost") {
    return {
      backgroundColor: "transparent",
      textColor: colors.slate
    };
  }

  return {
    backgroundColor: colors.accent,
    textColor: "#ffffff"
  };
};
