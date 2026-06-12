import { NextRequest, NextResponse } from "next/server";
import { getRoles } from "@/lib/data";
import { ROLE_COOKIE } from "@/lib/role-engine";

export async function POST(req: NextRequest) {
  let role: string | undefined;
  try {
    role = (await req.json())?.role;
  } catch {
    /* fallthrough to 400 */
  }

  const roles = await getRoles();
  if (!role || !roles.some((r) => r.slug === role)) {
    return NextResponse.json({ error: "unknown_role" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ROLE_COOKIE, role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
  });
  return res;
}
