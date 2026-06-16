import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Roles" };

export default async function RolesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("roles").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Portfolio roles</h1>
      <p className="text-sm text-ink-muted">
        Each role re-ranks projects and skills for a target audience and swaps
        the hero copy. Weights are JSON maps of slug → number, e.g.{" "}
        <code className="rounded bg-surface-2 px-1">{"{"}&quot;react&quot;: 1.0{"}"}</code>.
      </p>
      <EntityManager
        table="roles"
        rows={data ?? []}
        titleField="name"
        listColumns={["name", "slug", "is_default", "published"]}
        fields={[
          { name: "name", label: "Name", type: "text" },
          { name: "slug", label: "Slug", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "hero_headline", label: "Hero headline", type: "text" },
          { name: "hero_tagline", label: "Hero tagline", type: "textarea" },
          {
            name: "skill_weights",
            label: "Skill weights (JSON: skill-slug → weight)",
            type: "json",
          },
          {
            name: "keyword_boosts",
            label: "Keyword boosts (JSON: keyword → weight)",
            type: "json",
            help: "Matched against project titles, summaries and tech stacks",
          },
          { name: "is_default", label: "Default role", type: "checkbox" },
          { name: "published", label: "Published", type: "checkbox" },
          { name: "sort_order", label: "Sort order", type: "number" },
        ]}
      />
    </div>
  );
}
