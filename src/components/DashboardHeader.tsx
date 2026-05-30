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
    <header className="flex items-center justify-between mb-5 pt-2 px-1">
      <div className="flex items-center gap-3.5">
        {/* Profile Avatar / Initial */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700/50 shadow-lg">
            <span className="text-lg font-black text-white">
              {agentName.charAt(0).toUpperCase()}
            </span>
          </div>
          {/* Online Indicator */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
        </div>

        <div className="flex flex-col">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
            Welcome back
          </p>
          <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
            {agentName.split(" ")[0]}
          </h1>
        </div>
      </div>

      <div className="flex items-center">
        <NotificationPanel
          customers={customers}
          loans={loans}
          installments={installments}
        />
      </div>
    </header>
  );
}
