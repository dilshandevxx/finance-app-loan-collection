"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle, Settings, FileText } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function BottomNav() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex flex-col items-center gap-1 px-1 py-2 sm:p-2 transition-colors flex-1 md:flex-none group relative ${
      isActive 
        ? "text-neon-lime dark:text-neon-lime" 
        : "text-gray-400 hover:text-black dark:text-white/50 dark:hover:text-white"
    }`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full md:w-auto md:max-w-none md:left-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto z-50">
      <div className="bg-white/90 backdrop-blur-xl dark:bg-card/90 border-t md:border border-gray-200 dark:border-border md:rounded-[2.5rem] px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:px-3 md:py-8 flex md:flex-col items-center justify-around shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-2xl">
        
        {/* Desktop Brand Logo */}
        <div className="hidden md:flex items-center justify-center mb-6 text-neon-lime">
          <div className="w-10 h-10 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center font-bold text-base shadow-[0_0_15px_rgba(226,255,59,0.15)]">
            LT
          </div>
        </div>

        <Link href="/" className={getLinkClass("/")}>
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium block md:hidden">Home</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-muted px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-border">Dashboard</span>
        </Link>
        
        <Link href="/customers" className={getLinkClass("/customers")}>
          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium block md:hidden">Clients</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-muted px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-border">Customers</span>
        </Link>
        
        <Link href="/new" className="flex flex-col items-center gap-1 text-black dark:text-white hover:scale-105 transition-transform flex-1 md:flex-none group relative md:my-2">
          <div className="bg-neon-lime text-black p-3 md:p-3 rounded-full shadow-[0_4px_15px_rgba(226,255,59,0.3)] -mt-5 md:mt-0 border-4 border-white dark:border-[#0a0a0a]">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-medium block md:hidden">New</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-muted px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-border">New Loan</span>
        </Link>
        
        <Link href="/reports" className={getLinkClass("/reports")}>
          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium block md:hidden">Reports</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-muted px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-border">Reports</span>
        </Link>
        
        <Link href="/settings" className={getLinkClass("/settings")}>
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium block md:hidden">Settings</span>
          <span className="hidden md:block absolute left-16 bg-gray-900 dark:bg-muted px-3 py-1.5 rounded-lg text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 dark:border-border">Settings</span>
        </Link>

        {/* Desktop Theme Toggle */}
        <div className="hidden md:flex items-center justify-center mt-6 pt-6 border-t border-gray-200 dark:border-border">
          <ThemeToggle />
        </div>
        
      </div>
    </div>
  );
}
