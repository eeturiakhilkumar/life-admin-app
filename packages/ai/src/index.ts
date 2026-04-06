import { itemTypeValues, quickCaptureInputSchema, quickCaptureResultSchema } from "@life-admin/domain";
import { z } from "zod";

export const lifeAdminSystemPrompt = `
You are Life Admin AI.
Your job is to help a user organize bills, appointments, renewals, important dates, shopping lists, and documents.
You may suggest structured fields, summaries, or next actions, but you may not execute user changes without confirmation.
Return JSON that matches the requested schema and do not include markdown.
`.trim();

export const quickCaptureSchema = quickCaptureResultSchema;

export const quickCaptureToolInputSchema = quickCaptureInputSchema.extend({
  locale: z.string().default("en-IN"),
  allowedTypes: z.array(z.enum(itemTypeValues)).default(itemTypeValues.slice())
});

export const quickCapturePrompt = (text: string) => `
Convert the following Life Admin inbox entry into a structured item suggestion.
Prioritize the most likely type, infer due or appointment dates when explicit, and keep fields concise.

Input:
${text}
`.trim();

export const documentExtractionSchema = z.object({
  detectedType: z.enum(itemTypeValues),
  title: z.string(),
  summary: z.string(),
  dueDate: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  suggestedTags: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

export const weeklyDigestSchema = z.object({
  headline: z.string(),
  mustDo: z.array(z.string()),
  watchlist: z.array(z.string()),
  lowPriority: z.array(z.string())
});

export type DocumentExtractionResult = z.infer<typeof documentExtractionSchema>;
export type WeeklyDigest = z.infer<typeof weeklyDigestSchema>;

