import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Education" };

export default async function EducationAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("education").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Education</h1>
      <EntityManager
        table="education"
        rows={data ?? []}
        titleField="institution"
        listColumns={["institution", "degree", "grade", "published"]}
        fields={[
          { name: "institution", label: "Institution", type: "text" },
          { name: "degree", label: "Degree", type: "text" },
          { name: "field", label: "Field", type: "text" },
          { name: "start_date", label: "Start date", type: "date" },
          { name: "end_date", label: "End date", type: "date" },
          { name: "grade", label: "Grade", type: "text", help: "e.g. 8.0 CGPA (in progress)" },
          { name: "highlights", label: "Highlights (one per line)", type: "list" },
          { name: "published", label: "Published", type: "checkbox" },
          { name: "sort_order", label: "Sort order", type: "number" },
        ]}
      />
    </div>
  );
}
