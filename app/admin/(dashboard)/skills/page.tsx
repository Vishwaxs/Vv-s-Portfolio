import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Skills" };

export default async function SkillsAdmin() {
  const supabase = await createClient();
  const [{ data: skills }, { data: categories }] = await Promise.all([
    supabase.from("skills").select("*").order("sort_order"),
    supabase.from("skill_categories").select("*").order("sort_order"),
  ]);

  const categoryOptions = [
    { value: "", label: "— none —" },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h1 className="text-h2 text-ink">Skills</h1>
        <EntityManager
          table="skills"
          rows={skills ?? []}
          titleField="name"
          listColumns={["name", "level", "featured", "published", "sort_order"]}
          fields={[
            { name: "name", label: "Name", type: "text" },
            { name: "category_id", label: "Category", type: "select", options: categoryOptions },
            {
              name: "level",
              label: "Level (1–5)",
              type: "select",
              options: [
                { value: "1", label: "1 · Learning" },
                { value: "2", label: "2 · Basic" },
                { value: "3", label: "3 · Comfortable" },
                { value: "4", label: "4 · Strong" },
                { value: "5", label: "5 · Expert" },
              ],
            },
            { name: "featured", label: "Core skill", type: "checkbox" },
            { name: "published", label: "Published", type: "checkbox" },
            { name: "sort_order", label: "Sort order", type: "number" },
          ]}
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-h3 text-ink">Skill categories</h2>
        <EntityManager
          table="skill_categories"
          rows={categories ?? []}
          titleField="name"
          listColumns={["name", "slug", "sort_order"]}
          fields={[
            { name: "name", label: "Name", type: "text" },
            { name: "slug", label: "Slug", type: "text" },
            { name: "sort_order", label: "Sort order", type: "number" },
          ]}
        />
      </div>
    </div>
  );
}
