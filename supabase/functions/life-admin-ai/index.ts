import OpenAI from "https://deno.land/x/openai@v4.69.0/mod.ts";
import { z } from "npm:zod@3.25.28";

const client = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

const requestSchema = z.object({
  mode: z.enum(["quick_capture", "document_summary", "document_extraction", "weekly_digest"]),
  payload: z.record(z.any()),
  userId: z.string()
});

const systemPrompt = `
You are Life Admin AI.
You help users organize bills, appointments, renewals, important dates, shopping lists, and documents.
Never imply that a change has already been applied.
Return machine-readable JSON only.
`.trim();

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const json = await request.json();
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const response = await client.responses.create({
    model: "gpt-5.2-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(parsed.data) }
    ]
  });

  return Response.json({
    outputText: response.output_text,
    confirmationRequired: true,
    mode: parsed.data.mode
  });
});

