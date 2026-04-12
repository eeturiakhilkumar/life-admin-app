import { View } from "react-native";

import { Section, spacing } from "@life-admin/ui";

import { ModuleCard } from "../../src/components/module-card";
import { Screen } from "../../src/components/screen";
import { moduleCards } from "../../src/content/modules";
import { useResponsiveLayout } from "../../src/lib/layout";

export default function ModulesScreen() {
  const { isTablet, isLaptop } = useResponsiveLayout();

  return (
    <Screen title="Modules">
      <Section
        eyebrow="Coverage"
        title="Launch modules"
      />
      <View
        style={{
          flexDirection: isTablet ? "row" : "column",
          flexWrap: "wrap",
          gap: spacing.md
        }}
      >
        {moduleCards.map((moduleCard) => (
          <View
            key={moduleCard.type}
            style={{
              width: "100%",
              maxWidth: isLaptop ? "48.5%" : isTablet ? "48%" : "100%"
            }}
          >
            <ModuleCard {...moduleCard} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
