import { Badge } from "@/components/ui/Badge";
import type { SkillCategory } from "@/lib/data";

const levelLabels = ["", "Learning", "Basic", "Comfortable", "Strong", "Expert"];

export function SkillGrid({ categories }: { categories: SkillCategory[] }) {
  const nonEmpty = categories.filter((c) => c.skills.length > 0);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {nonEmpty.map((cat) => (
        <div
          key={cat.id}
          className="rounded-card border border-line bg-surface-1 p-5 transition-shadow hover:shadow-card"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            {cat.name}
          </h3>
          <ul className="space-y-3.5">
            {cat.skills.map((s) => (
              <li key={s.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-sm text-ink">
                    {s.name}
                    {s.featured && (
                      <Badge tone="accent" className="ml-2">
                        core
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-ink-muted">{levelLabels[s.level]}</span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-surface-3"
                  role="meter"
                  aria-valuenow={s.level}
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-label={`${s.name}: ${levelLabels[s.level]}`}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${(s.level / 5) * 100}%`,
                      backgroundImage:
                        "linear-gradient(to right, var(--color-accent-500), var(--color-grad-via))",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
