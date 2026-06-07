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
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] flex-col items-start z-50
        bg-card border-r border-border
        py-8 px-5 gap-6
      ">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-2 mb-2 w-full">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <div className="w-4 h-4 bg-primary rounded-[4px] rotate-45" />
          </div>
          <span className="text-[22px] font-black tracking-tight text-foreground">Movea</span>
        </div>

        {/* New Account Button */}
        <Link href="/new" className="group flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-3.5 transition-all duration-300 active:scale-[0.98] shadow-sm">
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-bold">New Account</span>
        </Link>

        {/* Nav Items */}
        <nav className="flex flex-col items-start gap-1 w-full flex-1 mt-4">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">Menu</p>
          {NAV.map(({ href, Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  relative w-full flex items-center gap-4
                  px-4 py-3.5 rounded-[1.25rem] transition-all duration-300
                  ${active
                    ? "text-foreground bg-secondary font-bold shadow-sm"
                    : "text-muted-foreground font-semibold hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-[15px]">{label}</span>
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-6 border-t border-border w-full flex flex-col gap-4">
          <div className="flex items-center justify-between px-4">
            <span className="text-xs font-semibold text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
