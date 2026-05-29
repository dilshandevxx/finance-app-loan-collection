"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Plus, Settings, FileText } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/",         Icon: Home,     label: "Home"    },
  { href: "/customers",Icon: Users,    label: "Clients" },
  { href: "/reports",  Icon: FileText, label: "Reports" },
  { href: "/settings", Icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center md:pb-0 md:left-4 md:right-auto md:top-1/2 md:-translate-y-1/2 md:flex-col">
      <nav className="
        flex md:flex-col items-center
        bg-[#2A3D2E] dark:bg-[#141A15]
        backdrop-blur-2xl
        border-t md:border border-[#3A5A40]/60 dark:border-[#8AB89E]/10
        rounded-t-3xl md:rounded-[2rem]
        px-2 pt-3 pb-4 md:px-3 md:py-5
        gap-1 md:gap-2
        shadow-[0_-8px_32px_rgba(58,90,64,0.25)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.5)]
        w-full md:w-auto
      ">
        {/* Desktop logo / brand mark */}
        <div className="hidden md:flex items-center justify-center mb-3 w-full">
          <div className="w-10 h-10 rounded-2xl bg-[#3A5A40] dark:bg-[#8AB89E]/20 border border-[#8AB89E]/30 flex items-center justify-center font-black text-sm text-white dark:text-[#8AB89E] shadow-md">
            LT
          </div>
        </div>

        {NAV.slice(0, 2).map(({ href, Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2
                flex-1 md:flex-none
                p-2 md:px-4 md:py-2.5
                rounded-2xl
                transition-all duration-300
                ${active
                  ? "bg-[#3A5A40] dark:bg-[#8AB89E]/20 text-white dark:text-[#8AB89E] shadow-lg shadow-[#3A5A40]/40 dark:shadow-[#8AB89E]/10"
                  : "text-[#9EB8A3] dark:text-[#7D8F82] hover:text-white dark:hover:text-[#E2E8E4] hover:bg-white/[0.06]"
                }
              `}
            >
              {active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#8AB89E] dark:bg-[#8AB89E] opacity-80 md:hidden" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${active ? "drop-shadow-sm" : ""}`} />
              <span className="text-[10px] font-bold md:hidden">{label}</span>
              <span className="hidden md:block text-xs font-bold">{label}</span>
            </Link>
          );
        })}

        {/* Center new-loan FAB button */}
        <Link href="/new" className="flex flex-col items-center gap-0.5 group shrink-0 mx-1 md:my-1">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#8AB89E]/30 dark:bg-[#8AB89E]/20 blur-md scale-125 group-hover:scale-150 transition-all duration-300" />
            <div className="relative w-12 h-12 rounded-full bg-[#3A5A40] dark:bg-[#8AB89E]/25 border-2 border-[#8AB89E]/50 dark:border-[#8AB89E]/40 flex items-center justify-center shadow-lg shadow-[#3A5A40]/40 group-hover:scale-105 transition-transform duration-200">
              <Plus className="w-5 h-5 text-white dark:text-[#8AB89E] stroke-[2.5]" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#9EB8A3] dark:text-[#7D8F82] md:hidden">New</span>
        </Link>

        {NAV.slice(2).map(({ href, Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2
                flex-1 md:flex-none
                p-2 md:px-4 md:py-2.5
                rounded-2xl
                transition-all duration-300
                ${active
                  ? "bg-[#3A5A40] dark:bg-[#8AB89E]/20 text-white dark:text-[#8AB89E] shadow-lg shadow-[#3A5A40]/40 dark:shadow-[#8AB89E]/10"
                  : "text-[#9EB8A3] dark:text-[#7D8F82] hover:text-white dark:hover:text-[#E2E8E4] hover:bg-white/[0.06]"
                }
              `}
            >
              {active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#8AB89E] dark:bg-[#8AB89E] opacity-80 md:hidden" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${active ? "drop-shadow-sm" : ""}`} />
              <span className="text-[10px] font-bold md:hidden">{label}</span>
              <span className="hidden md:block text-xs font-bold">{label}</span>
            </Link>
          );
        })}

        {/* Desktop theme toggle */}
        <div className="hidden md:flex items-center justify-center mt-3 pt-3 border-t border-[#3A5A40]/40 dark:border-[#8AB89E]/10 w-full">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
