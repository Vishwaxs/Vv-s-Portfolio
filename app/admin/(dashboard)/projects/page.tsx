import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Projects" };

export default async function ProjectsAdmin() {
  const supabase = await createClient();
  const [{ data: projects }, { data: categories }] = await Promise.all([
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("project_categories").select("*").order("sort_order"),
  ]);

  const categoryOptions = [
    { value: "", label: "— none —" },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Projects</h1>
      <EntityManager
        table="projects"
        rows={projects ?? []}
        titleField="title"
        listColumns={["title", "slug", "status", "featured", "published", "sort_order"]}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "slug", label: "Slug", type: "text", help: "lowercase-with-dashes; used in the URL" },
          { name: "category_id", label: "Category", type: "select", options: categoryOptions },
          { name: "summary", label: "Summary", type: "textarea" },
          { name: "description_md", label: "Description (markdown)", type: "textarea" },
          { name: "tech_stack", label: "Tech stack (one per line)", type: "list" },
          { name: "repo_url", label: "Repo URL", type: "text" },
          { name: "live_url", label: "Live URL", type: "text" },
          { name: "video_url", label: "Video URL", type: "text" },
          { name: "recruiter_highlight", label: "Recruiter highlight (one line)", type: "text" },
          { name: "architecture_md", label: "Architecture (markdown)", type: "textarea" },
          { name: "challenges_md", label: "Challenges (markdown)", type: "textarea" },
          { name: "learnings_md", label: "Learnings (markdown)", type: "textarea" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "completed", label: "Completed" },
              { value: "in_progress", label: "In progress" },
              { value: "archived", label: "Archived" },
            ],
          },
          { name: "started_on", label: "Started", type: "date" },
          { name: "finished_on", label: "Finished", type: "date" },
          {
            name: "cover_image_path",
            label: "Cover image path",
            type: "text",
            help: "Path inside public-assets bucket, e.g. projects/slug/cover.png",
          },
          { name: "featured", label: "Featured on home", type: "checkbox" },
          { name: "published", label: "Published", type: "checkbox" },
          { name: "sort_order", label: "Sort order", type: "number" },
        ]}
      />
    </div>
  );
}
