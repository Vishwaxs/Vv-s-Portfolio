import "server-only";

import { GoogleGenAI } from "@google/genai";
import {
  ParsedResume,
  type ParsedResumeType,
  SyncSuggestionList,
  type SyncSuggestionListType,
} from "@/lib/ai/resume-schema";
import type { PortfolioSnapshot } from "@/lib/ai/types";
import {
  PARSE_INSTRUCTIONS,
  PARSE_JSON_SHAPE,
  SYNC_JSON_SHAPE,
  buildSyncPrompt,
} from "@/lib/ai/prompts";

// Flash is fast, cheap, and handles PDF + JSON well; override with GEMINI_MODEL
// (e.g. gemini-2.5-pro) if you want maximum extraction quality.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

// responseMimeType: application/json normally yields clean JSON, but strip any
// stray code fences defensively before parsing.
function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function geminiParseResume(
  pdfBase64: string
): Promise<ParsedResumeType> {
  const ai = client();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
          { text: `${PARSE_INSTRUCTIONS}\n\n${PARSE_JSON_SHAPE}` },
        ],
      },
    ],
    config: { responseMimeType: "application/json", temperature: 0 },
  });

  const text = res.text;
  if (!text) throw new Error("Gemini returned no output");
  return ParsedResume.parse(parseJson(text));
}

export async function geminiSuggestSync(
  snapshot: PortfolioSnapshot,
  parsed: ParsedResumeType
): Promise<SyncSuggestionListType> {
  const ai = client();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: `${buildSyncPrompt(snapshot, parsed)}\n\n${SYNC_JSON_SHAPE}` }],
      },
    ],
    config: { responseMimeType: "application/json", temperature: 0 },
  });

  const text = res.text;
  if (!text) throw new Error("Gemini returned no output");
  return SyncSuggestionList.parse(parseJson(text));
}
