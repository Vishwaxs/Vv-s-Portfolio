import { z } from "zod";

export const ParsedResume = z.object({
  basics: z.object({
    name: z.string().nullable(),
    headline: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    links: z.array(z.object({ label: z.string(), url: z.string() })),
  }),
  skills: z.array(
    z.object({
      name: z.string(),
      category: z.string().nullable(),
      level: z.number().min(1).max(5).nullable(),
    })
  ),
  projects: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
      tech: z.array(z.string()),
      url: z.string().nullable(),
      highlights: z.array(z.string()),
    })
  ),
  experience: z.array(
    z.object({
      role: z.string(),
      organization: z.string(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      highlights: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string().nullable(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      grade: z.string().nullable(),
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string().nullable(),
      date: z.string().nullable(),
    })
  ),
  achievements: z.array(
    z.object({
      title: z.string(),
      description: z.string().nullable(),
      date: z.string().nullable(),
    })
  ),
});

export type ParsedResumeType = z.infer<typeof ParsedResume>;

export const SyncSuggestionList = z.object({
  suggestions: z.array(
    z.object({
      entity_type: z.enum([
        "profile",
        "skill",
        "project",
        "experience",
        "education",
        "certification",
        "achievement",
      ]),
      entity_id: z
        .string()
        .nullable()
        .describe("id of the existing row to change, or null when action is create"),
      action: z.enum(["create", "update", "delete"]),
      suggested_value: z
        .record(z.string(), z.unknown())
        .describe("the fields to insert or change, matching the portfolio schema"),
      rationale: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
});

export type SyncSuggestionListType = z.infer<typeof SyncSuggestionList>;
