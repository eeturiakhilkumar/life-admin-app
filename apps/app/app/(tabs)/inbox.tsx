import { Section } from "@life-admin/ui";

import { QuickCaptureCard } from "../../src/components/quick-capture-card";
import { Screen } from "../../src/components/screen";

export default function InboxScreen() {
  return (
    <Screen
      title="Unified inbox"
      subtitle="Every loose thought, photo, or document lands here first so the rest of the product stays calm and structured."
    >
      <Section
        eyebrow="Capture"
        title="Inbox to workflow"
        description="The AI layer can classify, summarize, and suggest fields, but it never writes to records until the user approves the draft."
      />
      <QuickCaptureCard />
    </Screen>
  );
}

