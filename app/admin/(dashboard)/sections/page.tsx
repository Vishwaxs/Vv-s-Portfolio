import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Sections" };

export default async function SectionsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("sections").select("*").order("slug");

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Page sections</h1>
      <p className="text-sm text-ink-muted">
        Copy blocks used on the public pages (hero, about, contact).
      </p>
      <EntityManager
        table="sections"
        rows={data ?? []}
        titleField="slug"
        listColumns={["slug", "title", "published"]}
        fields={[
          { name: "slug", label: "Slug", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "subtitle", label: "Subtitle", type: "text" },
          { name: "body_md", label: "Body (markdown)", type: "textarea" },
          { name: "published", label: "Published", type: "checkbox" },
        ]}
      />
    </div>
  );
}
