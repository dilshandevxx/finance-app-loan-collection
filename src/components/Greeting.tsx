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
    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-1.5 mb-1 opacity-0 animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-forwards">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 dark:text-blue-400" />
        <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-white/60 tracking-wide">
          {greeting},
        </span>
      </div>
      <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 leading-none opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100 fill-mode-forwards flex items-center gap-2">
        {name} 
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 dark:text-yellow-400 animate-pulse inline-block" />
      </div>
    </div>
  );
}
