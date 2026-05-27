"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] flex items-center justify-center text-black dark:text-white shadow-sm">
        <span className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] flex items-center justify-center text-black dark:text-white dark:hover:bg-[#111] transition-colors shadow-sm"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-white/70" />
      ) : (
        <Moon className="w-4 h-4 text-black/70" />
      )}
    </button>
  );
}
