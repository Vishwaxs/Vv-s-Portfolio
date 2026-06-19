import { describe, expect, it } from "vitest";
import { normalizeDate, sanitizeSuggestion, toSlug } from "./sanitize";

describe("normalizeDate", () => {
  it("expands year and year-month to a full ISO date", () => {
    expect(normalizeDate("2026")).toBe("2026-01-01");
    expect(normalizeDate("2026-05")).toBe("2026-05-01");
    expect(normalizeDate("2026-05-09")).toBe("2026-05-09");
  });
  it("returns null for empty or unparseable input", () => {
    expect(normalizeDate(null)).toBeNull();
    expect(normalizeDate("")).toBeNull();
    expect(normalizeDate("not a date")).toBeNull();
  });
});

describe("toSlug", () => {
  it("lowercases and dashes, trimming stray separators", () => {
    expect(toSlug("R.M. International School (SIMS)")).toBe("r-m-international-school-sims");
    expect(toSlug("  Hello  World  ")).toBe("hello-world");
  });
});

describe("sanitizeSuggestion", () => {
  it("maps a certification's `date` to `issue_date` and normalises it", () => {
    const out = sanitizeSuggestion("certifications", "create", {
      date: "2026",
      name: "GitHub Foundations Certification",
      issuer: "GitHub",
    });
    expect(out).not.toHaveProperty("date");
    expect(out.issue_date).toBe("2026-01-01");
    expect(out.name).toBe("GitHub Foundations Certification");
    expect(out.issuer).toBe("GitHub");
    expect(out.published).toBe(false);
  });

  it("fills issuer from the create default when the AI omits it", () => {
    const out = sanitizeSuggestion("certifications", "create", { name: "Some cert" });
    expect(out.issuer).toBe("");
  });

  it("generates a slug for a new project that lacks one", () => {
    const out = sanitizeSuggestion("projects", "create", {
      title: "School ERP Platform",
      summary: "An ERP",
      status: "completed",
    });
    expect(typeof out.slug).toBe("string");
    expect(out.slug as string).toMatch(/^school-erp-platform-[a-z0-9]+$/);
    expect(out.published).toBe(false);
  });

  it("drops a null skill level so the column default applies, and clamps numbers", () => {
    const nullLevel = sanitizeSuggestion("skills", "create", { name: "Row-Level Security", level: null });
    expect(nullLevel).not.toHaveProperty("level");

    expect(sanitizeSuggestion("skills", "create", { name: "x", level: 9 }).level).toBe(5);
    expect(sanitizeSuggestion("skills", "create", { name: "x", level: 0 }).level).toBe(1);
  });

  it("falls back to a valid project status", () => {
    const out = sanitizeSuggestion("projects", "create", { title: "x", status: "shipped" });
    expect(out.status).toBe("completed");
  });

  it("maps project aliases tech -> tech_stack and url -> repo_url", () => {
    const out = sanitizeSuggestion("projects", "create", {
      title: "x",
      tech: ["React", "Node"],
      url: "https://github.com/me/x",
    });
    expect(out.tech_stack).toEqual(["React", "Node"]);
    expect(out.repo_url).toBe("https://github.com/me/x");
  });

  it("folds resume highlight bullets into description_md", () => {
    const out = sanitizeSuggestion("projects", "create", {
      title: "x",
      highlights: ["Did A", "Did B"],
    });
    expect(out.description_md).toBe("- Did A\n- Did B");
  });

  it("maps an achievement's `description` to `description_md`", () => {
    const out = sanitizeSuggestion("achievements", "create", { title: "Won", description: "First place" });
    expect(out.description_md).toBe("First place");
    expect(out).not.toHaveProperty("description");
  });

  it("supplies a fallback for NOT NULL date columns on experience", () => {
    const out = sanitizeSuggestion("experience", "create", { role: "Intern", organization: "Acme" });
    expect(out.start_date).toBe("2000-01-01");
  });

  it("discards columns that do not exist on the table", () => {
    const out = sanitizeSuggestion("skills", "create", { name: "x", bogus_field: "nope" });
    expect(out).not.toHaveProperty("bogus_field");
  });

  it("does not generate a slug or inject create defaults on update", () => {
    const out = sanitizeSuggestion("projects", "update", { summary: "tweaked" });
    expect(out).not.toHaveProperty("slug");
    expect(out).not.toHaveProperty("published");
    expect(out.summary).toBe("tweaked");
  });
});
