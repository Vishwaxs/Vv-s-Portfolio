"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import { aiAvailable } from "@/lib/ai/provider";
import { ParsedResume, type ParsedResumeType } from "@/lib/ai/resume-schema";
import {
  SUGGESTION_TABLES,
  normalizeDate,
  sanitizeSuggestion,
  toSlug,
} from "@/lib/sync/sanitize";
import type { Json, Tables } from "@/lib/database.types";
import type { ActionResult } from "@/app/admin/actions";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) throw new Error("Not an admin");
  return { supabase, user };
}

export async function uploadResume(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const file = formData.get("file");
    const title = String(formData.get("title") ?? "").trim();
    if (!(file instanceof File)) return { ok: false, error: "No file" };
    if (!title) return { ok: false, error: "Title is required" };
    if (file.type !== "application/pdf")
      return { ok: false, error: "Only PDF files are accepted" };
    if (file.size > MAX_PDF_BYTES)
      return { ok: false, error: "PDF must be under 10 MB" };

    const { data: resume, error: insertError } = await supabase
      .from("resumes")
      .insert({ title, parse_status: aiAvailable ? "pending" : "manual" })
      .select("*")
      .single();
    if (insertError) return { ok: false, error: insertError.message };

    const path = `${resume.id}/v1.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, file, { contentType: "application/pdf" });
    if (uploadError) {
      await supabase.from("resumes").delete().eq("id", resume.id);
      return { ok: false, error: uploadError.message };
    }

    await supabase.from("resumes").update({ storage_path: path }).eq("id", resume.id);
    await writeAudit({
      action: "create",
      entityType: "resumes",
      entityId: resume.id,
      after: { title, storage_path: path },
    });
    return { ok: true, id: resume.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function cloneResume(id: string, title: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data: source } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();
    if (!source) return { ok: false, error: "Resume not found" };

    const { data: clone, error } = await supabase
      .from("resumes")
      .insert({
        title: title || `${source.title} (copy)`,
        role_id: source.role_id,
        parent_id: source.id,
        version: source.version + 1,
        parsed: source.parsed,
        parse_status: source.parse_status === "parsed" ? "parsed" : "manual",
        notes: source.notes,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    // copy the PDF so the clone is self-contained
    if (source.storage_path) {
      const newPath = `${clone.id}/v${source.version + 1}.pdf`;
      const { error: copyError } = await supabase.storage
        .from("resumes")
        .copy(source.storage_path, newPath);
      if (!copyError) {
        await supabase.from("resumes").update({ storage_path: newPath }).eq("id", clone.id);
      }
    }

    await writeAudit({
      action: "create",
      entityType: "resumes",
      entityId: clone.id,
      after: { cloned_from: id },
    });
    return { ok: true, id: clone.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Clone failed" };
  }
}

export async function activateResume(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    // clear current active, then set; the partial unique index enforces one
    await supabase.from("resumes").update({ is_active: false }).eq("is_active", true);
    const { error } = await supabase.from("resumes").update({ is_active: true }).eq("id", id);
    if (error) return { ok: false, error: error.message };

    const { data: profile } = await supabase.from("profile").select("id").limit(1).maybeSingle();
    if (profile) {
      await supabase.from("profile").update({ resume_active_id: id }).eq("id", profile.id);
    }

    await writeAudit({ action: "activate", entityType: "resumes", entityId: id });
    revalidateTag("profile");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Activation failed" };
  }
}

export async function deleteResume(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data: resume } = await supabase.from("resumes").select("*").eq("id", id).single();
    if (resume?.storage_path) {
      await supabase.storage.from("resumes").remove([resume.storage_path]);
    }
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      action: "delete",
      entityType: "resumes",
      entityId: id,
      before: { title: resume?.title } as Json,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" };
  }
}

export async function parseResume(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!aiAvailable)
      return { ok: false, error: "ANTHROPIC_API_KEY is not configured — use manual entry" };

    const { data: resume } = await supabase.from("resumes").select("*").eq("id", id).single();
    if (!resume?.storage_path) return { ok: false, error: "Resume has no PDF" };

    await supabase.from("resumes").update({ parse_status: "parsing" }).eq("id", id);

    const { data: blob, error: dlError } = await supabase.storage
      .from("resumes")
      .download(resume.storage_path);
    if (dlError || !blob) {
      await supabase
        .from("resumes")
        .update({ parse_status: "failed", parse_error: "Could not download PDF" })
        .eq("id", id);
      return { ok: false, error: "Could not download PDF" };
    }

    const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

    try {
      const { parseResumePdf } = await import("@/lib/ai/parse-resume");
      const parsed = await parseResumePdf(base64);
      await supabase
        .from("resumes")
        .update({ parsed: parsed as Json, parse_status: "parsed", parse_error: null })
        .eq("id", id);
      await writeAudit({ action: "update", entityType: "resumes", entityId: id, after: { parse_status: "parsed" } });
      return { ok: true };
    } catch (aiError) {
      const message = aiError instanceof Error ? aiError.message : "Parse failed";
      await supabase
        .from("resumes")
        .update({ parse_status: "failed", parse_error: message })
        .eq("id", id);
      return { ok: false, error: message };
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Parse failed" };
  }
}

/** Import selected entries from a parsed resume into the portfolio tables.
 *  Skills dedupe by name; everything else inserts as unpublished drafts. */
export async function importParsed(
  resumeId: string,
  selection: {
    skills?: number[];
    projects?: number[];
    experience?: number[];
    education?: number[];
    certifications?: number[];
    achievements?: number[];
  }
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { data: resume } = await supabase
      .from("resumes")
      .select("parsed")
      .eq("id", resumeId)
      .single();
    if (!resume?.parsed) return { ok: false, error: "Nothing parsed yet" };

    const parsed = ParsedResume.parse(resume.parsed);
    let imported = 0;

    if (selection.skills?.length) {
      const { data: existing } = await supabase.from("skills").select("name");
      const have = new Set((existing ?? []).map((s) => s.name.toLowerCase()));
      for (const i of selection.skills) {
        const s = parsed.skills[i];
        if (!s || have.has(s.name.toLowerCase())) continue;
        await supabase.from("skills").insert({ name: s.name, level: s.level ?? 3, published: false });
        imported++;
      }
      revalidateTag("skills");
    }

    for (const i of selection.projects ?? []) {
      const p = parsed.projects[i];
      if (!p) continue;
      await supabase.from("projects").insert({
        slug: `${toSlug(p.title)}-${Date.now().toString(36)}`,
        title: p.title,
        summary: p.summary,
        description_md: p.highlights.map((h) => `- ${h}`).join("\n"),
        tech_stack: p.tech,
        repo_url: p.url,
        published: false,
      });
      imported++;
    }
    if (selection.projects?.length) revalidateTag("projects");

    for (const i of selection.experience ?? []) {
      const e = parsed.experience[i];
      if (!e) continue;
      await supabase.from("experience").insert({
        role: e.role,
        organization: e.organization,
        start_date: normalizeDate(e.startDate) ?? "2000-01-01",
        end_date: normalizeDate(e.endDate),
        highlights: e.highlights,
        published: false,
      });
      imported++;
    }
    if (selection.experience?.length) revalidateTag("experience");

    for (const i of selection.education ?? []) {
      const e = parsed.education[i];
      if (!e) continue;
      await supabase.from("education").insert({
        institution: e.institution,
        degree: e.degree,
        field: e.field ?? "",
        start_date: normalizeDate(e.startDate) ?? "2000-01-01",
        end_date: normalizeDate(e.endDate),
        grade: e.grade ?? "",
        published: false,
      });
      imported++;
    }
    if (selection.education?.length) revalidateTag("education");

    for (const i of selection.certifications ?? []) {
      const c = parsed.certifications[i];
      if (!c) continue;
      await supabase.from("certifications").insert({
        name: c.name,
        issuer: c.issuer ?? "",
        issue_date: normalizeDate(c.date),
        published: false,
      });
      imported++;
    }
    if (selection.certifications?.length) revalidateTag("certifications");

    for (const i of selection.achievements ?? []) {
      const a = parsed.achievements[i];
      if (!a) continue;
      await supabase.from("achievements").insert({
        title: a.title,
        description_md: a.description ?? "",
        date: normalizeDate(a.date),
        published: false,
      });
      imported++;
    }
    if (selection.achievements?.length) revalidateTag("achievements");

    await writeAudit({
      action: "create",
      entityType: "resume_import",
      entityId: resumeId,
      after: { imported },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Import failed" };
  }
}

export async function generateSuggestions(resumeId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!aiAvailable)
      return { ok: false, error: "ANTHROPIC_API_KEY is not configured" };

    const { data: resume } = await supabase
      .from("resumes")
      .select("parsed")
      .eq("id", resumeId)
      .single();
    if (!resume?.parsed) return { ok: false, error: "Parse the resume first" };

    const [profile, skills, projects, experience, education, certifications, achievements] =
      await Promise.all([
        supabase.from("profile").select("id, full_name, headline, tagline, location, email").limit(1).maybeSingle(),
        supabase.from("skills").select("id, name, level"),
        supabase.from("projects").select("id, slug, title, summary, tech_stack, status"),
        supabase.from("experience").select("id, role, organization, start_date, end_date, highlights"),
        supabase.from("education").select("id, institution, degree, start_date, end_date, grade"),
        supabase.from("certifications").select("id, name, issuer, issue_date"),
        supabase.from("achievements").select("id, title, date"),
      ]);

    const { suggestSync } = await import("@/lib/ai/suggest-sync");
    const result = await suggestSync(
      {
        profile: profile.data,
        skills: skills.data ?? [],
        projects: projects.data ?? [],
        experience: experience.data ?? [],
        education: education.data ?? [],
        certifications: certifications.data ?? [],
        achievements: achievements.data ?? [],
      },
      ParsedResume.parse(resume.parsed)
    );

    // replace previous pending suggestions for this resume
    await supabase
      .from("sync_suggestions")
      .delete()
      .eq("resume_id", resumeId)
      .eq("status", "pending");

    if (result.suggestions.length > 0) {
      const { error } = await supabase.from("sync_suggestions").insert(
        result.suggestions.map((s) => ({
          resume_id: resumeId,
          entity_type: s.entity_type,
          entity_id: s.entity_id,
          action: s.action,
          suggested_value: s.suggested_value as Json,
          rationale: s.rationale,
          confidence: s.confidence,
        }))
      );
      if (error) return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Suggestion failed" };
  }
}

export async function resolveSuggestion(
  id: string,
  decision: "approved" | "rejected",
  overrides?: Record<string, Json>
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireAdmin();
    const { data: suggestion } = await supabase
      .from("sync_suggestions")
      .select("*")
      .eq("id", id)
      .single();
    if (!suggestion) return { ok: false, error: "Suggestion not found" };
    if (suggestion.status !== "pending")
      return { ok: false, error: "Already resolved" };

    if (decision === "approved") {
      const table = SUGGESTION_TABLES[suggestion.entity_type];
      if (!table) return { ok: false, error: "Unknown entity type" };
      const rawValue = suggestion.suggested_value;
      if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
        return { ok: false, error: "Suggestion has no usable fields" };
      }
      // admin-supplied overrides (e.g. repo/live URL, publish now) win over the AI
      const merged = { ...(rawValue as Record<string, Json>), ...(overrides ?? {}) };
      const value = sanitizeSuggestion(
        table,
        suggestion.action as "create" | "update" | "delete",
        merged
      );

      if (table === "profile") {
        // singleton — always edit the one profile row regardless of entity_id
        let targetId = suggestion.entity_id;
        if (!targetId) {
          const { data: prof } = await supabase.from("profile").select("id").limit(1).maybeSingle();
          targetId = prof?.id ?? null;
        }
        if (!targetId) return { ok: false, error: "No profile row to update" };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from("profile").update(value as any).eq("id", targetId);
        if (error) return { ok: false, error: error.message };
      } else if (suggestion.action === "create") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from(table).insert(value as any);
        if (error) return { ok: false, error: error.message };
      } else if (suggestion.action === "update" && suggestion.entity_id) {
        const { error } = await supabase
          .from(table)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update(value as any)
          .eq("id", suggestion.entity_id);
        if (error) return { ok: false, error: error.message };
      } else if (suggestion.action === "delete" && suggestion.entity_id) {
        const { error } = await supabase.from(table).delete().eq("id", suggestion.entity_id);
        if (error) return { ok: false, error: error.message };
      } else {
        return { ok: false, error: "Suggestion is missing a target row" };
      }

      await writeAudit({
        action: "approve",
        entityType: `suggestion:${suggestion.entity_type}`,
        entityId: suggestion.entity_id,
        before: suggestion.current_value,
        after: suggestion.suggested_value,
      });
      // bust everything content-related; approvals are rare
      ["profile", "skills", "projects", "experience", "education", "certifications", "achievements"].forEach(revalidateTag);
    } else {
      await writeAudit({
        action: "reject",
        entityType: `suggestion:${suggestion.entity_type}`,
        entityId: suggestion.entity_id,
      });
    }

    await supabase
      .from("sync_suggestions")
      .update({ status: decision, resolved_at: new Date().toISOString(), resolved_by: user.id })
      .eq("id", id);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Resolve failed" };
  }
}

export type ResumeRow = Tables<"resumes">;
export type ParsedShape = ParsedResumeType;
