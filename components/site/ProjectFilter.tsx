"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/site/ProjectCard";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/data";
import type { Tables } from "@/lib/database.types";

export function ProjectFilter({
  projects,
  categories,
}: {
  projects: Project[];
  categories: Tables<"project_categories">[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const visible = active
    ? projects.filter((p) => p.project_categories?.slug === active)
    : projects;

  return (
    <div>
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
          <FilterChip label="All" selected={active === null} onClick={() => setActive(null)} />
          {categories.map((c) => (
            <FilterChip
              key={c.slug}
              label={c.name}
              selected={active === c.slug}
              onClick={() => setActive(c.slug)}
            />
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {visible.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-12 text-center text-ink-muted">No projects in this category yet.</p>
      )}
    </div>
  );
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-colors",
        selected
          ? "border-accent-500 bg-accent-600 text-white"
          : "border-line bg-surface-1 text-ink-secondary hover:bg-surface-2"
      )}
    >
      {label}
    </button>
  );
}
