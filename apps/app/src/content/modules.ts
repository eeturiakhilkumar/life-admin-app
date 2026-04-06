import type { ItemType } from "@life-admin/domain";

export const moduleCards: Array<{
  type: ItemType;
  title: string;
  subtitle: string;
  cta: string;
  route: string;
}> = [
  {
    type: "bill",
    title: "Bills",
    subtitle: "Track due dates, amounts, autopay gaps, and proof of payment.",
    cta: "Open bills",
    route: "/modules/bills"
  },
  {
    type: "appointment",
    title: "Appointments",
    subtitle: "Keep upcoming visits, prep notes, and reminder windows in one place.",
    cta: "Open appointments",
    route: "/modules/appointments"
  },
  {
    type: "renewal",
    title: "Renewals",
    subtitle: "Catch licenses, insurance, and subscriptions before they lapse.",
    cta: "Open renewals",
    route: "/modules/renewals"
  },
  {
    type: "important_date",
    title: "Important Dates",
    subtitle: "Birthdays, anniversaries, and deadlines that should never surprise you.",
    cta: "Open dates",
    route: "/modules/important-dates"
  },
  {
    type: "shopping_list",
    title: "Shopping Lists",
    subtitle: "Plan repeatable lists and capture errands from one inbox.",
    cta: "Open lists",
    route: "/modules/shopping-lists"
  },
  {
    type: "document",
    title: "Documents",
    subtitle: "Store receipts, policies, IDs, and linked records with AI summaries.",
    cta: "Open documents",
    route: "/modules/documents"
  }
];

export const dashboardStats = [
  { label: "Due this week", value: "08" },
  { label: "Documents", value: "23" },
  { label: "AI suggestions", value: "05" }
];

