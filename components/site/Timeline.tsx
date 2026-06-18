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
    <ol className="relative md:before:absolute md:before:left-1/2 md:before:top-0 md:before:h-full md:before:w-px md:before:-translate-x-1/2 md:before:bg-line">
      {items.map((item, i) => {
        const left = i % 2 === 0;
        return (
          <li
            key={item.id}
            className={[
              "relative mb-8 pl-8 md:mb-10 md:w-1/2 md:pl-0",
              left ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12",
            ].join(" ")}
          >
            {/* node: left rail on mobile, center rail on desktop */}
            <span
              className={[
                "absolute top-1.5 h-3 w-3 rounded-full border-2 border-accent-500 bg-surface-0",
                "left-0 md:left-auto",
                left ? "md:-right-1.5" : "md:-left-1.5",
              ].join(" ")}
            />
            <div
              className={[
                "rounded-card border border-line bg-surface-1 p-5 transition-shadow hover:shadow-card",
              ].join(" ")}
            >
              <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                {formatDate(item.start)} — {formatDate(item.end)}
              </div>
              <h3 className="mt-1 font-semibold text-ink">{item.title}</h3>
              <div className="text-sm text-ink-secondary">
                {item.organization}
                {item.meta && <span className="text-ink-muted"> · {item.meta}</span>}
              </div>
              {item.body && (
                <div className="mt-2 text-left text-sm">
                  <Markdown>{item.body}</Markdown>
                </div>
              )}
              {item.highlights && item.highlights.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-left text-sm text-ink-secondary">
                  {item.highlights.map((h, hi) => (
                    <li key={hi}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
