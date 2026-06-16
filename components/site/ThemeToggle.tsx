"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/site/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="rounded-full p-2 text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
