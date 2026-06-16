"use client";

import { usePathname, useRouter } from "next/navigation";

export function MobileNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <select
      className="w-full rounded-lg border border-line bg-surface-0 px-3 py-2 text-sm text-ink"
      value={items.some((i) => i.href === pathname) ? pathname : "/admin"}
      aria-label="Admin navigation"
      onChange={(e) => router.push(e.target.value)}
    >
      {items.map((n) => (
        <option key={n.href} value={n.href}>
          {n.label}
        </option>
      ))}
    </select>
  );
}
