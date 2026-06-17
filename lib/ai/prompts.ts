import type { ParsedResumeType } from "@/lib/ai/resume-schema";
import type { PortfolioSnapshot } from "@/lib/ai/types";

/** Provider-agnostic instructions, shared by the Gemini and Anthropic paths. */

export const PARSE_INSTRUCTIONS = [
  "Extract the contents of this resume into the structured format.",
  "Rules:",
  "- Only include information actually present in the document; never invent or embellish.",
  "- Dates as YYYY-MM (or YYYY if month unknown); null when absent.",
  "- skills.level: only set when the resume states proficiency explicitly, else null.",
  "- Keep highlight bullets verbatim or lightly trimmed.",
].join("\n");

/** JSON shape description for providers without native zod output (Gemini).
 *  Mirrors ParsedResume in lib/ai/resume-schema.ts. */
export const PARSE_JSON_SHAPE = `Return ONLY JSON matching exactly this shape:
{
  "basics": { "name": string|null, "headline": string|null, "email": string|null, "phone": string|null, "location": string|null, "links": [{ "label": string, "url": string }] },
  "skills": [{ "name": string, "category": string|null, "level": number(1-5)|null }],
  "projects": [{ "title": string, "summary": string, "tech": string[], "url": string|null, "highlights": string[] }],
  "experience": [{ "role": string, "organization": string, "startDate": string|null, "endDate": string|null, "highlights": string[] }],
  "education": [{ "institution": string, "degree": string, "field": string|null, "startDate": string|null, "endDate": string|null, "grade": string|null }],
  "certifications": [{ "name": string, "issuer": string|null, "date": string|null }],
  "achievements": [{ "title": string, "description": string|null, "date": string|null }]
}
Include every key. Use null for unknown scalar values and [] for empty arrays.`;

export const SYNC_JSON_SHAPE = `Return ONLY JSON matching exactly this shape:
{ "suggestions": [ {
  "entity_type": "profile"|"skill"|"project"|"experience"|"education"|"certification"|"achievement",
  "entity_id": string|null,
  "action": "create"|"update"|"delete",
  "suggested_value": object,
  "rationale": string,
  "confidence": number(0-1)
} ] }
If nothing should change, return { "suggestions": [] }.`;

export function buildSyncPrompt(
  snapshot: PortfolioSnapshot,
  parsed: ParsedResumeType
): string {
  return [
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
  ].join("\n");
}
