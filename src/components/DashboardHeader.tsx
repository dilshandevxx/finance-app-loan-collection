"use client";

import { useEffect, useState } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { Customer, Loan, Installment } from "@/data/db";
import { Calendar, Sun, Moon, CloudSun } from "lucide-react";

interface DashboardHeaderProps {
  agentName: string;
  customers: Customer[];
  loans: Loan[];
  installments: Installment[];
}

export function DashboardHeader({
  agentName,
  customers,
  loans,
  installments,
}: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("Hello,");
  const [formattedDate, setFormattedDate] = useState("");
  const [Icon, setIcon] = useState<React.ComponentType<any>>(Sun);
  const [iconClass, setIconClass] = useState("");

  useEffect(() => {
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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-card/45 border border-border/40 backdrop-blur-md mb-4 shadow-xs">
      <div className="flex items-center gap-3.5">
        {/* Dynamic Glassmorphic Greeting Icon */}
        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${iconClass}`}>
          <Icon className="w-5.5 h-5.5 animate-pulse" />
        </div>

        {/* Text Greeting Block */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
              {greeting}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground leading-tight tracking-tight mt-0.5 flex items-center gap-1.5">
            {agentName}
            <span className="animate-[wave_2.5s_infinite] origin-[70%_70%] inline-block text-xl select-none cursor-default">👋</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold mt-0.5">
            Welcome back! Here's your collection status for today.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-none border-border/30 pt-3 sm:pt-0">
        {formattedDate && (
          <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-secondary/50 border border-border/20 select-none">
            <Calendar className="w-3.5 h-3.5 opacity-80" />
            {formattedDate}
          </span>
        )}
        <div className="flex items-center">
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
