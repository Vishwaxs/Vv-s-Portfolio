import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Achievements" };

export default async function AchievementsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("achievements").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Achievements</h1>
      <EntityManager
        table="achievements"
        rows={data ?? []}
        titleField="title"
        listColumns={["title", "date", "published"]}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "description_md", label: "Description (markdown)", type: "textarea" },
          { name: "date", label: "Date", type: "date" },
          { name: "url", label: "URL", type: "text" },
          { name: "published", label: "Published", type: "checkbox" },
          { name: "sort_order", label: "Sort order", type: "number" },
        ]}
      />
    </div>
  );
}
