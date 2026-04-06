import { z } from "zod";

export const itemTypeValues = [
  "bill",
  "appointment",
  "renewal",
  "important_date",
  "shopping_list",
  "document"
] as const;

export const itemStatusValues = ["draft", "active", "completed", "archived"] as const;

export type ItemType = (typeof itemTypeValues)[number];
export type ItemStatus = (typeof itemStatusValues)[number];

export const itemTypeSchema = z.enum(itemTypeValues);
export const itemStatusSchema = z.enum(itemStatusValues);

export const reminderSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  scheduledFor: z.string(),
  channel: z.enum(["push", "email", "in_app"]),
  label: z.string(),
  offsetMinutes: z.number().int().nonnegative(),
  deliveredAt: z.string().nullable().default(null)
});

export type Reminder = z.infer<typeof reminderSchema>;

export const baseItemSchema = z.object({
  id: z.string(),
  type: itemTypeSchema,
  status: itemStatusSchema,
  title: z.string().min(1),
  subtitle: z.string().optional(),
  dueAt: z.string().nullable().default(null),
  startsAt: z.string().nullable().default(null),
  amount: z.number().nullable().default(null),
  currency: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  linkedDocumentIds: z.array(z.string()).default([]),
  reminders: z.array(reminderSchema).default([])
});

export type BaseItem = z.infer<typeof baseItemSchema>;

export const documentRecordSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  mimeType: z.string(),
  storagePath: z.string(),
  uploadedAt: z.string(),
  summary: z.string().nullable().default(null),
  extractedTextStatus: z.enum(["pending", "complete", "failed"]).default("pending"),
  tags: z.array(z.string()).default([])
});

export type DocumentRecord = z.infer<typeof documentRecordSchema>;

export const documentLinkSchema = z.object({
  documentId: z.string(),
  itemId: z.string(),
  relation: z.enum(["primary", "supporting", "reference"]).default("supporting")
});

export type DocumentLink = z.infer<typeof documentLinkSchema>;

export const aiSuggestionSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    confidence: z.number().min(0).max(1),
    rationale: z.string(),
    value: valueSchema
  });

export type AiSuggestion<T> = {
  confidence: number;
  rationale: string;
  value: T;
};

export const quickCaptureInputSchema = z.object({
  text: z.string().min(1),
  locale: z.string().default("en-IN"),
  timezone: z.string().default("Asia/Kolkata"),
  source: z.enum(["manual", "document", "voice"]).default("manual")
});

export type QuickCaptureInput = z.infer<typeof quickCaptureInputSchema>;

export const quickCaptureResultSchema = z.object({
  detectedType: itemTypeSchema,
  title: z.string(),
  parsedDate: z.string().nullable().default(null),
  suggestedFields: z.record(z.any()),
  confidence: z.number().min(0).max(1)
});

export type QuickCaptureResult = z.infer<typeof quickCaptureResultSchema>;

export const dashboardFeedItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: itemTypeSchema,
  status: itemStatusSchema,
  dueLabel: z.string(),
  urgency: z.enum(["today", "soon", "upcoming", "done"]),
  actionLabel: z.string()
});

export type DashboardFeedItem = z.infer<typeof dashboardFeedItemSchema>;

export const aiAuditRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  itemId: z.string().nullable().default(null),
  promptType: z.enum(["quick_capture", "document_summary", "document_extraction", "weekly_digest"]),
  status: z.enum(["queued", "completed", "failed", "rejected"]),
  createdAt: z.string(),
  confirmedAt: z.string().nullable().default(null)
});

export type AiAuditRecord = z.infer<typeof aiAuditRecordSchema>;

export const createReminderSchedule = (isoDate: string, offsetsInMinutes: number[]): Reminder[] =>
  offsetsInMinutes
    .slice()
    .sort((left: number, right: number) => right - left)
    .map((offsetMinutes: number, index: number) => {
      const targetDate = new Date(new Date(isoDate).getTime() - offsetMinutes * 60 * 1000);

      return {
        id: `reminder-${index + 1}`,
        itemId: "pending-item",
        scheduledFor: targetDate.toISOString(),
        channel: "push",
        label: offsetMinutes === 0 ? "Due now" : `${offsetMinutes} min before`,
        offsetMinutes,
        deliveredAt: null
      };
    });

export const buildDashboardFeed = (items: BaseItem[]): DashboardFeedItem[] =>
  items
    .map((item) => {
      const dueDate = item.dueAt ?? item.startsAt;
      if (!dueDate) {
        return {
          id: item.id,
          title: item.title,
          type: item.type,
          status: item.status,
          dueLabel: "No date",
          urgency: item.status === "completed" ? "done" : "upcoming",
          actionLabel: item.status === "completed" ? "Archive" : "Add schedule"
        } satisfies DashboardFeedItem;
      }

      const daysAway = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      const urgency =
        item.status === "completed" ? "done" : daysAway <= 0 ? "today" : daysAway <= 7 ? "soon" : "upcoming";

      return {
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        dueLabel: new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short"
        }).format(new Date(dueDate)),
        urgency,
        actionLabel: urgency === "today" ? "Review now" : "Open"
      } satisfies DashboardFeedItem;
    })
    .slice()
    .sort(
      (left: DashboardFeedItem, right: DashboardFeedItem) => urgencyRank[left.urgency] - urgencyRank[right.urgency]
    );

const urgencyRank: Record<DashboardFeedItem["urgency"], number> = {
  today: 0,
  soon: 1,
  upcoming: 2,
  done: 3
};

export const mockItems: BaseItem[] = [
  {
    id: "bill-1",
    type: "bill",
    status: "active",
    title: "Electricity bill",
    subtitle: "BESCOM April bill",
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    startsAt: null,
    amount: 2650,
    currency: "INR",
    tags: ["utilities"],
    linkedDocumentIds: ["doc-1"],
    reminders: createReminderSchedule(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), [1440, 60])
  },
  {
    id: "appointment-1",
    type: "appointment",
    status: "active",
    title: "Dentist checkup",
    subtitle: "Dr. Sharma, Koramangala",
    dueAt: null,
    startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    amount: null,
    currency: null,
    tags: ["health"],
    linkedDocumentIds: [],
    reminders: createReminderSchedule(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), [1440, 120])
  },
  {
    id: "renewal-1",
    type: "renewal",
    status: "active",
    title: "Vehicle insurance renewal",
    subtitle: "Need policy copy and payment",
    dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    startsAt: null,
    amount: 6400,
    currency: "INR",
    tags: ["insurance"],
    linkedDocumentIds: ["doc-2"],
    reminders: createReminderSchedule(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), [10080, 1440])
  }
];
