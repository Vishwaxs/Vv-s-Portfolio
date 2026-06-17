import "server-only";

import { activeProvider } from "@/lib/ai/provider";
import type { ParsedResumeType } from "@/lib/ai/resume-schema";

/** Parse a resume PDF (base64) into the structured ParsedResume shape using
 *  whichever AI provider is configured. */
export async function parseResumePdf(
  pdfBase64: string
): Promise<ParsedResumeType> {
  const provider = activeProvider();
  if (provider === "gemini") {
    const { geminiParseResume } = await import("@/lib/ai/gemini");
    return geminiParseResume(pdfBase64);
  }
  if (provider === "anthropic") {
    const { anthropicParseResume } = await import("@/lib/ai/anthropic");
    return anthropicParseResume(pdfBase64);
  }
  throw new Error("No AI provider configured (set GEMINI_API_KEY or ANTHROPIC_API_KEY)");
}
