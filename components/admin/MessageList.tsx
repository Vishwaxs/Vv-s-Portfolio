"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, CheckCheck, ShieldAlert } from "lucide-react";
import { setMessageStatus } from "@/app/admin/actions";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import type { Tables } from "@/lib/database.types";

type Message = Tables<"contact_messages">;

const statusTone = {
  new: "accent",
  read: "neutral",
  archived: "neutral",
  spam: "danger",
} as const;

export function MessageList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const update = (id: string, status: "read" | "archived" | "spam") =>
    startTransition(async () => {
      await setMessageStatus(id, status);
      router.refresh();
    });

  if (messages.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-muted">No messages yet.</p>;
  }

  return (
    <ul className="divide-y divide-line rounded-card border border-line">
      {messages.map((m) => (
        <li key={m.id}>
          <button
            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-surface-1"
            onClick={() => {
              setOpen(open === m.id ? null : m.id);
              if (m.status === "new") update(m.id, "read");
            }}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ink">
                {m.name} <span className="font-normal text-ink-muted">&lt;{m.email}&gt;</span>
              </div>
              <div className="truncate text-sm text-ink-secondary">
                {m.subject || m.message.slice(0, 80)}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Badge tone={statusTone[m.status as keyof typeof statusTone] ?? "neutral"}>
                {m.status}
              </Badge>
              <span className="text-xs text-ink-muted">{formatDateTime(m.created_at)}</span>
            </div>
          </button>

          {open === m.id && (
            <div className="border-t border-line bg-surface-1 px-4 py-4">
              <p className="whitespace-pre-wrap text-sm text-ink">{m.message}</p>
              <div className="mt-4 flex gap-2">
                <a
                  href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "your message")}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-accent-500"
                >
                  Reply by email
                </a>
                <ActionChip icon={CheckCheck} label="Mark read" onClick={() => update(m.id, "read")} />
                <ActionChip icon={Archive} label="Archive" onClick={() => update(m.id, "archived")} />
                <ActionChip icon={ShieldAlert} label="Spam" onClick={() => update(m.id, "spam")} />
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function ActionChip({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-0 px-3.5 py-1.5 text-xs text-ink-secondary hover:bg-surface-2"
    >
      <Icon size={13} /> {label}
    </button>
  );
}
