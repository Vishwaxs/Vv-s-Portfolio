import Link from "next/link";
import { Mail, Link as LinkIcon } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/site/BrandIcons";
import type { SocialLink } from "@/lib/data";

const icons: Record<string, React.ComponentType<{ size?: number }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: XIcon,
  x: XIcon,
  email: Mail,
};

export function Footer({
  name,
  email,
  socials,
}: {
  name: string;
  email: string;
  socials: SocialLink[];
}) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="text-sm text-ink-muted">
          © {new Date().getFullYear()} {name}
          {email && (
            <>
              {" · "}
              <a href={`mailto:${email}`} className="hover:text-ink">
                {email}
              </a>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {socials.map((s) => {
            const Icon = icons[s.icon] ?? icons[s.platform] ?? LinkIcon;
            return (
              <Link
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label || s.platform}
                className="rounded-full p-2 text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Icon size={18} />
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
