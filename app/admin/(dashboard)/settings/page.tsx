import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*");
  const settings = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Site settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
