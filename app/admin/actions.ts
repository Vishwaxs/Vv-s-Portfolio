"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import {
  entitySchemas,
  entityTags,
  type EntityTable,
} from "@/lib/validation/entities";
import type { Json } from "@/lib/database.types";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) throw new Error("Not an admin");
  return supabase;
}

/** Create or update a row in any whitelisted content table.
 *  Validates with the shared zod schema; writes run under the admin's
 *  RLS session; every change lands in audit_logs and busts the cache tag. */
export async function saveEntity(
  table: EntityTable,
  values: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const schema = entitySchemas[table];
    if (!schema) return { ok: false, error: "Unknown table" };
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      };
    }

    const supabase = await requireAdmin();
    const { id, ...data } = parsed.data as { id?: string } & Record<
      string,
      unknown
    >;

    if (id) {
      const { data: before } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      const { error } = await supabase
        .from(table)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(data as any)
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
      await writeAudit({
        action: "update",
        entityType: table,
        entityId: id,
        before: before as Json,
        after: data as Json,
      });
      revalidateTag(entityTags[table]);
      return { ok: true, id };
    }

    const { data: inserted, error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(data as any)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      action: "create",
      entityType: table,
      entityId: inserted.id,
      after: data as Json,
    });
    revalidateTag(entityTags[table]);
    return { ok: true, id: inserted.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteEntity(
  table: EntityTable,
  id: string
): Promise<ActionResult> {
  try {
    if (!entitySchemas[table]) return { ok: false, error: "Unknown table" };
    const supabase = await requireAdmin();
    const { data: before } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      action: "delete",
      entityType: table,
      entityId: id,
      before: before as Json,
    });
    revalidateTag(entityTags[table]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setMessageStatus(
  id: string,
  status: "new" | "read" | "archived" | "spam"
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function saveSetting(
  key: string,
  value: Json
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value });
    if (error) return { ok: false, error: error.message };
    await writeAudit({ action: "update", entityType: "site_settings", after: { key, value } });
    revalidateTag("settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
