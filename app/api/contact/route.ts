import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { contactSchema } from "@/lib/validation/contact";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  // honeypot tripped: pretend success so bots learn nothing
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

  // security-definer RPC enforces the 5/hour/ip rate limit in the database
  const { error } = await createAnonClient().rpc("submit_contact_message", {
    p_name: parsed.data.name,
    p_email: parsed.data.email,
    p_subject: parsed.data.subject ?? "",
    p_message: parsed.data.message,
    p_ip_hash: ipHash,
    p_user_agent: req.headers.get("user-agent") ?? "",
  });

  if (error) {
    const status = error.message.includes("rate_limited") ? 429 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ ok: true });
}
