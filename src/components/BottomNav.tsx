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
        bg-card/95
        backdrop-blur-2xl
        border-t md:border border-border
        rounded-t-3xl md:rounded-[2rem]
        px-2 pt-3 pb-4 md:px-2 md:py-4
        gap-1 md:gap-2
        shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)]
        w-full md:w-auto
      ">
        {/* Desktop logo */}
        <div className="hidden md:flex items-center justify-center mb-2 w-11 h-11">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary">
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
                flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2
                flex-1 md:flex-none
                p-2 md:px-3 md:py-2.5
                rounded-2xl
                transition-all duration-200
                ${active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-semibold md:hidden">{label}</span>
              <span className="hidden md:block text-xs font-semibold">{label}</span>
            </Link>
          );
        })}

        {/* Center new-loan solid green button (mobile only) */}
        <Link href="/new" className="flex flex-col items-center gap-0.5 group shrink-0 mx-1">
          <div className="p-[2.5px] rounded-full bg-primary shadow-lg shadow-primary/15">
            <div className="bg-card rounded-full p-2.5 flex items-center justify-center">
              <Plus className="w-5 h-5 text-foreground stroke-[2.5]" />
            </div>
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground md:hidden">New</span>
        </Link>

        {NAV.slice(2).map(({ href, Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2
                flex-1 md:flex-none
                p-2 md:px-3 md:py-2.5
                rounded-2xl
                transition-all duration-200
                ${active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-semibold md:hidden">{label}</span>
              <span className="hidden md:block text-xs font-semibold">{label}</span>
            </Link>
          );
        })}

        {/* Desktop theme toggle */}
        <div className="hidden md:flex items-center justify-center mt-2 pt-2 border-t border-border w-full">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
