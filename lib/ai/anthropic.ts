import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  ParsedResume,
  type ParsedResumeType,
  SyncSuggestionList,
  type SyncSuggestionListType,
} from "@/lib/ai/resume-schema";
import type { PortfolioSnapshot } from "@/lib/ai/types";
import { PARSE_INSTRUCTIONS, buildSyncPrompt } from "@/lib/ai/prompts";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

function createAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey });
}

export async function anthropicParseResume(
  pdfBase64: string
): Promise<ParsedResumeType> {
  const client = createAnthropic();
  const message = await client.messages.parse({
    model: MODEL,
    max_tokens: 8192,
    output_config: { format: zodOutputFormat(ParsedResume) },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          { type: "text", text: PARSE_INSTRUCTIONS },
        ],
      },
    ],
  });

  if (!message.parsed_output) {
    throw new Error("Model returned no structured output");
  }
  return message.parsed_output;
}

export async function anthropicSuggestSync(
  snapshot: PortfolioSnapshot,
  parsed: ParsedResumeType
): Promise<SyncSuggestionListType> {
  const client = createAnthropic();
  const message = await client.messages.parse({
    model: MODEL,
    max_tokens: 8192,
    output_config: { format: zodOutputFormat(SyncSuggestionList) },
    messages: [{ role: "user", content: buildSyncPrompt(snapshot, parsed) }],
  });

  if (!message.parsed_output) {
    throw new Error("Model returned no structured output");
  }
  return message.parsed_output;
}
