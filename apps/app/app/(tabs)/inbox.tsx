import { Section } from "@life-admin/ui";

import { QuickCaptureCard } from "../../src/components/quick-capture-card";
import { Screen } from "../../src/components/screen";

export default function InboxScreen() {
  return (
    <Screen
      title="Unified inbox"
    >
      <Section
        eyebrow="Capture"
        title="Inbox to workflow"
      />
      <QuickCaptureCard />
    </Screen>
  );
}

