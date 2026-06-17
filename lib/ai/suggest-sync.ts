import "server-only";

import { activeProvider } from "@/lib/ai/provider";
import type { ParsedResumeType, SyncSuggestionListType } from "@/lib/ai/resume-schema";
import type { PortfolioSnapshot } from "@/lib/ai/types";

export type { PortfolioSnapshot };

/** Diff the parsed resume against current portfolio content and propose
 *  create/update/delete operations for admin review, via the active provider. */
export async function suggestSync(
  snapshot: PortfolioSnapshot,
  parsed: ParsedResumeType
): Promise<SyncSuggestionListType> {
  const provider = activeProvider();
  if (provider === "gemini") {
    const { geminiSuggestSync } = await import("@/lib/ai/gemini");
    return geminiSuggestSync(snapshot, parsed);
  }
  if (provider === "anthropic") {
    const { anthropicSuggestSync } = await import("@/lib/ai/anthropic");
    return anthropicSuggestSync(snapshot, parsed);
  }
  throw new Error("No AI provider configured (set GEMINI_API_KEY or ANTHROPIC_API_KEY)");
}
