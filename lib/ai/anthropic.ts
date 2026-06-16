import "server-only";

import Anthropic from "@anthropic-ai/sdk";

export const aiAvailable = Boolean(process.env.ANTHROPIC_API_KEY);

export function createAnthropic() {
  if (!aiAvailable) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export const PARSE_MODEL = "claude-opus-4-8";
