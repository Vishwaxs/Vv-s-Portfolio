import { Badge } from "@/components/ui/Badge";
import type { SkillCategory } from "@/lib/data";

const levelLabels = ["", "Learning", "Basic", "Comfortable", "Strong", "Expert"];

export function SkillGrid({ categories }: { categories: SkillCategory[] }) {
  const nonEmpty = categories.filter((c) => c.skills.length > 0);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {nonEmpty.map((cat) => (
        <div key={cat.id} className="rounded-card border border-line bg-surface-1 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            {cat.name}
          </h3>
          <ul className="space-y-2.5">
            {cat.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink">
                  {s.name}
                  {s.featured && (
                    <Badge tone="accent" className="ml-2">core</Badge>
                  )}
                </span>
                <span
                  className="flex gap-1"
                  aria-label={`${s.name}: ${levelLabels[s.level]}`}
                  title={levelLabels[s.level]}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={
                        i <= s.level
                          ? "h-1.5 w-4 rounded-full bg-accent-500"
                          : "h-1.5 w-4 rounded-full bg-surface-3"
                      }
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
