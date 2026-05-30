"use client";

import { useEffect, useState } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { Customer, Loan, Installment } from "@/data/db";
import { Calendar, Sun, Moon, CloudSun } from "lucide-react";

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
    <header className="flex items-center justify-between pt-2 px-1 mb-2">
      <div className="flex items-center gap-4">
        {/* Profile Avatar / Initial */}
        <div className="relative group cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-300 ring-2 ring-background overflow-hidden">
            {agentAvatar ? (
              <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-primary-foreground drop-shadow-md">
                {agentName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {/* Online Indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[2.5px] border-background rounded-full z-10 flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-80" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className={`flex items-center justify-center p-1 rounded-md border ${iconClass}`}>
              <Icon className="w-3 h-3" />
            </div>
            <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5">
              {greeting}
            </p>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-none flex items-center gap-2.5">
            {agentName.split(" ")[0]}
            <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 tracking-widest uppercase mt-0.5">
              Agent
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Pill (Desktop Only) */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/80 border border-border">
           <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
           <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{formattedDate}</span>
        </div>
        
        <NotificationPanel
          customers={customers}
          loans={loans}
          installments={installments}
        />
      </div>
    </header>
  );
}
