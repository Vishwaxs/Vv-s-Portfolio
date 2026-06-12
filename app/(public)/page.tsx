import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Download, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SkillGrid } from "@/components/site/SkillGrid";
import { Timeline, type TimelineItem } from "@/components/site/Timeline";
import { Reveal } from "@/components/site/Reveal";
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getRoleOverrides,
  getRoles,
  getSections,
  getSkillCategories,
  section,
} from "@/lib/data";
import { pickRole, rankProjects, rankSkills, ROLE_COOKIE } from "@/lib/role-engine";

export default async function HomePage() {
  const [
    profile,
    sections,
    projects,
    skills,
    education,
    experience,
    roles,
    overrides,
    cookieStore,
  ] = await Promise.all([
    getProfile(),
    getSections(),
    getProjects(),
    getSkillCategories(),
    getEducation(),
    getExperience(),
    getRoles(),
    getRoleOverrides(),
    cookies(),
  ]);

  const role = pickRole(roles, cookieStore.get(ROLE_COOKIE)?.value);
  const hero = section(sections, "hero");
  const rankedProjects = rankProjects(projects, role, overrides);
  const featured = rankedProjects.filter((p) => p.featured).slice(0, 2);
  const rankedSkills = rankSkills(skills, role);

  const timeline: TimelineItem[] = [
    ...experience
      .filter((e) => e.published)
      .map((e) => ({
        id: e.id,
        title: e.role,
        organization: e.organization,
        meta: e.employment_type || undefined,
        start: e.start_date,
        end: e.end_date,
        highlights: e.highlights,
      })),
    ...education
      .filter((e) => e.published)
      .map((e) => ({
        id: e.id,
        title: e.degree,
        organization: e.institution,
        meta: e.grade || undefined,
        start: e.start_date,
        end: e.end_date,
        highlights: e.highlights,
      })),
  ];

  return (
    <>
      {/* Hero */}
      <Section className="pb-10 pt-24">
        <Reveal>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface-1 px-4 py-1.5 text-sm text-ink-secondary">
            <GraduationCap size={15} />
            {hero?.body_md || "Open to opportunities"}
          </p>
          <h1 className="max-w-3xl text-display text-ink">
            {role?.hero_headline || profile?.full_name || "Portfolio"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-secondary">
            {role?.hero_tagline || profile?.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/projects" size="lg">
              View projects <ArrowRight size={17} />
            </Button>
            <Button href="/api/resume/download" variant="secondary" size="lg">
              <Download size={17} /> Download resume
            </Button>
          </div>
        </Reveal>
      </Section>

      {/* Featured projects */}
      {featured.length > 0 && (
        <Section
          title="Featured work"
          subtitle={role ? `Highlighted for ${role.name} roles` : undefined}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent-600 hover:text-accent-500 dark:text-accent-300"
            >
              All projects <ArrowRight size={15} />
            </Link>
          </div>
        </Section>
      )}

      {/* Skills */}
      <Section id="skills" title="Skills" subtitle="Honest levels — still learning, and saying so.">
        <Reveal>
          <SkillGrid categories={rankedSkills} />
        </Reveal>
      </Section>

      {/* Timeline */}
      {timeline.length > 0 && (
        <Section title="Background">
          <Reveal>
            <Timeline items={timeline} />
          </Reveal>
        </Section>
      )}

      {/* Contact CTA */}
      <Section className="pb-24">
        <Reveal>
          <div className="rounded-card border border-line bg-surface-1 p-10 text-center">
            <h2 className="text-h2 text-ink">Let&apos;s talk</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-secondary">
              {section(sections, "contact")?.body_md ||
                "I'm open to internships and junior roles."}
            </p>
            <div className="mt-6">
              <Button href="/contact" size="lg">
                Get in touch <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Person JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile?.full_name,
            jobTitle: profile?.headline,
            email: profile?.email ? `mailto:${profile.email}` : undefined,
            address: profile?.location,
            url: process.env.NEXT_PUBLIC_SITE_URL,
          }),
        }}
      />
    </>
  );
}
