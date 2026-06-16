"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { importParsed } from "@/app/admin/resume-actions";
import type { ParsedResumeType } from "@/lib/ai/resume-schema";
import { Button } from "@/components/ui/Button";

type SectionKey =
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "achievements";

const sections: { key: SectionKey; label: string; render: (item: never) => string }[] = [
  {
    key: "skills",
    label: "Skills",
    render: (s: { name: string; level: number | null }) =>
      s.level ? `${s.name} (level ${s.level})` : s.name,
  },
  {
    key: "projects",
    label: "Projects",
    render: (p: { title: string; summary: string }) => `${p.title} — ${p.summary}`,
  },
  {
    key: "experience",
    label: "Experience",
    render: (e: { role: string; organization: string }) => `${e.role} @ ${e.organization}`,
  },
  {
    key: "education",
    label: "Education",
    render: (e: { degree: string; institution: string }) => `${e.degree}, ${e.institution}`,
  },
  {
    key: "certifications",
    label: "Certifications",
    render: (c: { name: string; issuer: string | null }) =>
      c.issuer ? `${c.name} (${c.issuer})` : c.name,
  },
  {
    key: "achievements",
    label: "Achievements",
    render: (a: { title: string }) => a.title,
  },
];

/** Checkbox review of parsed resume data → selective import as drafts. */
export function ParsedReview({
  resumeId,
  parsed,
}: {
  resumeId: string;
  parsed: ParsedResumeType;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (key: string) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const submit = () =>
    startTransition(async () => {
      setMessage(null);
      const selection: Partial<Record<SectionKey, number[]>> = {};
      for (const [key, on] of Object.entries(selected)) {
        if (!on) continue;
        const [section, index] = key.split(":");
        (selection[section as SectionKey] ??= []).push(Number(index));
      }
      const res = await importParsed(resumeId, selection);
      setMessage(
        res.ok
          ? "Imported as unpublished drafts — review them in their entity pages."
          : res.error
      );
      if (res.ok) {
        setSelected({});
        router.refresh();
      }
    });

  const count = Object.values(selected).filter(Boolean).length;

  return (
    <div className="space-y-6 rounded-card border border-line bg-surface-1 p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h3 text-ink">Parsed content</h2>
        <Button size="sm" onClick={submit} disabled={pending || count === 0}>
          <Download size={14} />
          {pending ? "Importing…" : `Import selected (${count})`}
        </Button>
      </div>
      {message && <p className="text-sm text-ink-secondary">{message}</p>}

      {parsed.basics.name && (
        <p className="text-sm text-ink-muted">
          {parsed.basics.name}
          {parsed.basics.headline && ` · ${parsed.basics.headline}`}
          {parsed.basics.location && ` · ${parsed.basics.location}`}
        </p>
      )}

      {sections.map(({ key, label, render }) => {
        const items = parsed[key] as unknown[];
        if (!items?.length) return null;
        return (
          <div key={key}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              {label}
            </h3>
            <ul className="space-y-1.5">
              {items.map((item, i) => {
                const k = `${key}:${i}`;
                return (
                  <li key={k}>
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={Boolean(selected[k])}
                        onChange={() => toggle(k)}
                        className="mt-0.5 h-4 w-4 accent-accent-600"
                      />
                      <span>{render(item as never)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
