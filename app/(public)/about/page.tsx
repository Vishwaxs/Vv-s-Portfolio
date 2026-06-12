import type { Metadata } from "next";
import { Award, BadgeCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/site/Markdown";
import { Timeline, type TimelineItem } from "@/components/site/Timeline";
import { Reveal } from "@/components/site/Reveal";
import {
  getAchievements,
  getCertifications,
  getEducation,
  getExperience,
  getProfile,
  getSections,
  section,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const [profile, sections, education, experience, certifications, achievements] =
    await Promise.all([
      getProfile(),
      getSections(),
      getEducation(),
      getExperience(),
      getCertifications(),
      getAchievements(),
    ]);

  const about = section(sections, "about");
  const publishedExperience = experience.filter((e) => e.published);
  const publishedCerts = certifications.filter((c) => c.published);
  const publishedAchievements = achievements.filter((a) => a.published);

  return (
    <>
      <Section className="pt-20" title={about?.title || "About me"} subtitle={about?.subtitle}>
        <Reveal>
          <div className="max-w-3xl">
            <Markdown>{profile?.bio_md || about?.body_md || ""}</Markdown>
          </div>
        </Reveal>
      </Section>

      <Section title="Education">
        <Reveal>
          <Timeline
            items={education
              .filter((e) => e.published)
              .map(
                (e): TimelineItem => ({
                  id: e.id,
                  title: e.degree,
                  organization: e.institution,
                  meta: e.grade || undefined,
                  start: e.start_date,
                  end: e.end_date,
                  highlights: e.highlights,
                })
              )}
          />
        </Reveal>
      </Section>

      {publishedExperience.length > 0 && (
        <Section title="Experience">
          <Reveal>
            <Timeline
              items={publishedExperience.map(
                (e): TimelineItem => ({
                  id: e.id,
                  title: e.role,
                  organization: e.organization,
                  meta: e.employment_type || undefined,
                  start: e.start_date,
                  end: e.end_date,
                  body: e.summary_md,
                  highlights: e.highlights,
                })
              )}
            />
          </Reveal>
        </Section>
      )}

      {publishedCerts.length > 0 && (
        <Section title="Certifications">
          <div className="grid gap-4 sm:grid-cols-2">
            {publishedCerts.map((c) => (
              <Card key={c.id} className="flex items-start gap-3 p-5">
                <BadgeCheck className="mt-0.5 shrink-0 text-accent-500" size={20} />
                <div>
                  <div className="font-medium text-ink">
                    {c.name} {c.verified && <Badge tone="success">verified</Badge>}
                  </div>
                  <div className="text-sm text-ink-muted">
                    {c.issuer}
                    {c.issue_date && ` · ${formatDate(c.issue_date)}`}
                  </div>
                  {c.credential_url && (
                    <a
                      href={c.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent-600 hover:underline dark:text-accent-300"
                    >
                      View credential
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {publishedAchievements.length > 0 && (
        <Section title="Achievements" className="pb-24">
          <div className="space-y-4">
            {publishedAchievements.map((a) => (
              <Card key={a.id} className="flex items-start gap-3 p-5">
                <Award className="mt-0.5 shrink-0 text-accent-500" size={20} />
                <div>
                  <div className="font-medium text-ink">{a.title}</div>
                  {a.date && (
                    <div className="text-sm text-ink-muted">{formatDate(a.date)}</div>
                  )}
                  <div className="mt-1 text-sm">
                    <Markdown>{a.description_md}</Markdown>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
