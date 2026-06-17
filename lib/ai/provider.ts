import "server-only";

/** Which AI provider the resume module uses. Gemini takes precedence when
 *  both keys are set. Returns null when no key is configured, in which case
 *  the admin UI falls back to manual entry. */
export type AIProvider = "gemini" | "anthropic";

export function activeProvider(): AIProvider | null {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

export const aiAvailable = activeProvider() !== null;

/** Human-readable label for the active provider (for admin UI copy). */
export function providerLabel(): string {
  const p = activeProvider();
  return p === "gemini" ? "Google Gemini" : p === "anthropic" ? "Anthropic Claude" : "none";
}
