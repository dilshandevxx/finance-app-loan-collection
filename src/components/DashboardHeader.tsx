"use client";

import { useEffect, useState } from "react";
import { NotificationPanel } from "./NotificationPanel";
import { Customer, Loan, Installment } from "@/data/db";
import { Calendar } from "lucide-react";

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

  useEffect(() => {
    // Determine greeting based on local time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning,");
    } else if (hour < 18) {
      setGreeting("Good afternoon,");
    } else {
      setGreeting("Good evening,");
    }

    // Format date: e.g. "Thu, May 28"
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    setFormattedDate(new Date().toLocaleDateString("en-US", options));
  }, []);

  return (
    <header className="flex items-center justify-between py-3 px-1 rounded-2xl bg-white/[0.01] border border-white/[0.02] backdrop-blur-xs mb-1">
      <div className="flex items-center gap-3">
        {/* Profile Avatar with glowing gradient ring */}
        <div className="relative group shrink-0">
          <div className="absolute -inset-[2px] bg-gradient-to-tr from-[#7c6dbf] via-[#e8849a] to-[#6ab4e8] rounded-full blur-[4px] opacity-70 group-hover:opacity-100 group-hover:blur-[6px] transition-all duration-300" />
          <div className="relative w-12 h-12 rounded-full bg-[#1e1a36] border-2 border-[#13102a] overflow-hidden select-none active:scale-95 transition-transform duration-200">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agentName)}`}
              alt="Agent Profile"
              className="w-full h-full object-cover animate-in fade-in duration-500"
              draggable={false}
            />
          </div>
        </div>

        {/* Text Greeting Block */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#9e99c8] uppercase tracking-wider leading-none mb-1">
            {greeting}
          </span>
          <h1 className="text-2xl font-black text-white leading-none flex items-center gap-1.5 tracking-tight">
            <span className="bg-gradient-to-r from-white via-white/95 to-[#c0bbf0] bg-clip-text text-transparent">
              {agentName}
            </span>
            <span className="animate-[wave_2.5s_infinite] origin-[70%_70%] inline-block text-xl select-none cursor-default">👋</span>
          </h1>

          {/* Dynamic Date & Status capsule */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#9dedc8]/10 text-[#9dedc8] border border-[#9dedc8]/20 select-none">
              <span className="w-1 h-1 rounded-full bg-[#9dedc8] animate-pulse" />
              Active
            </span>
            {formattedDate && (
              <span className="text-[10px] text-[#9e99c8] font-bold flex items-center gap-1 select-none">
                <span className="text-[#9e99c8]/40">•</span>
                <Calendar className="w-2.5 h-2.5 opacity-60" />
                {formattedDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notification Bell on the Right */}
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
