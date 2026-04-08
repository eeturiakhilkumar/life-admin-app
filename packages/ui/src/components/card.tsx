import type { PropsWithChildren, ReactElement } from "react";
import { View, type ViewProps } from "react-native";

import { colors, radii, spacing } from "../theme";

type CardProps = PropsWithChildren<ViewProps>;

export const Card = ({ children, style, ...rest }: CardProps): ReactElement => (
  <View
    style={[
      {
        backgroundColor: colors.panel,
        borderRadius: radii.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.mist,
        shadowColor: "#000000",
        shadowOpacity: 0.04,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 2
      },
      style
    ]}
    {...rest}
  >
    {children}
  </View>
);
