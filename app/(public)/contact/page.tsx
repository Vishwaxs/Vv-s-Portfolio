import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/site/ContactForm";
import { getProfile, getSections, getSocialLinks, section } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about internships, roles, or collaboration.",
};

export default async function ContactPage() {
  const [profile, sections, socials] = await Promise.all([
    getProfile(),
    getSections(),
    getSocialLinks(),
  ]);
  const copy = section(sections, "contact");

  return (
    <Section
      className="pt-20 pb-24"
      title={copy?.title || "Get in touch"}
      subtitle={copy?.subtitle}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Card className="p-8">
          <ContactForm />
        </Card>

        <div className="space-y-4">
          {profile?.email && (
            <Card className="flex items-center gap-3 p-5">
              <Mail size={18} className="shrink-0 text-accent-500" />
              <a href={`mailto:${profile.email}`} className="break-all text-sm text-ink hover:underline">
                {profile.email}
              </a>
            </Card>
          )}
          {profile?.phone && (
            <Card className="flex items-center gap-3 p-5">
              <Phone size={18} className="shrink-0 text-accent-500" />
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="text-sm text-ink hover:underline">
                {profile.phone}
              </a>
            </Card>
          )}
          {profile?.location && (
            <Card className="flex items-center gap-3 p-5">
              <MapPin size={18} className="shrink-0 text-accent-500" />
              <span className="text-sm text-ink">{profile.location}</span>
            </Card>
          )}
          {socials.length > 0 && (
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-ink">Elsewhere</h3>
              <ul className="space-y-2">
                {socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent-600 hover:underline dark:text-accent-300"
                    >
                      {s.label || s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </Section>
  );
}
