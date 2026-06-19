import type { Json } from "@/lib/database.types";

/** Maps a sync suggestion's entity_type to the table it writes to. */
export const SUGGESTION_TABLES: Record<string, SuggestionTable> = {
  skill: "skills",
  project: "projects",
  experience: "experience",
  education: "education",
  certification: "certifications",
  achievement: "achievements",
  profile: "profile",
};

export type SuggestionTable =
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "achievements"
  | "profile";

export const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Coerce a free-form date string to an ISO `YYYY-MM-DD`, or null. */
export function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Per-table write rules. A sync suggestion's `suggested_value` is free-form and
 *  often uses resume field names (e.g. `date` for a certification) or omits
 *  NOT NULL columns (e.g. a project `slug`). We map aliases, normalise dates,
 *  fill required values, and whitelist columns so an approval can never hit a
 *  "column not found" / not-null / check-constraint error. */
const WRITE_CONFIG: Record<
  SuggestionTable,
  {
    columns: string[];
    aliases?: Record<string, string>;
    dateColumns?: string[];
    requiredDates?: Record<string, string>;
    clamp?: Record<string, [number, number]>;
    validEnum?: Record<string, { values: string[]; fallback: string }>;
    slugFrom?: string;
    createDefaults?: Record<string, Json>;
  }
> = {
  skills: {
    columns: ["category_id", "name", "level", "icon", "years", "featured", "published", "sort_order"],
    clamp: { level: [1, 5] },
    createDefaults: { published: false },
  },
  projects: {
    columns: [
      "slug", "title", "summary", "description_md", "category_id", "tech_stack",
      "repo_url", "live_url", "video_url", "featured", "recruiter_highlight",
      "architecture_md", "challenges_md", "learnings_md", "status",
      "started_on", "finished_on", "cover_image_path", "published", "sort_order",
    ],
    aliases: { tech: "tech_stack", url: "repo_url" },
    dateColumns: ["started_on", "finished_on"],
    validEnum: { status: { values: ["completed", "in_progress", "archived"], fallback: "completed" } },
    slugFrom: "title",
    createDefaults: { published: false },
  },
  experience: {
    columns: [
      "role", "organization", "org_url", "location", "employment_type",
      "start_date", "end_date", "summary_md", "highlights", "tech", "published", "sort_order",
    ],
    dateColumns: ["start_date", "end_date"],
    requiredDates: { start_date: "2000-01-01" },
    createDefaults: { published: false },
  },
  education: {
    columns: [
      "institution", "degree", "field", "start_date", "end_date",
      "grade", "highlights", "published", "sort_order",
    ],
    dateColumns: ["start_date", "end_date"],
    requiredDates: { start_date: "2000-01-01" },
    createDefaults: { published: false },
  },
  certifications: {
    columns: ["name", "issuer", "issue_date", "credential_url", "credential_id", "verified", "published", "sort_order"],
    aliases: { date: "issue_date" },
    dateColumns: ["issue_date"],
    createDefaults: { published: false, issuer: "" },
  },
  achievements: {
    columns: ["title", "description_md", "date", "url", "published", "sort_order"],
    aliases: { description: "description_md" },
    dateColumns: ["date"],
    createDefaults: { published: false },
  },
  profile: {
    columns: ["full_name", "headline", "tagline", "bio_md", "location", "email", "phone", "avatar_path"],
  },
};

/** Coerce a sync suggestion into a row the given table will actually accept. */
export function sanitizeSuggestion(
  table: SuggestionTable,
  action: "create" | "update" | "delete",
  raw: Record<string, Json>
): Record<string, Json> {
  const cfg = WRITE_CONFIG[table];
  const src: Record<string, Json> = {};
  for (const [k, v] of Object.entries(raw)) {
    src[cfg.aliases?.[k] ?? k] = v;
  }

  // fold resume highlight bullets into a project's description if not given one
  if (table === "projects" && Array.isArray(raw.highlights) && src.description_md == null) {
    src.description_md = (raw.highlights as unknown[]).map((h) => `- ${String(h)}`).join("\n");
  }

  const out: Record<string, Json> = {};
  for (const col of cfg.columns) {
    if (!(col in src)) continue;
    let val = src[col];
    if (cfg.dateColumns?.includes(col)) {
      val = normalizeDate(typeof val === "string" ? val : null);
    }
    if (cfg.clamp?.[col] && typeof val === "number") {
      const [lo, hi] = cfg.clamp[col];
      val = Math.min(hi, Math.max(lo, Math.round(val)));
    }
    const enumRule = cfg.validEnum?.[col];
    if (enumRule && (typeof val !== "string" || !enumRule.values.includes(val))) {
      val = enumRule.fallback;
    }
    out[col] = val;
  }

  // NOT NULL date columns must carry a value
  for (const [col, fallback] of Object.entries(cfg.requiredDates ?? {})) {
    if (out[col] == null) out[col] = fallback;
  }

  // never send explicit nulls — let column defaults apply / leave columns absent
  for (const key of Object.keys(out)) {
    if (out[key] === null) delete out[key];
  }

  if (action === "create") {
    if (cfg.slugFrom && out.slug == null) {
      const base = typeof src[cfg.slugFrom] === "string" ? (src[cfg.slugFrom] as string) : table;
      out.slug = `${toSlug(base) || table}-${Date.now().toString(36)}`;
    }
    for (const [col, dv] of Object.entries(cfg.createDefaults ?? {})) {
      if (out[col] === undefined) out[col] = dv;
    }
  }

  return out;
}
