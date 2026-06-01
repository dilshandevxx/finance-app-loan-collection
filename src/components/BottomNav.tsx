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

export function BottomNav({ hideOnMobile = false }: { hideOnMobile?: boolean } = {}) {
  const pathname = usePathname();

  return (
    <>
      {/* ─────────────────────────────────────────────
          MOBILE: Bottom tab bar
          ───────────────────────────────────────────── */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${hideOnMobile ? 'hidden' : ''}`}>
        <nav className="
          flex items-center
          bg-card/80 dark:bg-card/60 backdrop-blur-3xl
          border-t border-white/10 dark:border-white/5
          rounded-t-3xl
          px-2 pt-3 pb-4
          gap-1
          shadow-[0_-4px_24px_rgba(0,0,0,0.06)]
          dark:shadow-[0_-4px_30px_rgba(0,0,0,0.4)]
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
              <div className="relative w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground mt-1">New</span>
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
        bg-card
        border-r border-border
        py-5 gap-1
      ">
        {/* New Loan Button */}
        <Link href="/new" className="group flex flex-col items-center gap-1 mb-3 w-full px-3 mt-4">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-muted-foreground group-hover:text-foreground group-hover:bg-white/10 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">New</span>
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
                  py-3 rounded-xl transition-all duration-200
                  ${active
                    ? "text-foreground bg-white/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-foreground" />
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
