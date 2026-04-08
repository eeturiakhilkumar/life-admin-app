import { describe, expect, it } from "vitest";

import { buildDashboardFeed, createReminderSchedule, quickCaptureResultSchema } from "../src";

describe("domain helpers", () => {
  it("creates reminder timestamps in descending offset order", () => {
    const reminders = createReminderSchedule("2026-04-10T10:00:00.000Z", [0, 60, 1440]);
    expect(reminders.map((reminder) => reminder.offsetMinutes)).toEqual([1440, 60, 0]);
  });

  it("parses quick capture output safely", () => {
    const parsed = quickCaptureResultSchema.parse({
      detectedType: "bill",
      title: "Pay internet bill",
      suggestedFields: { amount: 999 },
      confidence: 0.83
    });
    expect(parsed.detectedType).toBe("bill");
  });

  it("prioritizes urgent dashboard cards first", () => {
    const feed = buildDashboardFeed([
      {
        id: "1",
        type: "bill",
        status: "active",
        title: "Pay rent",
        subtitle: "April",
        dueAt: new Date().toISOString(),
        startsAt: null,
        amount: 20000,
        currency: "INR",
        tags: [],
        linkedDocumentIds: [],
        reminders: []
      },
      {
        id: "2",
        type: "document",
        status: "active",
        title: "Passport copy",
        subtitle: "Stored securely",
        dueAt: null,
        startsAt: null,
        amount: null,
        currency: null,
        tags: [],
        linkedDocumentIds: [],
        reminders: []
      }
    ]);

    expect(feed[0]?.id).toBe("1");
  });
});
