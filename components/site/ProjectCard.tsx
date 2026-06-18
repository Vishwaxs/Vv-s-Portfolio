import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/site/BrandIcons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { publicAssetUrl } from "@/lib/utils";
import type { Project } from "@/lib/data";

export function ProjectCard({ project }: { project: Project }) {
  const cover = publicAssetUrl(project.cover_image_path);

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
        {cover ? (
          <Image
            src={cover}
            alt={`${project.title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // gradient placeholder so cards without a cover still read as rich
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--color-grad-from), var(--color-grad-via), var(--color-grad-to))",
            }}
          >
            <span className="text-5xl font-bold text-white/90">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3 text-ink">
            <Link href={`/projects/${project.slug}`} className="hover:text-accent-600 dark:hover:text-accent-300">
              {project.title}
            </Link>
          </h3>
          {project.status === "in_progress" && <Badge tone="accent">In progress</Badge>}
        </div>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">
          {project.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech_stack.slice(0, 6).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-4 text-sm">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 font-medium text-accent-600 hover:text-accent-500 dark:text-accent-300"
          >
            Case study <ArrowUpRight size={15} />
          </Link>
          {project.repo_url && (
            <Link
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-muted hover:text-ink"
            >
              <GithubIcon size={15} /> Code
            </Link>
          )}
          {project.live_url && (
            <Link
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-muted hover:text-ink"
            >
              Live <ArrowUpRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
