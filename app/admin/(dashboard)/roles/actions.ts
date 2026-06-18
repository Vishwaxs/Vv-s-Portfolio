"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import type { ActionResult } from "@/app/admin/actions";

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

/** Mark one role as the active persona shown on the public site. The partial
 *  unique index enforces a single active row, so clear all first. */
export async function setActiveRole(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    await supabase.from("roles").update({ is_active: false }).eq("is_active", true);
    const { error } = await supabase.from("roles").update({ is_active: true }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    await writeAudit({ action: "activate", entityType: "roles", entityId: id });
    // active role changes hero copy + project/skill ranking on public pages
    ["roles", "projects", "skills"].forEach(revalidateTag);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
