import { formatDate } from "@/lib/utils";
import { Markdown } from "@/components/site/Markdown";

export type TimelineItem = {
  id: string;
  title: string;
  organization: string;
  meta?: string;
  start: string;
  end: string | null;
  body?: string;
  highlights?: string[];
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-8 border-l border-line pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[1.85rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent-500 bg-surface-0" />
          <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {formatDate(item.start)} — {formatDate(item.end)}
          </div>
          <h3 className="mt-1 font-semibold text-ink">{item.title}</h3>
          <div className="text-sm text-ink-secondary">
            {item.organization}
            {item.meta && <span className="text-ink-muted"> · {item.meta}</span>}
          </div>
          {item.body && (
            <div className="mt-2 text-sm">
              <Markdown>{item.body}</Markdown>
            </div>
          )}
          {item.highlights && item.highlights.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-secondary">
              {item.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
