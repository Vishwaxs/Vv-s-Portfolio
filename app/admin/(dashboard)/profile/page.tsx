import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Profile" };

export default async function ProfileAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("profile").select("*").limit(1);

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Profile</h1>
      <EntityManager
        table="profile"
        singleton
        rows={data ?? []}
        titleField="full_name"
        listColumns={[]}
        fields={[
          { name: "full_name", label: "Full name", type: "text" },
          { name: "headline", label: "Headline", type: "text" },
          { name: "tagline", label: "Tagline", type: "textarea" },
          { name: "bio_md", label: "Bio (markdown)", type: "textarea" },
          { name: "location", label: "Location", type: "text" },
          { name: "email", label: "Email", type: "text" },
          { name: "phone", label: "Phone", type: "text" },
          {
            name: "avatar_path",
            label: "Avatar path",
            type: "text",
            help: "Path inside the public-assets storage bucket, e.g. avatar.jpg",
          },
        ]}
      />
    </div>
  );
}
