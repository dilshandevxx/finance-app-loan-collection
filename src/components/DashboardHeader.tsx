"use client";

import { useEffect, useState } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { Customer, Loan, Installment } from "@/data/db";
import { Calendar, Sun, Moon, CloudSun, Plus } from "lucide-react";
import Link from "next/link";
import { GlobalSearchModal } from "./GlobalSearchModal";

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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-4 pt-6 mb-4 md:mb-8">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="flex md:hidden [@media(pointer:fine)]:hidden items-center justify-between w-full bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[1.75rem] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-3">
          {/* Avatar with Online Indicator */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-[1rem] overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
              {agentAvatar ? (
                 <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
              ) : (
                 <span className="text-primary text-lg font-black">{agentName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-background rounded-full shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" />
          </div>
          
          {/* Greeting & Name */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">{greeting}</span>
              <Icon className={`w-3 h-3 ${iconClass.split(' ')[0]}`} />
            </div>
            <span className="text-[17px] font-black text-foreground tracking-tight leading-tight mt-0.5">
              {agentName}
            </span>
          </div>
        </div>

        {/* Quick Actions (Search & Notifications) */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="w-10 h-10 rounded-full bg-secondary hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-white/5 shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <div className="shrink-0 bg-secondary hover:bg-white/10 border border-white/5 p-1 rounded-full shadow-sm transition-colors active:scale-95">
            <NotificationPanel
              customers={customers}
              loans={loans}
              installments={installments}
            />
          </div>
        </div>
      </div>

      {/* Desktop Header (Hidden on Mobile) */}
      <div className="hidden md:flex [@media(pointer:fine)]:flex items-center gap-5 w-full lg:w-auto">
        {/* Engaging Avatar */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 bg-[#0A0514] shadow-2xl flex items-center justify-center">
            {agentAvatar ? (
               <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
            ) : (
               <span className="text-primary text-xl font-bold">{agentName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" title="Online" />
        </div>
        
        {/* Greeting & Date */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
            {greeting} <span className="text-primary">{agentName}</span>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full border shadow-sm ml-1 ${iconClass}`}>
              <Icon className="w-4 h-4" />
            </div>
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-white/50">
            {formattedDate && (
               <span className="text-white/80 font-bold">{formattedDate}</span>
            )}
            {formattedDate && <span className="text-white/20">•</span>}
            <span>Portfolio analytics are ready</span>
          </div>
        </div>
      </div>

      {/* Right: Action Buttons (Desktop Only) */}
      <div className="hidden md:flex [@media(pointer:fine)]:flex items-center gap-4 w-full lg:w-auto mt-2 lg:mt-0">
        
        {/* Global Search Button */}
        <button 
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="flex items-center gap-3 bg-[#0A0514]/50 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white/80 px-4 py-3 rounded-[1rem] text-sm font-medium transition-all shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Search...
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-1 bg-white/10 border border-white/5 px-2 py-0.5 rounded text-[10px] font-bold text-white/70 tracking-widest ml-4">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-[1rem] text-sm font-bold transition-all shadow-xl backdrop-blur-md">
          <Calendar className="w-4 h-4 text-white/70" />
          Refresh
        </button>
        <div className="shrink-0 bg-white/5 border border-white/10 p-1.5 rounded-[1.2rem] shadow-xl backdrop-blur-md">
          <NotificationPanel
            customers={customers}
            loans={loans}
            installments={installments}
          />
        </div>
      </div>
      
      {/* Global Search Modal */}
      <GlobalSearchModal customers={customers} />
    </header>
  );
}
