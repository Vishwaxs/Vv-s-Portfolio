import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";

/** Append an audit log entry as the signed-in admin (RLS: insert-only). */
export async function writeAudit(entry: {
  action: "create" | "update" | "delete" | "login" | "publish" | "activate" | "approve" | "reject";
  entityType: string;
  entityId?: string | null;
  before?: Json | null;
  after?: Json | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("audit_logs").insert({
    actor_id: user?.id ?? null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    before: entry.before ?? null,
    after: entry.after ?? null,
  });
}
