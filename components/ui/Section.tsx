import { cn } from "@/lib/utils";

/** Consistent page section: max width, padding, optional heading block. */
export function Section({
  id,
  title,
  subtitle,
  className,
  children,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-5xl px-6 py-16", className)}>
      {(title || subtitle) && (
        <div className="mb-10">
          {title && <h2 className="text-h2 text-ink">{title}</h2>}
          {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
