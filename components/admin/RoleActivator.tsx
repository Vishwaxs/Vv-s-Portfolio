"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { setActiveRole } from "@/app/admin/(dashboard)/roles/actions";
import { Badge } from "@/components/ui/Badge";
import type { Tables } from "@/lib/database.types";

type Role = Pick<Tables<"roles">, "id" | "name" | "slug" | "is_active" | "published">;

/** Pick which single role the public site shows. Replaces the old public
 *  role switcher — visitors no longer choose; the admin does. */
export function RoleActivator({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const activate = (id: string) =>
    startTransition(async () => {
      setError(null);
      const res = await setActiveRole(id);
      if (!res.ok) setError(res.error);
      router.refresh();
    });

  return (
    <div className="rounded-card border border-line bg-surface-1 p-5">
      <h2 className="text-h3 text-ink">Active persona (shown publicly)</h2>
      <p className="mt-1 text-sm text-ink-muted">
        The public site shows exactly one role&apos;s hero copy and re-ranks
        projects/skills for it. Pick which one visitors see.
      </p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <ul className="mt-4 divide-y divide-line">
        {roles.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-ink">
              {r.name}
              {!r.published && <Badge tone="neutral">unpublished</Badge>}
              {r.is_active && <Badge tone="success">active</Badge>}
            </span>
            <button
              disabled={pending || r.is_active}
              onClick={() => activate(r.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-secondary hover:bg-surface-2 disabled:opacity-50"
            >
              {r.is_active ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              {r.is_active ? "Active" : "Make active"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
