"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";

/** Floating theme switch (bottom-left) — just the button, no doodles. */
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      className="theme-float"
    >
      <span className="theme-float-icons" aria-hidden="true">
        <Sun size={17} className="theme-icon-sun" />
        <Moon size={17} className="theme-icon-moon" />
      </span>
    </button>
  );
}
