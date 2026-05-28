"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Plus, Settings, FileText } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function BottomNav() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    
    // Choose active style depending on route to make it look colorful but soft
    let activeClass = "";
    if (isActive) {
      if (path === "/") activeClass = "text-[#0e0e11] dark:text-[#ffffff] bg-[#f0f2f5] dark:bg-mood-gray/80 shadow-sm";
      else if (path === "/customers") activeClass = "text-[#0e0e11] dark:text-[#ffffff] bg-[#f0f2f5] dark:bg-mood-gray/80 shadow-sm";
      else if (path === "/reports") activeClass = "text-[#0e0e11] dark:text-[#ffffff] bg-[#f0f2f5] dark:bg-mood-gray/80 shadow-sm";
      else if (path === "/settings") activeClass = "text-[#0e0e11] dark:text-[#ffffff] bg-[#f0f2f5] dark:bg-mood-gray/80 shadow-sm";
    }

    return `flex flex-col items-center justify-center gap-1 p-2.5 rounded-full transition-all duration-300 flex-1 md:flex-none group relative ${
      isActive 
        ? activeClass
        : "text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white"
    }`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full md:w-auto md:max-w-none md:left-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto z-50 p-2 sm:p-4 md:p-0">
      <div className="bg-white/95 dark:bg-[#121214]/95 backdrop-blur-2xl border border-neutral-100 dark:border-[#1f1f23] rounded-[2rem] px-2 py-2 md:px-3 md:py-8 flex md:flex-col items-center justify-around md:justify-start gap-1 md:gap-4 shadow-xl">
        
        {/* Desktop Brand Logo */}
        <div className="hidden md:flex items-center justify-center mb-4">
          <div className="w-10 h-10 rounded-full bg-mood-blue-light dark:bg-mood-blue/10 border border-mood-blue/20 flex items-center justify-center font-bold text-sm text-neutral-800 dark:text-mood-blue shadow-inner">
            LT
          </div>
        </div>

        <Link href="/" className={getLinkClass("/")}>
          <Home className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="text-[10px] font-semibold block md:hidden">Home</span>
          <span className="hidden md:block absolute left-16 bg-neutral-900 dark:bg-mood-gray px-3 py-1.5 rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800 dark:border-border">Dashboard</span>
        </Link>
        
        <Link href="/customers" className={getLinkClass("/customers")}>
          <Users className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="text-[10px] font-semibold block md:hidden">Clients</span>
          <span className="hidden md:block absolute left-16 bg-neutral-900 dark:bg-mood-gray px-3 py-1.5 rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800 dark:border-border">Customers</span>
        </Link>
        
        {/* Rainbow Center Button */}
        <Link href="/new" className="flex flex-col items-center gap-1 group relative md:my-1">
          <div className="relative p-[3px] rounded-full overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500">
            <div className="bg-white dark:bg-[#121214] p-2.5 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-neutral-800 dark:text-white stroke-[2.5]" />
            </div>
          </div>
          <span className="text-[10px] font-semibold block md:hidden mt-0.5">New</span>
          <span className="hidden md:block absolute left-16 bg-neutral-900 dark:bg-mood-gray px-3 py-1.5 rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800 dark:border-border">New Loan</span>
        </Link>
        
        <Link href="/reports" className={getLinkClass("/reports")}>
          <FileText className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="text-[10px] font-semibold block md:hidden">Reports</span>
          <span className="hidden md:block absolute left-16 bg-neutral-900 dark:bg-mood-gray px-3 py-1.5 rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800 dark:border-border">Reports</span>
        </Link>
        
        <Link href="/settings" className={getLinkClass("/settings")}>
          <Settings className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          <span className="text-[10px] font-semibold block md:hidden">Profile</span>
          <span className="hidden md:block absolute left-16 bg-neutral-900 dark:bg-mood-gray px-3 py-1.5 rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800 dark:border-border">Settings</span>
        </Link>

        {/* Desktop Theme Toggle */}
        <div className="hidden md:flex items-center justify-center mt-4 pt-4 border-t border-neutral-100 dark:border-[#1f1f23]">
          <ThemeToggle />
        </div>
        
      </div>
    </div>
  );
}
