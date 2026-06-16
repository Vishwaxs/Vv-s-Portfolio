import { z } from "zod";

/** Zod schemas for every admin-editable entity, shared by forms and
 *  server actions. Keys match table names. */

const id = z.string().uuid().optional();
const sortOrder = z.coerce.number().int().default(0);
const published = z.coerce.boolean().default(true);
const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .nullable()
  .or(z.literal("").transform(() => null));
const optionalDate = z
  .string()
  .trim()
  .nullable()
  .transform((v) => (v ? v : null));
const stringList = z
  .union([z.array(z.string()), z.string()])
  .transform((v) =>
    Array.isArray(v)
      ? v
      : v
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
  );

export const entitySchemas = {
  profile: z.object({
    id,
    full_name: z.string().trim().min(1),
    headline: z.string().trim().default(""),
    tagline: z.string().trim().default(""),
    bio_md: z.string().default(""),
    location: z.string().trim().default(""),
    email: z.string().trim().email().or(z.literal("")),
    phone: z.string().trim().default(""),
    avatar_path: z.string().trim().nullable().default(null),
  }),

  sections: z.object({
    id,
    slug: z.string().trim().min(1),
    title: z.string().default(""),
    subtitle: z.string().default(""),
    body_md: z.string().default(""),
    published,
  }),

  social_links: z.object({
    id,
    platform: z.string().trim().min(1),
    url: z.string().trim().url(),
    label: z.string().default(""),
    icon: z.string().default(""),
    sort_order: sortOrder,
    published,
  }),

  skill_categories: z.object({
    id,
    name: z.string().trim().min(1),
    slug: z.string().trim().min(1),
    sort_order: sortOrder,
  }),

  skills: z.object({
    id,
    category_id: z.string().uuid().nullable().or(z.literal("").transform(() => null)),
    name: z.string().trim().min(1),
    level: z.coerce.number().int().min(1).max(5).default(3),
    featured: z.coerce.boolean().default(false),
    published,
    sort_order: sortOrder,
  }),

  project_categories: z.object({
    id,
    name: z.string().trim().min(1),
    slug: z.string().trim().min(1),
    sort_order: sortOrder,
  }),

  projects: z.object({
    id,
    slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, dashes"),
    title: z.string().trim().min(1),
    summary: z.string().default(""),
    description_md: z.string().default(""),
    category_id: z.string().uuid().nullable().or(z.literal("").transform(() => null)),
    tech_stack: stringList,
    repo_url: optionalUrl,
    live_url: optionalUrl,
    video_url: optionalUrl,
    featured: z.coerce.boolean().default(false),
    recruiter_highlight: z.string().nullable().default(null),
    architecture_md: z.string().default(""),
    challenges_md: z.string().default(""),
    learnings_md: z.string().default(""),
    status: z.enum(["completed", "in_progress", "archived"]).default("completed"),
    started_on: optionalDate,
    finished_on: optionalDate,
    cover_image_path: z.string().trim().nullable().default(null),
    published: z.coerce.boolean().default(false),
    sort_order: sortOrder,
  }),

  experience: z.object({
    id,
    role: z.string().trim().min(1),
    organization: z.string().trim().min(1),
    org_url: optionalUrl,
    location: z.string().default(""),
    employment_type: z.string().default(""),
    start_date: z.string().min(1),
    end_date: optionalDate,
    summary_md: z.string().default(""),
    highlights: stringList,
    tech: stringList,
    published: z.coerce.boolean().default(false),
    sort_order: sortOrder,
  }),

  education: z.object({
    id,
    institution: z.string().trim().min(1),
    degree: z.string().trim().min(1),
    field: z.string().default(""),
    start_date: z.string().min(1),
    end_date: optionalDate,
    grade: z.string().default(""),
    highlights: stringList,
    published,
    sort_order: sortOrder,
  }),

  certifications: z.object({
    id,
    name: z.string().trim().min(1),
    issuer: z.string().trim().min(1),
    issue_date: optionalDate,
    credential_url: optionalUrl,
    credential_id: z.string().nullable().default(null),
    verified: z.coerce.boolean().default(false),
    published: z.coerce.boolean().default(false),
    sort_order: sortOrder,
  }),

  achievements: z.object({
    id,
    title: z.string().trim().min(1),
    description_md: z.string().default(""),
    date: optionalDate,
    url: optionalUrl,
    published,
    sort_order: sortOrder,
  }),

  roles: z.object({
    id,
    slug: z.string().trim().min(1),
    name: z.string().trim().min(1),
    description: z.string().default(""),
    is_default: z.coerce.boolean().default(false),
    hero_headline: z.string().default(""),
    hero_tagline: z.string().default(""),
    skill_weights: z
      .union([z.record(z.string(), z.number()), z.string()])
      .transform((v) => (typeof v === "string" ? (v ? JSON.parse(v) : {}) : v)),
    keyword_boosts: z
      .union([z.record(z.string(), z.number()), z.string()])
      .transform((v) => (typeof v === "string" ? (v ? JSON.parse(v) : {}) : v)),
    published,
    sort_order: sortOrder,
  }),
} as const;

export type EntityTable = keyof typeof entitySchemas;

export const entityTables = Object.keys(entitySchemas) as EntityTable[];

/** Cache tag invalidated when a table changes. */
export const entityTags: Record<EntityTable, string> = {
  profile: "profile",
  sections: "sections",
  social_links: "profile",
  skill_categories: "skills",
  skills: "skills",
  project_categories: "projects",
  projects: "projects",
  experience: "experience",
  education: "education",
  certifications: "certifications",
  achievements: "achievements",
  roles: "roles",
};
