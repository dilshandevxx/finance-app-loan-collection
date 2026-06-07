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
    <header className="flex items-center justify-between pt-6 px-4 mb-8">
      {/* Left: Bold Title */}
      <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
        Home
      </h1>

      {/* Right: Circular Icon Buttons */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationPanel
          customers={customers}
          loans={loans}
          installments={installments}
        />

        {/* Plus Button */}
        <Link 
          href="/new" 
          className="relative w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 shadow-lg group cursor-pointer"
        >
          <Plus className="w-6 h-6 text-foreground font-light" strokeWidth={1.5} />
        </Link>
      </div>
    </header>
  );
}
