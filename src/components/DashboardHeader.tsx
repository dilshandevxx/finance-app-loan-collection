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
      {/* Left: Avatar & Greeting */}
      <div className="flex items-center gap-4">
        {/* Profile Avatar with subtle glow */}
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all" />
          <div className="relative w-14 h-14 rounded-full border border-white/10 shadow-xl overflow-hidden bg-secondary">
            <img 
              src={agentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agentName)}`} 
              alt={agentName} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Greeting Text */}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            {greeting}
          </span>
          <h1 className="text-[1.75rem] font-black tracking-tight leading-none bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-sm">
            {agentName.split(" ")[0]}
          </h1>
        </div>
      </div>

      {/* Right: Circular Icon Buttons */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationPanel
          customers={customers}
          loans={loans}
          installments={installments}
        />
      </div>
    </header>
  );
}
