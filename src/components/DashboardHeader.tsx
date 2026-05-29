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
    <header className="flex items-center justify-between mb-6 px-1">
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Hi, {agentName.split(" ")[0]}!
        </h1>
        {formattedDate && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <NotificationPanel
          customers={customers}
          loans={loans}
          installments={installments}
        />
      </div>
    </header>
  );
}
