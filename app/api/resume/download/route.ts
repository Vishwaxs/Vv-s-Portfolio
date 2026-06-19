import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";

/** Public "Download resume": redirects to a short-lived signed URL for the
 *  currently active resume in the private bucket. */
export async function GET() {
  const service = createServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Resume download is not configured yet." },
      { status: 503 }
    );
  }

  const { data: active } = await service
    .from("resumes")
    .select("storage_path, title")
    .eq("is_active", true)
    .maybeSingle();

  if (!active?.storage_path) {
    return NextResponse.json({ error: "No active resume." }, { status: 404 });
  }

  const { data: signed, error } = await service.storage
    .from("resumes")
    .createSignedUrl(active.storage_path, 60 * 5, {
      download: `${active.title.replace(/[^\w.-]+/g, "_")}.pdf`,
    });

  if (error || !signed) {
    return NextResponse.json({ error: "Could not sign URL." }, { status: 500 });
  }
  return NextResponse.redirect(signed.signedUrl, 307);
}
