"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Tables } from "@/lib/database.types";

/** Lets a visitor view the portfolio tuned for a target role.
 *  Sets a cookie via /api/role, then refreshes server components. */
export function RoleSwitcher({
  roles,
  activeSlug,
}: {
  roles: Pick<Tables<"roles">, "slug" | "name">[];
  activeSlug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (roles.length < 2) return null;

  const change = async (slug: string) => {
    await fetch("/api/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: slug }),
    });
    startTransition(() => router.refresh());
  };

  return (
    <label className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="hidden sm:inline">Viewing as</span>
      <select
        value={activeSlug}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        aria-label="View portfolio for role"
        className="rounded-full border border-line bg-surface-1 px-3 py-1.5 text-sm text-ink hover:bg-surface-2"
      >
        {roles.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}
