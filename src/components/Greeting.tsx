"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, CloudSun, Sparkles } from "lucide-react";

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Welcome");
  const [Icon, setIcon] = useState<React.ElementType>(Sun);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
      setIcon(() => Sun);
    } else if (hour < 18) {
      setGreeting("Good afternoon");
      setIcon(() => CloudSun);
    } else {
      setGreeting("Good evening");
      setIcon(() => Moon);
    }
  }, []);

  return (
    <div className="flex items-center gap-3.5">
      {/* Dynamic Time-based Icon Indicator with animated background pulse */}
      <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-orange-500/10 dark:bg-neon-lime/10 border border-orange-500/20 dark:border-neon-lime/20 shrink-0">
        <div className="absolute inset-0 rounded-2xl bg-orange-500/5 dark:bg-neon-lime/5 animate-ping opacity-40 duration-1000" />
        <Icon className="w-5 h-5 text-orange-500 dark:text-neon-lime relative z-10" />
      </div>
      
      <div className="flex flex-col justify-center">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-450 dark:text-white/40 leading-none mb-1">
          {greeting}
        </span>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black dark:text-white leading-none flex items-center gap-1.5">
          {name}
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 dark:text-yellow-400 animate-pulse inline-block shrink-0" />
        </h1>
      </div>
    </div>
  );
}
