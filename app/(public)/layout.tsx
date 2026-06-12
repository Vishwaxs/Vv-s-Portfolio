import { cookies } from "next/headers";
import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { RoleSwitcher } from "@/components/site/RoleSwitcher";
import { getProfile, getRoles, getSocialLinks } from "@/lib/data";
import { pickRole, ROLE_COOKIE } from "@/lib/role-engine";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, socials, roles, cookieStore] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getRoles(),
    cookies(),
  ]);
  const role = pickRole(roles, cookieStore.get(ROLE_COOKIE)?.value);

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation
        name={profile?.full_name ?? "Portfolio"}
        roleSwitcher={
          <RoleSwitcher
            roles={roles.map((r) => ({ slug: r.slug, name: r.name }))}
            activeSlug={role?.slug ?? ""}
          />
        }
      />
      <main className="flex-1">{children}</main>
      <Footer
        name={profile?.full_name ?? ""}
        email={profile?.email ?? ""}
        socials={socials}
      />
    </div>
  );
}
