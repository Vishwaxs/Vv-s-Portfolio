import { describe, expect, it } from "vitest";
import type { Project, Role, RoleOverride, SkillCategory } from "@/lib/data";
import { pickActiveRole, rankProjects, rankSkills } from "@/lib/role-engine";

const role = (over: Partial<Role>): Role =>
  ({
    id: "r1",
    is_active: false,
    is_default: false,
    keyword_boosts: {},
    skill_weights: {},
    ...over,
  }) as unknown as Role;

const project = (over: Partial<Project>): Project =>
  ({
    id: "p1",
    title: "Untitled",
    summary: "",
    tech_stack: [],
    published: true,
    sort_order: 0,
    ...over,
  }) as unknown as Project;

const override = (over: Partial<RoleOverride>): RoleOverride =>
  ({
    role_id: "r1",
    entity_type: "project",
    entity_id: "p1",
    override: {},
    ...over,
  }) as unknown as RoleOverride;

const category = (over: Partial<SkillCategory>): SkillCategory =>
  ({
    id: "c1",
    name: "Category",
    sort_order: 0,
    skills: [],
    ...over,
  }) as unknown as SkillCategory;

const skill = (over: Record<string, unknown>) =>
  ({ name: "Skill", published: true, sort_order: 0, ...over }) as never;

describe("pickActiveRole", () => {
  it("prefers the active role over the default", () => {
    const roles = [
      role({ id: "default", is_default: true }),
      role({ id: "active", is_active: true }),
    ];
    expect(pickActiveRole(roles)?.id).toBe("active");
  });

  it("falls back to the default role when none is active", () => {
    const roles = [role({ id: "a" }), role({ id: "default", is_default: true })];
    expect(pickActiveRole(roles)?.id).toBe("default");
  });

  it("falls back to the first role when none is active or default", () => {
    const roles = [role({ id: "first" }), role({ id: "second" })];
    expect(pickActiveRole(roles)?.id).toBe("first");
  });

  it("returns null for an empty list", () => {
    expect(pickActiveRole([])).toBeNull();
  });
});

describe("rankProjects", () => {
  it("drops unpublished projects", () => {
    const projects = [
      project({ id: "pub", published: true }),
      project({ id: "draft", published: false }),
    ];
    expect(rankProjects(projects, null, []).map((p) => p.id)).toEqual(["pub"]);
  });

  it("returns published projects unchanged when no role is given", () => {
    const projects = [
      project({ id: "a", sort_order: 1 }),
      project({ id: "b", sort_order: 0 }),
    ];
    // no role => no re-sorting, original order preserved
    expect(rankProjects(projects, null, []).map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("boosts projects whose tech stack matches role keywords", () => {
    const projects = [
      project({ id: "react", tech_stack: ["React", "TypeScript"], sort_order: 0 }),
      project({ id: "python", tech_stack: ["Python"], sort_order: 1 }),
    ];
    const r = role({ keyword_boosts: { python: 10 } });
    expect(rankProjects(projects, r, []).map((p) => p.id)).toEqual([
      "python",
      "react",
    ]);
  });

  it("matches keywords case-insensitively against title and summary", () => {
    const projects = [
      project({ id: "match", summary: "A FinTech dashboard", sort_order: 1 }),
      project({ id: "plain", summary: "A todo app", sort_order: 0 }),
    ];
    const r = role({ keyword_boosts: { fintech: 5 } });
    expect(rankProjects(projects, r, []).map((p) => p.id)).toEqual([
      "match",
      "plain",
    ]);
  });

  it("places pinned overrides ahead of higher keyword scores", () => {
    const projects = [
      project({ id: "scored", tech_stack: ["Go"], sort_order: 0 }),
      project({ id: "pinned", sort_order: 1 }),
    ];
    const r = role({ keyword_boosts: { go: 10 } });
    const overrides = [override({ entity_id: "pinned", override: { pinned: true } })];
    expect(rankProjects(projects, r, overrides).map((p) => p.id)).toEqual([
      "pinned",
      "scored",
    ]);
  });

  it("removes projects hidden by an override", () => {
    const projects = [project({ id: "a" }), project({ id: "hidden" })];
    const r = role({});
    const overrides = [override({ entity_id: "hidden", override: { hidden: true } })];
    expect(rankProjects(projects, r, overrides).map((p) => p.id)).toEqual(["a"]);
  });

  it("applies an override summary without mutating the source project", () => {
    const original = project({ id: "a", summary: "original" });
    const r = role({});
    const overrides = [
      override({ entity_id: "a", override: { summary: "tailored" } }),
    ];
    const result = rankProjects([original], r, overrides);
    expect(result[0].summary).toBe("tailored");
    expect(original.summary).toBe("original");
  });

  it("breaks score ties by sort_order", () => {
    const projects = [
      project({ id: "later", sort_order: 2 }),
      project({ id: "earlier", sort_order: 1 }),
    ];
    expect(rankProjects(projects, role({}), []).map((p) => p.id)).toEqual([
      "earlier",
      "later",
    ]);
  });
});

describe("rankSkills", () => {
  it("orders skills within a category by the role's skill weights", () => {
    const categories = [
      category({
        skills: [
          skill({ name: "CSS", sort_order: 0 }),
          skill({ name: "TypeScript", sort_order: 1 }),
        ],
      }),
    ];
    const r = role({ skill_weights: { typescript: 10 } });
    expect(rankSkills(categories, r)[0].skills.map((s) => s.name)).toEqual([
      "TypeScript",
      "CSS",
    ]);
  });

  it("slugifies skill names to match weight keys", () => {
    const categories = [
      category({
        skills: [
          skill({ name: "Plain", sort_order: 0 }),
          skill({ name: "Node.js", sort_order: 1 }),
        ],
      }),
    ];
    const r = role({ skill_weights: { "node-js": 5 } });
    expect(rankSkills(categories, r)[0].skills.map((s) => s.name)).toEqual([
      "Node.js",
      "Plain",
    ]);
  });

  it("filters out unpublished skills", () => {
    const categories = [
      category({
        skills: [
          skill({ name: "Visible", published: true }),
          skill({ name: "Hidden", published: false }),
        ],
      }),
    ];
    expect(rankSkills(categories, null)[0].skills.map((s) => s.name)).toEqual([
      "Visible",
    ]);
  });

  it("falls back to sort_order when no role weights apply", () => {
    const categories = [
      category({
        skills: [
          skill({ name: "Second", sort_order: 1 }),
          skill({ name: "First", sort_order: 0 }),
        ],
      }),
    ];
    expect(rankSkills(categories, null)[0].skills.map((s) => s.name)).toEqual([
      "First",
      "Second",
    ]);
  });
});
