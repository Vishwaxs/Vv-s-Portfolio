import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { aiAvailable } from "@/lib/ai/provider";
import { ParsedResume } from "@/lib/ai/resume-schema";
import { Badge } from "@/components/ui/Badge";
import { ParsedReview } from "@/components/admin/ParsedReview";
import { SuggestionReview } from "@/components/admin/SuggestionReview";

export const metadata = { title: "Resume detail" };

export default async function ResumeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: resume }, { data: suggestions }] = await Promise.all([
    supabase.from("resumes").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("sync_suggestions")
      .select("*")
      .eq("resume_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!resume) notFound();

  let parsed = null;
  if (resume.parsed) {
    const result = ParsedResume.safeParse(resume.parsed);
    parsed = result.success ? result.data : null;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/resumes"
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={14} /> All resumes
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-h2 text-ink">{resume.title}</h1>
          <Badge tone={resume.parse_status === "parsed" ? "success" : "neutral"}>
            {resume.parse_status}
          </Badge>
          {resume.is_active && <Badge tone="success">active</Badge>}
        </div>
        {resume.parse_error && (
          <p className="mt-2 text-sm text-danger">Parse error: {resume.parse_error}</p>
        )}
      </div>

      {parsed ? (
        <ParsedReview resumeId={resume.id} parsed={parsed} />
      ) : (
        <p className="rounded-card border border-line bg-surface-1 p-6 text-sm text-ink-secondary">
          {aiAvailable
            ? "Not parsed yet — use the sparkle button on the resumes list to extract structured data from the PDF."
            : "AI parsing is disabled (no GEMINI_API_KEY or ANTHROPIC_API_KEY). Add content manually through the entity pages on the left."}
        </p>
      )}

      <SuggestionReview
        resumeId={resume.id}
        suggestions={suggestions ?? []}
        aiAvailable={aiAvailable}
        hasParsed={Boolean(parsed)}
      />
    </div>
  );
}
