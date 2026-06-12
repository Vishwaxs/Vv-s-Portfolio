"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, X } from "lucide-react";
import { generateSuggestions, resolveSuggestion } from "@/app/admin/resume-actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Tables } from "@/lib/database.types";

type Suggestion = Tables<"sync_suggestions">;

const actionTone = { create: "success", update: "accent", delete: "danger" } as const;

/** AI sync suggestions with a side-by-side diff; nothing applies without
 *  an explicit approve. */
export function SuggestionReview({
  resumeId,
  suggestions,
  aiAvailable,
  hasParsed,
}: {
  resumeId: string;
  suggestions: Suggestion[];
  aiAvailable: boolean;
  hasParsed: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const generate = () =>
    startTransition(async () => {
      setError(null);
      const res = await generateSuggestions(resumeId);
      if (!res.ok) setError(res.error);
      router.refresh();
    });

  const resolve = (id: string, decision: "approved" | "rejected") =>
    startTransition(async () => {
      setError(null);
      const res = await resolveSuggestion(id, decision);
      if (!res.ok) setError(res.error);
      router.refresh();
    });

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const resolved = suggestions.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h3 text-ink">Sync suggestions</h2>
        {aiAvailable && hasParsed && (
          <Button size="sm" variant="secondary" onClick={generate} disabled={pending}>
            <RefreshCw size={14} /> {pending ? "Working…" : "Generate from this resume"}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {pendingSuggestions.length === 0 && (
        <p className="text-sm text-ink-muted">
          {aiAvailable
            ? "No pending suggestions. Generate to diff this resume against live content."
            : "AI suggestions require ANTHROPIC_API_KEY."}
        </p>
      )}

      {pendingSuggestions.map((s) => (
        <div key={s.id} className="rounded-card border border-line bg-surface-1 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={actionTone[s.action as keyof typeof actionTone] ?? "neutral"}>
              {s.action}
            </Badge>
            <span className="text-sm font-medium text-ink">{s.entity_type}</span>
            {typeof s.confidence === "number" && (
              <span className="text-xs text-ink-muted">
                {Math.round(s.confidence * 100)}% confident
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-ink-secondary">{s.rationale}</p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <DiffPane title="Current" value={s.current_value} empty="(new)" />
            <DiffPane title="Suggested" value={s.suggested_value} empty="(removal)" />
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => resolve(s.id, "approved")} disabled={pending}>
              <Check size={14} /> Approve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => resolve(s.id, "rejected")}
              disabled={pending}
            >
              <X size={14} /> Reject
            </Button>
          </div>
        </div>
      ))}

      {resolved.length > 0 && (
        <details className="text-sm text-ink-muted">
          <summary className="cursor-pointer">Resolved ({resolved.length})</summary>
          <ul className="mt-2 space-y-1">
            {resolved.map((s) => (
              <li key={s.id}>
                <Badge tone={s.status === "approved" ? "success" : "neutral"}>{s.status}</Badge>{" "}
                {s.action} {s.entity_type}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function DiffPane({
  title,
  value,
  empty,
}: {
  title: string;
  value: unknown;
  empty: string;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {title}
      </div>
      {value ? (
        <pre className="max-h-56 overflow-auto rounded-lg bg-surface-2 p-3 text-xs text-ink">
          {JSON.stringify(value, null, 2)}
        </pre>
      ) : (
        <p className="rounded-lg bg-surface-2 p-3 text-xs italic text-ink-muted">{empty}</p>
      )}
    </div>
  );
}
