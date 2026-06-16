import "server-only";

import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createAnthropic, PARSE_MODEL } from "@/lib/ai/anthropic";
import {
  SyncSuggestionList,
  type ParsedResumeType,
  type SyncSuggestionListType,
} from "@/lib/ai/resume-schema";

export type PortfolioSnapshot = {
  profile: Record<string, unknown> | null;
  skills: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  experience: Array<Record<string, unknown>>;
  education: Array<Record<string, unknown>>;
  certifications: Array<Record<string, unknown>>;
  achievements: Array<Record<string, unknown>>;
};

/** Diff the parsed resume against current portfolio content and propose
 *  create/update/delete operations for admin review. */
export async function suggestSync(
  snapshot: PortfolioSnapshot,
  parsed: ParsedResumeType
): Promise<SyncSuggestionListType> {
  const client = createAnthropic();
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured");

  const message = await client.messages.parse({
    model: PARSE_MODEL,
    max_tokens: 8192,
    output_config: { format: zodOutputFormat(SyncSuggestionList) },
    messages: [
      {
        role: "user",
        content: [
          "You keep a developer portfolio in sync with the owner's resume.",
          "Compare CURRENT portfolio content with the RESUME and propose changes.",
          "",
          "Rules:",
          "- Suggest only changes grounded in the resume; never fabricate.",
          "- Match existing rows by name/title similarity; use their id for updates.",
          "- entity_id must be the existing row's id for update/delete, null for create.",
          "- suggested_value contains only the changed/new fields, using the portfolio's column names (e.g. skills: name, level; experience: role, organization, start_date, end_date, highlights).",
          "- Prefer update over create+delete. Skip cosmetic differences.",
          "- confidence: how certain the change is correct and desirable.",
          "",
          "CURRENT PORTFOLIO:",
          JSON.stringify(snapshot),
          "",
          "RESUME (parsed):",
          JSON.stringify(parsed),
        ].join("\n"),
      },
    ],
  });

  if (!message.parsed_output) {
    throw new Error("Model returned no structured output");
  }
  return message.parsed_output;
}
