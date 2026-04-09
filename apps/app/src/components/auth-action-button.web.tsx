import type { CSSProperties, ReactElement } from "react";

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

  const style: CSSProperties = {
    alignSelf: "stretch",
    width: "100%",
    borderRadius: 999,
    border: variant === "secondary" ? `1px solid ${colors.mist}` : "1px solid transparent",
    backgroundColor: palette.backgroundColor,
    color: palette.textColor,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.8 : 1,
    appearance: "none",
    boxShadow: "none"
  };

  return (
    <button disabled={disabled} onClick={onPress} style={style} type="button">
      {label}
    </button>
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
