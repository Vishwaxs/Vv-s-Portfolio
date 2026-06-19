"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/site/BrandIcons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Mode = "magic" | "password";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const signInPassword = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  const signInGoogle = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });
    // on success the browser is redirected to Google; only errors return here
    if (error) {
      setError(
        "Google sign-in isn't enabled yet — turn on the Google provider in Supabase."
      );
    }
  };

  const sendMagicLink = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        shouldCreateUser: true,
      },
    });
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "password") await signInPassword();
      else await sendMagicLink();
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-200">
          <Mail size={22} />
        </div>
        <p className="text-sm text-ink">
          Check <span className="font-medium">{email}</span> for a sign-in link.
          It expires shortly — open it on this device.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setError(null);
          }}
          className="mt-4 text-sm text-accent-600 hover:underline dark:text-accent-300"
        >
          Use a different method
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Google OAuth */}
      <button
        type="button"
        onClick={() => {
          setError(null);
          void signInGoogle();
        }}
        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-line bg-surface-0 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
      >
        <GoogleIcon size={18} /> Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="space-y-4">
      {/* method toggle */}
      <div className="flex rounded-full border border-line bg-surface-1 p-0.5 text-sm">
        {(["magic", "password"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={
              "flex-1 rounded-full px-3 py-1.5 transition-colors " +
              (mode === m
                ? "bg-accent-600 font-medium text-white"
                : "text-ink-secondary hover:text-ink")
            }
          >
            {m === "magic" ? "Email link" : "Password"}
          </button>
        ))}
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="username"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {mode === "password" && (
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={busy} className="w-full">
        {mode === "magic" ? <Mail size={16} /> : <LogIn size={16} />}
        {busy
          ? "Working…"
          : mode === "magic"
            ? "Email me a sign-in link"
            : "Sign in"}
      </Button>

      <p className="text-center text-xs text-ink-muted">
        {mode === "magic"
          ? "Passwordless — we email you a one-time link. No password to remember."
          : "Use the password you set in Supabase."}
      </p>
      </form>
    </div>
  );
}
