import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Experience" };

export default async function ExperienceAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("experience").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Experience</h1>
      <p className="text-sm text-ink-muted">
        Only add roles you actually held — entries render on the public site once published.
      </p>
      <EntityManager
        table="experience"
        rows={data ?? []}
        titleField="role"
        listColumns={["role", "organization", "start_date", "published"]}
        fields={[
          { name: "role", label: "Role", type: "text" },
          { name: "organization", label: "Organization", type: "text" },
          { name: "org_url", label: "Organization URL", type: "text" },
          { name: "location", label: "Location", type: "text" },
          { name: "employment_type", label: "Type (intern, part-time…)", type: "text" },
          { name: "start_date", label: "Start date", type: "date" },
          { name: "end_date", label: "End date (empty = present)", type: "date" },
          { name: "summary_md", label: "Summary (markdown)", type: "textarea" },
          { name: "highlights", label: "Highlights (one per line)", type: "list" },
          { name: "tech", label: "Tech (one per line)", type: "list" },
          { name: "published", label: "Published", type: "checkbox" },
          { name: "sort_order", label: "Sort order", type: "number" },
        ]}
      />
    </div>
  );
}
