import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Social links" };

export default async function SocialAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("social_links").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Social links</h1>
      <EntityManager
        table="social_links"
        rows={data ?? []}
        titleField="platform"
        listColumns={["platform", "url", "published", "sort_order"]}
        fields={[
          { name: "platform", label: "Platform", type: "text" },
          { name: "url", label: "URL", type: "text" },
          { name: "label", label: "Label", type: "text" },
          {
            name: "icon",
            label: "Icon",
            type: "select",
            options: [
              { value: "github", label: "GitHub" },
              { value: "linkedin", label: "LinkedIn" },
              { value: "twitter", label: "X / Twitter" },
              { value: "email", label: "Email" },
              { value: "", label: "Generic link" },
            ],
          },
          { name: "published", label: "Published", type: "checkbox" },
          { name: "sort_order", label: "Sort order", type: "number" },
        ]}
      />
    </div>
  );
}
