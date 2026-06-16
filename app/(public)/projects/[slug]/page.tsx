import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Lightbulb, Puzzle, Workflow } from "lucide-react";
import { GithubIcon } from "@/components/site/BrandIcons";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Markdown } from "@/components/site/Markdown";
import { getProjectBySlug } from "@/lib/data";
import { formatDate, publicAssetUrl } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [`/api/og?title=${encodeURIComponent(project.title)}`],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.published) notFound();

  const cover = publicAssetUrl(project.cover_image_path);
  const caseStudy = [
    { key: "architecture_md", title: "Architecture", icon: Workflow, body: project.architecture_md },
    { key: "challenges_md", title: "Challenges", icon: Puzzle, body: project.challenges_md },
    { key: "learnings_md", title: "What I learned", icon: Lightbulb, body: project.learnings_md },
  ].filter((s) => s.body.trim());

  return (
    <>
      <Section className="pt-16 pb-0">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={15} /> All projects
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-h1 text-ink">{project.title}</h1>
          {project.status === "in_progress" && <Badge tone="accent">In progress</Badge>}
        </div>

        <p className="mt-4 max-w-2xl text-lg text-ink-secondary">{project.summary}</p>

        {project.recruiter_highlight && (
          <p className="mt-4 max-w-2xl rounded-lg border-l-4 border-accent-500 bg-surface-1 px-4 py-3 text-sm text-ink-secondary">
            {project.recruiter_highlight}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.tech_stack.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.repo_url && (
            <Button href={project.repo_url} variant="secondary" target="_blank" rel="noopener noreferrer">
              <GithubIcon size={16} /> Source code
            </Button>
          )}
          {project.live_url && (
            <Button href={project.live_url} target="_blank" rel="noopener noreferrer">
              Live site <ArrowUpRight size={16} />
            </Button>
          )}
          <span className="text-sm text-ink-muted">
            {formatDate(project.started_on)} — {formatDate(project.finished_on)}
          </span>
        </div>
      </Section>

      {cover && (
        <Section className="py-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-card border border-line bg-surface-2">
            <Image
              src={cover}
              alt={`${project.title} cover`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </Section>
      )}

      <Section className="pt-6">
        <div className="max-w-3xl">
          <Markdown>{project.description_md}</Markdown>
        </div>
      </Section>

      {caseStudy.map((s) => (
        <Section key={s.key} className="py-6">
          <h2 className="mb-4 flex items-center gap-2 text-h3 text-ink">
            <s.icon size={20} className="text-accent-500" /> {s.title}
          </h2>
          <div className="max-w-3xl">
            <Markdown>{s.body}</Markdown>
          </div>
        </Section>
      ))}

      {project.project_screenshots.length > 0 && (
        <Section title="Screenshots" className="pb-24">
          <div className="grid gap-6 sm:grid-cols-2">
            {project.project_screenshots
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((s) => {
                const url = publicAssetUrl(s.storage_path);
                return (
                  url && (
                    <div
                      key={s.id}
                      className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-surface-2"
                    >
                      <Image
                        src={url}
                        alt={s.alt || `${project.title} screenshot`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )
                );
              })}
          </div>
        </Section>
      )}

      <div className="pb-16" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            description: project.summary,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${project.slug}`,
            ...(project.repo_url && { codeRepository: project.repo_url }),
          }),
        }}
      />
    </>
  );
}
