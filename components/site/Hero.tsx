"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/site/BrandIcons";
import { publicAssetUrl } from "@/lib/utils";
import type { SocialLink } from "@/lib/data";

const brandIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: XIcon,
  x: XIcon,
};

export function Hero({
  name,
  headline,
  tagline,
  badge,
  signals,
  avatarPath,
  socials,
}: {
  name: string;
  headline: string;
  tagline: string;
  badge: string;
  signals: string[];
  avatarPath: string | null;
  socials: SocialLink[];
}) {
  const reduced = useReducedMotion();
  const photo = publicAssetUrl(avatarPath) ?? "/imgs/359.JPG";
  const sectionRef = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--hx", `${e.clientX - r.left}px`);
    el.style.setProperty("--hy", `${e.clientY - r.top}px`);
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.12, delayChildren: 0.05 } },
  };
  const item = reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

  return (
    <section ref={sectionRef} onMouseMove={onMove} className="relative overflow-hidden">
      {/* animated background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob absolute -left-16 top-10 h-72 w-72 rounded-full bg-accent-300/30 blur-3xl dark:bg-accent-700/20" />
        <div className="animate-blob animation-delay-2000 absolute right-0 top-0 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: "color-mix(in oklch, var(--color-grad-via) 22%, transparent)" }} />
        <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: "color-mix(in oklch, var(--color-grad-to) 20%, transparent)" }} />
      </div>
      {/* cursor-following spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(500px circle at var(--hx, 70%) var(--hy, 20%), color-mix(in oklch, var(--color-accent-500) 14%, transparent), transparent 70%)",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto grid max-w-5xl items-center gap-10 px-6 pb-12 pt-20 md:grid-cols-[1.3fr_1fr] md:pt-28"
      >
        <div>
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-1/80 px-4 py-1.5 text-sm text-ink-secondary backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            {badge}
          </motion.span>

          <motion.h1 variants={item} className="mt-5 text-display">
            <span className="text-ink">Hi, I&apos;m </span>
            <span className="text-gradient">{name}</span>
          </motion.h1>

          {headline && (
            <motion.p variants={item} className="mt-3 text-h3 text-ink-secondary">
              {headline}
            </motion.p>
          )}

          <motion.p variants={item} className="mt-4 max-w-xl text-lg leading-relaxed text-ink-secondary">
            {tagline}
          </motion.p>

          {signals.length > 0 && (
            <motion.ul variants={item} className="mt-6 flex flex-wrap gap-2">
              {signals.map((s) => (
                <li
                  key={s}
                  className="glass rounded-full px-3 py-1 text-sm font-medium text-ink"
                >
                  {s}
                </li>
              ))}
            </motion.ul>
          )}

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-600 to-grad-via px-6 py-3 font-medium text-white shadow-card transition-transform hover:-translate-y-0.5"
              style={{ backgroundImage: "linear-gradient(to right, var(--color-accent-600), var(--color-grad-via))" }}
            >
              View projects <ArrowRight size={17} />
            </Link>
            <Link
              href="/api/resume/download"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface-1 px-6 py-3 font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <Download size={17} /> Download resume
            </Link>

            {socials.length > 0 && (
              <div className="ml-1 flex items-center gap-1">
                {socials.map((s) => {
                  const Icon = brandIcons[s.icon] ?? brandIcons[s.platform];
                  if (!Icon) return null;
                  return (
                    <Link
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label || s.platform}
                      className="rounded-full border border-line bg-surface-1 p-2.5 text-ink-secondary transition-colors hover:text-ink"
                    >
                      <Icon size={18} />
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* avatar with rotating gradient ring */}
        <motion.div variants={item} className="mx-auto md:ml-auto">
          <div className="relative h-64 w-64 sm:h-80 sm:w-80">
            <div
              className="animate-spin-slow absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, var(--color-grad-from), var(--color-grad-via), var(--color-grad-to), var(--color-grad-from))",
              }}
            />
            <div className="absolute inset-[6px] rounded-full bg-surface-0" />
            <div className="absolute inset-[12px] overflow-hidden rounded-full">
              <Image
                src={photo}
                alt={name}
                fill
                sizes="320px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
