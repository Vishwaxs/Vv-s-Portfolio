import { createClient } from "@/lib/supabase/server";
import { EntityManager } from "@/components/admin/EntityManager";

export const metadata = { title: "Certifications" };

export default async function CertificationsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("certifications").select("*").order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-h2 text-ink">Certifications</h1>
      <p className="text-sm text-ink-muted">
        Add a credential URL and mark verified before publishing — unverifiable
        certifications hurt credibility more than they help.
      </p>
      <EntityManager
        table="certifications"
        rows={data ?? []}
        titleField="name"
        listColumns={["name", "issuer", "verified", "published"]}
        fields={[
          { name: "name", label: "Name", type: "text" },
          { name: "issuer", label: "Issuer", type: "text" },
          { name: "issue_date", label: "Issue date", type: "date" },
          { name: "credential_url", label: "Credential URL", type: "text" },
          { name: "credential_id", label: "Credential ID", type: "text" },
          { name: "verified", label: "Verified", type: "checkbox" },
          { name: "published", label: "Published", type: "checkbox" },
          { name: "sort_order", label: "Sort order", type: "number" },
        ]}
      />
    </div>
  );
}
