import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/** Cookie-less anon client for cached public reads (usable inside unstable_cache,
 *  generateStaticParams, and at build time). RLS exposes published rows only. */
export function createAnonClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://invalid.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key-missing",
    { auth: { persistSession: false } }
  );
}
