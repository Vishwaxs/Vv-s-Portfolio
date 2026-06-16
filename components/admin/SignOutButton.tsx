"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/admin/actions";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/admin/login");
        router.refresh();
      }}
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-secondary hover:bg-surface-2 hover:text-danger"
    >
      <LogOut size={16} /> Sign out
    </button>
  );
}
