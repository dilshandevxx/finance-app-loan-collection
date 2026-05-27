"use client";

import { useEffect, useState } from "react";

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <div className="flex flex-col">
      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-white/50 font-bold uppercase tracking-wider mb-0.5 transition-opacity duration-300">
        {greeting}
      </span>
      <span className="text-base sm:text-lg font-extrabold tracking-tight text-black dark:text-white leading-none">
        {name}
      </span>
    </div>
  );
}
