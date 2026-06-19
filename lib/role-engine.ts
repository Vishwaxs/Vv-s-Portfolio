import type { Project, Role, RoleOverride, SkillCategory } from "@/lib/data";

type OverrideShape = {
  pinned?: boolean;
  hidden?: boolean;
  summary?: string;
};

function overrideFor(
  overrides: RoleOverride[],
  role: Role | null,
  entityType: string,
  entityId: string
): OverrideShape {
  if (!role) return {};
  const row = overrides.find(
    (o) =>
      o.role_id === role.id &&
      o.entity_type === entityType &&
      o.entity_id === entityId
  );
  return (row?.override as OverrideShape) ?? {};
}

function keywordScore(haystack: string, boosts: Record<string, number>): number {
  const text = haystack.toLowerCase();
  return Object.entries(boosts).reduce(
    (sum, [kw, w]) => (text.includes(kw.toLowerCase()) ? sum + Number(w) : sum),
    0
  );
}

/** The admin-chosen active persona, falling back to default/first. */
export function pickActiveRole(roles: Role[]): Role | null {
  return (
    roles.find((r) => r.is_active) ??
    roles.find((r) => r.is_default) ??
    roles[0] ??
    null
  );
}

/** Re-rank projects for a role: keyword boosts against tech stack + summary,
 *  pinned overrides first, hidden ones removed. */
export function rankProjects(
  projects: Project[],
  role: Role | null,
  overrides: RoleOverride[]
): Project[] {
  const published = projects.filter((p) => p.published);
  if (!role) return published;

  const boosts = (role.keyword_boosts as Record<string, number>) ?? {};
  return published
    .map((p) => {
      const o = overrideFor(overrides, role, "project", p.id);
      const score =
        keywordScore(
          [p.title, p.summary, ...p.tech_stack].join(" "),
          boosts
        ) + (o.pinned ? 100 : 0);
      return { project: o.summary ? { ...p, summary: o.summary } : p, score, hidden: o.hidden };
    })
    .filter((x) => !x.hidden)
    .sort(
      (a, b) =>
        b.score - a.score || a.project.sort_order - b.project.sort_order
    )
    .map((x) => x.project);
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Order skills inside each category by the role's skill weights. */
export function rankSkills(
  categories: SkillCategory[],
  role: Role | null
): SkillCategory[] {
  const weights = (role?.skill_weights as Record<string, number>) ?? {};
  return categories.map((c) => ({
    ...c,
    skills: [...c.skills]
      .filter((s) => s.published)
      .sort((a, b) => {
        const wa = weights[slugify(a.name)] ?? 0;
        const wb = weights[slugify(b.name)] ?? 0;
        return wb - wa || a.sort_order - b.sort_order;
      }),
  }));
}
