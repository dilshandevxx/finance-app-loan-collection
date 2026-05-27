"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-[#222] flex items-center justify-center text-white hover:bg-[#111] transition-colors shadow-sm"
      title="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-white/70" />
      ) : (
        <Moon className="w-4 h-4 text-white/70" />
      )}
    </button>
  );
}
