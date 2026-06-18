import type { Metadata } from "next";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-0 px-6">
      {/* ambient gradient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob absolute -left-20 top-1/4 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: "color-mix(in oklch, var(--color-grad-from) 22%, transparent)" }} />
        <div className="animate-blob animation-delay-2000 absolute -right-16 bottom-1/4 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: "color-mix(in oklch, var(--color-grad-via) 20%, transparent)" }} />
      </div>

      <SpotlightCard className="w-full max-w-sm" innerClassName="p-8">
        <h1 className="text-h3 text-ink">Admin sign in</h1>
        <p className="mb-6 mt-1 text-sm text-ink-muted">
          Sign in to manage your portfolio content.
        </p>
        <LoginForm />
      </SpotlightCard>
    </div>
  );
}
