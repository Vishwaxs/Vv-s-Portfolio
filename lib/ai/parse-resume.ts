import "server-only";

import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createAnthropic, PARSE_MODEL } from "@/lib/ai/anthropic";
import { ParsedResume, type ParsedResumeType } from "@/lib/ai/resume-schema";

/** Parse a resume PDF (base64) into the structured ParsedResume shape. */
export async function parseResumePdf(
  pdfBase64: string
): Promise<ParsedResumeType> {
  const client = createAnthropic();
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured");

  const message = await client.messages.parse({
    model: PARSE_MODEL,
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
          {
            type: "text",
            text: [
              "Extract the contents of this resume into the structured format.",
              "Rules:",
              "- Only include information actually present in the document; never invent or embellish.",
              "- Dates as YYYY-MM (or YYYY if month unknown); null when absent.",
              "- skills.level: only set when the resume states proficiency explicitly, else null.",
              "- Keep highlight bullets verbatim or lightly trimmed.",
            ].join("\n"),
          },
        ],
      },
    ],
  });

  if (!message.parsed_output) {
    throw new Error("Model returned no structured output");
  }
  return message.parsed_output;
}
