import { Code2, Database, Layers } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/site/Reveal";
import { SpotlightCard } from "@/components/site/SpotlightCard";

const services = [
  {
    icon: Code2,
    title: "Frontend",
    body: "Accessible, responsive UIs with React, Next.js, and Tailwind CSS.",
  },
  {
    icon: Database,
    title: "Backend",
    body: "REST APIs and relational data models with Node, Express, and SQL.",
  },
  {
    icon: Layers,
    title: "Full-stack",
    body: "Shipping features end to end — from schema and API to the screen.",
  },
];

export function Services() {
  return (
    <Section title="What I do" subtitle="Building across the stack while I study.">
      <div className="grid gap-6 sm:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <SpotlightCard
              className="h-full transition-transform hover:-translate-y-1"
              innerClassName="p-6"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-700 transition-colors group-hover/spot:bg-accent-600 group-hover/spot:text-white dark:bg-accent-900 dark:text-accent-200">
                <s.icon size={22} />
              </div>
              <h3 className="text-h3 text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{s.body}</p>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
