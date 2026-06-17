import { createClient } from "@/lib/supabase/server";
import { aiAvailable, providerLabel } from "@/lib/ai/provider";
import { ResumeList } from "@/components/admin/ResumeList";
import { ResumeUploader } from "@/components/admin/ResumeUploader";

export const metadata = { title: "Resumes" };

export default async function ResumesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Resumes</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Upload versions, parse them with AI, and keep exactly one active —
            the public &ldquo;Download resume&rdquo; button always serves the active PDF.
          </p>
        </div>
      </div>

      {aiAvailable ? (
        <p className="rounded-lg border border-line bg-surface-1 px-4 py-3 text-sm text-ink-secondary">
          AI parsing is on via <strong>{providerLabel()}</strong>.
        </p>
      ) : (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-ink">
          <strong>AI parsing is off</strong> — set <code>GEMINI_API_KEY</code> (or{" "}
          <code>ANTHROPIC_API_KEY</code>) to enable PDF parsing and sync suggestions.
          Uploads and manual entry still work.
        </p>
      )}

      <ResumeUploader />
      <ResumeList resumes={data ?? []} aiAvailable={aiAvailable} />
    </div>
  );
}
