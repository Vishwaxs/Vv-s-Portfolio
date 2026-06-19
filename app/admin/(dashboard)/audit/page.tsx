import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Audit log" };

export default async function AuditAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Audit log</h1>
      <p className="text-sm text-ink-muted">
        Append-only record of every admin change. Rows cannot be edited or deleted.
      </p>
      {data && data.length > 0 ? (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-1 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((row) => (
                <tr key={row.id} className="align-top hover:bg-surface-1">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        row.action === "delete"
                          ? "danger"
                          : row.action === "create"
                            ? "success"
                            : "neutral"
                      }
                    >
                      {row.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink">{row.entity_type}</td>
                  <td className="max-w-md px-4 py-3">
                    {(row.before || row.after) && (
                      <details>
                        <summary className="cursor-pointer text-xs text-accent-600 dark:text-accent-300">
                          diff
                        </summary>
                        <pre className="mt-2 max-h-48 overflow-auto rounded bg-surface-2 p-2 text-xs">
                          {JSON.stringify({ before: row.before, after: row.after }, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-ink-muted">No entries yet.</p>
      )}
    </div>
  );
}
