import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-6">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface-1 p-8 shadow-card">
        <h1 className="mb-6 text-h3 text-ink">Admin sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
