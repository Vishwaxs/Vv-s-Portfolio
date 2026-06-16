import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Section } from "@/components/ui/Section";
import { ProjectFilter } from "@/components/site/ProjectFilter";
import { getProjects, getRoleOverrides, getRoles } from "@/lib/data";
import { pickRole, rankProjects, ROLE_COOKIE } from "@/lib/role-engine";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies of real, shipped projects.",
};

export default async function ProjectsPage() {
  const [projects, roles, overrides, cookieStore] = await Promise.all([
    getProjects(),
    getRoles(),
    getRoleOverrides(),
    cookies(),
  ]);
  const role = pickRole(roles, cookieStore.get(ROLE_COOKIE)?.value);
  const ranked = rankProjects(projects, role, overrides);

  const categories = [
    ...new Map(
      ranked
        .filter((p) => p.project_categories)
        .map((p) => [p.project_categories!.slug, p.project_categories!])
    ).values(),
  ].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Section
      className="pt-20 pb-24"
      title="Projects"
      subtitle="Real work with real code — each one links to a full case study."
    >
      <ProjectFilter projects={ranked} categories={categories} />
    </Section>
  );
}
