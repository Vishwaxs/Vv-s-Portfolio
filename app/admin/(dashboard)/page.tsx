import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";

export default async function AdminOverview() {
  const supabase = await createClient();

  const [messages, suggestions, audit, projects] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("sync_suggestions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("audit_logs")
      .select("action, entity_type, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
  ]);

  const stats = [
    { label: "New messages", value: messages.count ?? 0, href: "/admin/messages" },
    { label: "Pending suggestions", value: suggestions.count ?? 0, href: "/admin/resumes" },
    { label: "Published projects", value: projects.count ?? 0, href: "/admin/projects" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-h2 text-ink">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 transition-colors hover:bg-surface-2">
              <div className="text-3xl font-bold text-ink">{s.value}</div>
              <div className="mt-1 text-sm text-ink-muted">{s.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-h3 text-ink">Recent activity</h2>
        {audit.data && audit.data.length > 0 ? (
          <ul className="divide-y divide-line rounded-card border border-line text-sm">
            {audit.data.map((a, i) => (
              <li key={i} className="flex justify-between gap-4 px-4 py-3">
                <span className="text-ink">
                  <span className="font-medium">{a.action}</span> {a.entity_type}
                </span>
                <span className="shrink-0 text-ink-muted">{formatDateTime(a.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
