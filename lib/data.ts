import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profile">;
export type SocialLink = Tables<"social_links">;
export type Section = Tables<"sections">;
export type SkillCategory = Tables<"skill_categories"> & {
  skills: Tables<"skills">[];
};
export type Project = Tables<"projects"> & {
  project_categories: Tables<"project_categories"> | null;
  project_screenshots: Tables<"project_screenshots">[];
};
export type Education = Tables<"education">;
export type Experience = Tables<"experience">;
export type Certification = Tables<"certifications">;
export type Achievement = Tables<"achievements">;
export type Role = Tables<"roles">;
export type RoleOverride = Tables<"role_content_overrides">;

const hasSupabaseEnv = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

/** Fail-soft wrapper: CI builds without Supabase env render empty content
 *  instead of crashing `next build`. */
async function safe<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  if (!hasSupabaseEnv()) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export const getProfile = unstable_cache(
  () =>
    safe<Profile | null>(null, async () => {
      const { data } = await createAnonClient()
        .from("profile")
        .select("*")
        .limit(1)
        .maybeSingle();
      return data;
    }),
  ["profile"],
  { tags: ["profile"], revalidate: 3600 }
);

export const getSocialLinks = unstable_cache(
  () =>
    safe<SocialLink[]>([], async () => {
      const { data } = await createAnonClient()
        .from("social_links")
        .select("*")
        .order("sort_order");
      return data ?? [];
    }),
  ["social_links"],
  { tags: ["profile"], revalidate: 3600 }
);

export const getSections = unstable_cache(
  () =>
    safe<Section[]>([], async () => {
      const { data } = await createAnonClient().from("sections").select("*");
      return data ?? [];
    }),
  ["sections"],
  { tags: ["sections"], revalidate: 3600 }
);

export const getSkillCategories = unstable_cache(
  () =>
    safe<SkillCategory[]>([], async () => {
      const { data } = await createAnonClient()
        .from("skill_categories")
        .select("*, skills(*)")
        .order("sort_order")
        .order("sort_order", { referencedTable: "skills" });
      return (data as SkillCategory[]) ?? [];
    }),
  ["skills"],
  { tags: ["skills"], revalidate: 3600 }
);

export const getProjects = unstable_cache(
  () =>
    safe<Project[]>([], async () => {
      const { data } = await createAnonClient()
        .from("projects")
        .select("*, project_categories(*), project_screenshots(*)")
        .order("sort_order");
      return (data as Project[]) ?? [];
    }),
  ["projects"],
  { tags: ["projects"], revalidate: 3600 }
);

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}

export const getEducation = unstable_cache(
  () =>
    safe<Education[]>([], async () => {
      const { data } = await createAnonClient()
        .from("education")
        .select("*")
        .order("sort_order");
      return data ?? [];
    }),
  ["education"],
  { tags: ["education"], revalidate: 3600 }
);

export const getExperience = unstable_cache(
  () =>
    safe<Experience[]>([], async () => {
      const { data } = await createAnonClient()
        .from("experience")
        .select("*")
        .order("sort_order");
      return data ?? [];
    }),
  ["experience"],
  { tags: ["experience"], revalidate: 3600 }
);

export const getCertifications = unstable_cache(
  () =>
    safe<Certification[]>([], async () => {
      const { data } = await createAnonClient()
        .from("certifications")
        .select("*")
        .order("sort_order");
      return data ?? [];
    }),
  ["certifications"],
  { tags: ["certifications"], revalidate: 3600 }
);

export const getAchievements = unstable_cache(
  () =>
    safe<Achievement[]>([], async () => {
      const { data } = await createAnonClient()
        .from("achievements")
        .select("*")
        .order("sort_order");
      return data ?? [];
    }),
  ["achievements"],
  { tags: ["achievements"], revalidate: 3600 }
);

export const getRoles = unstable_cache(
  () =>
    safe<Role[]>([], async () => {
      const { data } = await createAnonClient()
        .from("roles")
        .select("*")
        .order("sort_order");
      return data ?? [];
    }),
  ["roles"],
  { tags: ["roles"], revalidate: 3600 }
);

export const getRoleOverrides = unstable_cache(
  () =>
    safe<RoleOverride[]>([], async () => {
      const { data } = await createAnonClient()
        .from("role_content_overrides")
        .select("*");
      return data ?? [];
    }),
  ["role_overrides"],
  { tags: ["roles"], revalidate: 3600 }
);

export const getSiteSettings = unstable_cache(
  () =>
    safe<Record<string, unknown>>({}, async () => {
      const { data } = await createAnonClient()
        .from("site_settings")
        .select("*");
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    }),
  ["site_settings"],
  { tags: ["settings"], revalidate: 3600 }
);

export function section(sections: Section[], slug: string): Section | null {
  return sections.find((s) => s.slug === slug) ?? null;
}
