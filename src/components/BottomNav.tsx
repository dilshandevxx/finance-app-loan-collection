"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Plus, Settings, FileText } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/",          Icon: Home,     label: "Home"     },
  { href: "/customers", Icon: Users,    label: "Clients"  },
  { href: "/reports",   Icon: FileText, label: "Reports"  },
  { href: "/settings",  Icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ─────────────────────────────────────────────
          MOBILE: Bottom tab bar
          ───────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <nav className="
          flex items-center
          bg-card/92 backdrop-blur-2xl
          border-t border-border/60
          rounded-t-3xl
          px-2 pt-3 pb-4
          gap-1
          shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
          dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]
        ">
          {NAV.slice(0, 2).map(({ href, Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`
                relative flex flex-col items-center justify-center gap-0.5
                flex-1 p-2 rounded-2xl transition-all duration-200
                ${active ? "text-primary" : "text-muted-foreground"}
              `}>
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">{label}</span>
              </Link>
            );
          })}

          {/* Center FAB */}
          <Link href="/new" className="flex flex-col items-center gap-0.5 group shrink-0 mx-1">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-125 group-hover:scale-150 transition-all duration-300" />
              <div className="relative w-12 h-12 rounded-full bg-primary border-2 border-primary-foreground/20 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-200">
                <Plus className="w-5 h-5 text-primary-foreground stroke-[2.5]" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">New</span>
          </Link>

          {NAV.slice(2).map(({ href, Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`
                relative flex flex-col items-center justify-center gap-0.5
                flex-1 p-2 rounded-2xl transition-all duration-200
                ${active ? "text-primary" : "text-muted-foreground"}
              `}>
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ─────────────────────────────────────────────
          DESKTOP: Fixed full-height left sidebar
          ───────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 flex-col items-center z-50
        bg-card/80 dark:bg-card/70 backdrop-blur-xl
        border-r border-border/50
        py-5 gap-1
      ">
        {/* Brand logo */}
        <div className="mb-4 flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-black text-sm text-primary-foreground shadow-md shadow-primary/30">
            LT
          </div>
        </div>

        {/* New Loan Button */}
        <Link href="/new" className="group flex flex-col items-center gap-1 mb-3 w-full px-3">
          <div className="w-full py-2.5 rounded-2xl bg-primary hover:bg-primary/90 active:scale-95
            flex flex-col items-center justify-center gap-0.5
            shadow-lg shadow-primary/20 transition-all duration-200
          ">
            <Plus className="w-4.5 h-4.5 text-primary-foreground stroke-[2.5]" />
            <span className="text-[9px] font-black text-primary-foreground uppercase tracking-wider">New</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-8 h-px bg-border/60 mb-2" />

        {/* Nav Items */}
        <nav className="flex flex-col items-center gap-1 w-full px-2 flex-1">
          {NAV.map(({ href, Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  relative w-full flex flex-col items-center justify-center gap-1
                  py-3 rounded-2xl transition-all duration-200
                  ${active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }
                `}
              >
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-primary-foreground/50" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wide leading-none">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Theme Toggle */}
        <div className="mt-auto pt-3 border-t border-border/40 w-full flex justify-center pb-1">
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
