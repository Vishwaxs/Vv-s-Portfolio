"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** A frosted-glass card with a cursor-following accent "spotlight".
 *  The spotlight is a radial highlight positioned at the pointer via CSS
 *  variables, revealed on hover. Pure CSS paint — no re-renders on move. */
export function SpotlightCard({
  className,
  innerClassName,
  children,
}: {
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "group/spot glass relative overflow-hidden rounded-card shadow-card",
        className
      )}
    >
      {/* spotlight glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), color-mix(in oklch, var(--color-accent-500) 20%, transparent), transparent 65%)",
        }}
      />
      {/* hairline highlight on top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in oklch, var(--color-accent-300) 60%, transparent), transparent)",
        }}
      />
      <div className={cn("relative", innerClassName)}>{children}</div>
    </div>
  );
}
