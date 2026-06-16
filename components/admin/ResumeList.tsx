"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, FileText, Sparkles, Trash2 } from "lucide-react";
import {
  activateResume,
  cloneResume,
  deleteResume,
  parseResume,
} from "@/app/admin/resume-actions";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import type { Tables } from "@/lib/database.types";

const statusTone = {
  pending: "neutral",
  parsing: "accent",
  parsed: "success",
  failed: "danger",
  manual: "warning",
} as const;

export function ResumeList({
  resumes,
  aiAvailable,
}: {
  resumes: Tables<"resumes">[];
  aiAvailable: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const run = (id: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    setBusyId(id);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Failed");
      setBusyId(null);
      router.refresh();
    });
  };

  if (resumes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-muted">
        No resumes yet — upload the first version above.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-danger">{error}</p>}
      {resumes.map((r) => (
        <div
          key={r.id}
          className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface-1 p-4"
        >
          <FileText size={18} className="shrink-0 text-accent-500" />
          <div className="min-w-0 flex-1">
            <Link
              href={`/admin/resumes/${r.id}`}
              className="font-medium text-ink hover:text-accent-600 dark:hover:text-accent-300"
            >
              {r.title}
            </Link>
            <span className="ml-2 text-xs text-ink-muted">v{r.version}</span>
            <div className="text-xs text-ink-muted">{formatDateTime(r.created_at)}</div>
          </div>

          <Badge tone={statusTone[r.parse_status as keyof typeof statusTone] ?? "neutral"}>
            {r.parse_status}
          </Badge>
          {r.is_active && <Badge tone="success">active</Badge>}

          <div className="flex items-center gap-1">
            {aiAvailable && r.storage_path && r.parse_status !== "parsing" && (
              <IconButton
                title="Parse with AI"
                disabled={busyId === r.id}
                onClick={() => run(r.id, () => parseResume(r.id))}
              >
                <Sparkles size={15} />
              </IconButton>
            )}
            {!r.is_active && (
              <IconButton
                title="Make active"
                disabled={busyId === r.id}
                onClick={() => run(r.id, () => activateResume(r.id))}
              >
                <CheckCircle2 size={15} />
              </IconButton>
            )}
            <IconButton
              title="Clone as new version"
              disabled={busyId === r.id}
              onClick={() => run(r.id, () => cloneResume(r.id, ""))}
            >
              <Copy size={15} />
            </IconButton>
            <IconButton
              title="Delete"
              disabled={busyId === r.id}
              onClick={() => {
                if (confirm(`Delete "${r.title}"?`)) run(r.id, () => deleteResume(r.id));
              }}
            >
              <Trash2 size={15} />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
}

function IconButton({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded p-2 text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-40"
    >
      {children}
    </button>
  );
}
