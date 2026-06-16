"use client";

import { useState, useTransition } from "react";
import { saveSetting } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { Json } from "@/lib/database.types";

type Seo = {
  site_name?: string;
  title_template?: string;
  default_description?: string;
};
type Analytics = { ga_id?: string | null };

export function SettingsForm({ initial }: { initial: Record<string, Json> }) {
  const seo = (initial.seo ?? {}) as Seo;
  const analytics = (initial.analytics ?? {}) as Analytics;

  const [siteName, setSiteName] = useState(seo.site_name ?? "");
  const [titleTemplate, setTitleTemplate] = useState(seo.title_template ?? "");
  const [description, setDescription] = useState(seo.default_description ?? "");
  const [gaId, setGaId] = useState(analytics.ga_id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      setMessage(null);
      const r1 = await saveSetting("seo", {
        site_name: siteName,
        title_template: titleTemplate,
        default_description: description,
      });
      const r2 = await saveSetting("analytics", { ga_id: gaId || null });
      setMessage(r1.ok && r2.ok ? "Saved." : "Save failed — are you signed in as admin?");
    });

  return (
    <div className="max-w-xl space-y-4 rounded-card border border-line bg-surface-1 p-6">
      <Input label="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      <Input
        label="Title template"
        value={titleTemplate}
        onChange={(e) => setTitleTemplate(e.target.value)}
      />
      <Textarea
        label="Default meta description"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label="Google Analytics ID (optional)"
        placeholder="G-XXXXXXX"
        value={gaId}
        onChange={(e) => setGaId(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {message && <span className="text-sm text-ink-secondary">{message}</span>}
      </div>
    </div>
  );
}
