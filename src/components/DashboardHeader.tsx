"use client";

import { useEffect, useState } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { Customer, Loan, Installment } from "@/data/db";
import { Calendar, Sun, Moon, CloudSun, Plus } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  agentName: string;
  agentAvatar?: string;
  customers: Customer[];
  loans: Loan[];
  installments: Installment[];
}

export function DashboardHeader({
  agentName,
  agentAvatar,
  customers,
  loans,
  installments,
}: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("Hello,");
  const [formattedDate, setFormattedDate] = useState("");
  const [Icon, setIcon] = useState<React.ComponentType<{ className?: string }>>(Sun);
  const [iconClass, setIconClass] = useState("");

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      // Determine greeting based on local time
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good morning,");
        setIcon(() => Sun);
        setIconClass("text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/5 dark:border-amber-500/10");
      } else if (hour < 18) {
        setGreeting("Good afternoon,");
        setIcon(() => CloudSun);
        setIconClass("text-primary bg-primary/10 border-primary/20 dark:bg-primary/5 dark:border-primary/10");
      } else {
        setGreeting("Good evening,");
        setIcon(() => Moon);
        setIconClass("text-orange-500 bg-orange-500/10 border-orange-500/20 dark:text-orange-400 dark:bg-orange-500/5 dark:border-orange-500/10");
      }

      // Format date: e.g. "Thu, May 28"
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "short",
        day: "numeric",
      };
      setFormattedDate(new Date().toLocaleDateString("en-US", options));
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.onLine) {
      import("@/lib/idb").then(({ setCacheItem }) => {
        setCacheItem("customers", customers);
        setCacheItem("loans", loans);
        setCacheItem("installments", installments);
      }).catch(err => console.error("Error setting IndexedDB cache in header:", err));
    }
  }, [customers, loans, installments]);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 px-4 mb-4 md:mb-8">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="flex md:hidden items-center justify-between w-full">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shrink-0 bg-primary/20 flex items-center justify-center">
          {agentAvatar ? (
             <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
          ) : (
             <span className="text-primary font-bold">{agentName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-xl font-black text-white tracking-tight">{agentName}</span>
        <div className="shrink-0 flex items-center justify-center">
          <NotificationPanel
            customers={customers}
            loans={loans}
            installments={installments}
          />
        </div>
      </div>

      {/* Desktop Header (Hidden on Mobile) */}
      <div className="hidden md:flex flex-col gap-1 w-full md:w-auto">
        <h1 className="text-2xl md:text-[32px] font-medium tracking-tight text-foreground">
          Welcome back, {agentName}!!
        </h1>
        <p className="text-sm text-muted-foreground">
          Your latest portfolio analytics are ready. Let's check your progress.
        </p>
      </div>

      {/* Right: Action Buttons (Desktop Only) */}
      <div className="hidden md:flex items-center gap-3 w-full md:w-auto">
        <button onClick={() => window.location.reload()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary text-foreground border border-border px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Refresh
        </button>
        <div className="shrink-0">
          <NotificationPanel
            customers={customers}
            loans={loans}
            installments={installments}
          />
        </div>
      </div>
    </header>
  );
}
