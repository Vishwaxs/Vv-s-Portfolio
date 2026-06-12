import React from "react";

/** Minimal markdown renderer for trusted, admin-authored content.
 *  Supports headings, paragraphs, unordered lists, bold, italic,
 *  inline code, and links — no raw HTML passthrough. */

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // links, bold, code, italic
  const regex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const key = `${keyBase}-${i++}`;
    if (match[1]) {
      parts.push(
        <a
          key={key}
          href={match[3]}
          className="text-accent-600 underline underline-offset-2 hover:text-accent-500 dark:text-accent-300"
          target={match[3].startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      parts.push(<strong key={key}>{match[5]}</strong>);
    } else if (match[6]) {
      parts.push(
        <code key={key} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">
          {match[7]}
        </code>
      );
    } else if (match[8]) {
      parts.push(<em key={key}>{match[9]}</em>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ children }: { children: string }) {
  if (!children?.trim()) return null;
  const blocks = children.split(/\n\s*\n/);

  return (
    <div className="space-y-4 leading-relaxed text-ink-secondary">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim());
        if (lines.length === 0) return null;

        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={bi} className="list-disc space-y-1.5 pl-5">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }

        const heading = /^(#{2,4})\s+(.*)$/.exec(lines[0]);
        if (heading && lines.length === 1) {
          const level = heading[1].length;
          const Tag = (`h${level}` as keyof React.JSX.IntrinsicElements);
          return (
            <Tag key={bi} className="font-semibold text-ink">
              {renderInline(heading[2], `${bi}`)}
            </Tag>
          );
        }

        return <p key={bi}>{renderInline(lines.join(" "), `${bi}`)}</p>;
      })}
    </div>
  );
}
