import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { getProfile, getSocialLinks } from "@/lib/data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, socials] = await Promise.all([
    getProfile(),
    getSocialLinks(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation name={profile?.full_name ?? "Portfolio"} />
      <main className="flex-1">{children}</main>
      <Footer
        name={profile?.full_name ?? ""}
        email={profile?.email ?? ""}
        socials={socials}
      />
    </div>
  );
}
