import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  BadgeCheck,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Link2,
  ScrollText,
  Settings,
  SlidersHorizontal,
  Type,
  User,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { MobileNav } from "@/components/admin/MobileNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false },
};

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/sections", label: "Sections", icon: Type },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/certifications", label: "Certifications", icon: BadgeCheck },
  { href: "/admin/achievements", label: "Achievements", icon: Award },
  { href: "/admin/social", label: "Social links", icon: Link2 },
  { href: "/admin/roles", label: "Roles", icon: SlidersHorizontal },
  { href: "/admin/resumes", label: "Resumes", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: membership } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-surface-0">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface-1 lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Link href="/" className="mb-6 block px-2 font-semibold text-ink">
            ← Site
          </Link>
          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-secondary hover:bg-surface-2 hover:text-ink"
              >
                <n.icon size={16} /> {n.label}
              </Link>
            ))}
          </nav>
          <SignOutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* mobile nav */}
        <div className="border-b border-line bg-surface-1 p-3 lg:hidden">
          <MobileNav items={nav.map(({ href, label }) => ({ href, label }))} />
        </div>
        <main className="mx-auto max-w-4xl p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
