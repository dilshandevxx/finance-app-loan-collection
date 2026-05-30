"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, CloudSun, Sparkles } from "lucide-react";

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Welcome");
  const [Icon, setIcon] = useState<React.ElementType>(Sun);

  useEffect(() => {
    requestAnimationFrame(() => {
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
    });
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* Dynamic Time-based Icon Indicator with glassmorphism */}
      <div 
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 shrink-0 shadow-lg"
      >
        <Icon className="w-5 h-5 text-fintech-accent relative z-10 animate-pulse" />
      </div>
      
      <div className="flex flex-col justify-center text-left">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40 leading-none mb-1.5">
          {greeting}
        </span>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none flex items-center gap-2">
          {name}
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-fintech-accent animate-bounce inline-block shrink-0" />
        </h1>
      </div>
    </div>
  );
}
