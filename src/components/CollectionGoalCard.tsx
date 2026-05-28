"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface CollectionGoalCardProps {
  expectedToday: number;
  collectedToday: number;
  totalClientsToday?: number;
  collectedClientsToday?: number;
  activeLoans?: number;
  overdueAmount?: number;
}

export function CollectionGoalCard({ 
  expectedToday, 
  collectedToday,
  totalClientsToday = 0,
  collectedClientsToday = 0
}: CollectionGoalCardProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const totalTargetToday = expectedToday + collectedToday;
  const progressPercent = totalTargetToday > 0 ? Math.round((collectedToday / totalTargetToday) * 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  // SVG Circle calculation
  const size = 96;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="w-full rounded-[2rem] bg-card border border-border p-6 flex flex-col gap-6 shadow-sm relative overflow-hidden">
      
      {/* Background glow accent */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7c6dbf]/10 rounded-full blur-[40px] pointer-events-none" />

      {/* Main Grid: Info + Ring */}
      <div className="grid grid-cols-12 gap-4 items-center relative z-10">
        
        {/* Left Side: Goal & Amounts */}
        <div className="col-span-8 flex flex-col gap-1.5">
          <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#7c6dbf]">
            {progressPercent >= 100 
              ? (totalTargetToday > 0 ? "Goal Achieved" : "No Collections Due") 
              : "Remaining Today"}
          </h2>
          
          <div className="text-3xl sm:text-4xl font-black text-foreground flex items-baseline tracking-tight mt-1">
            <span>${(progressPercent >= 100 && totalTargetToday > 0 ? collectedToday : expectedToday).toFixed(2).split('.')[0]}</span>
            <span className="text-muted-foreground text-xl">.{(progressPercent >= 100 && totalTargetToday > 0 ? collectedToday : expectedToday).toFixed(2).split('.')[1]}</span>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Collected <span className="font-bold text-foreground">${collectedToday.toFixed(2)}</span> / ${totalTargetToday.toFixed(2)}
          </p>

          {/* Settlement Badge */}
          {totalClientsToday > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-secondary border border-border text-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-full w-fit shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7c6dbf]" />
              <span>{collectedClientsToday} / {totalClientsToday} clients settled</span>
            </div>
          )}
        </div>

        {/* Right Side: Animated Ring */}
        <div className="col-span-4 flex justify-end items-center relative">
          <div className="relative w-24 h-24">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                className="text-secondary"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              <circle
                className="text-[#7c6dbf] transition-all duration-1000 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-foreground leading-none">{animatedProgress}%</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">Paid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Buttons */}
      <div className="flex gap-3 relative z-10 pt-2 border-t border-border">
        <Link href="/new" className="flex-1">
          <button className="w-full h-11 rounded-2xl bg-[#7c6dbf] hover:bg-[#6a5caa] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#7c6dbf]/30 cursor-pointer">
            <Plus className="w-4 h-4 stroke-[2.5]" /> New Loan
          </button>
        </Link>
        <Link href="/reports" className="flex-1">
          <button className="w-full h-11 rounded-2xl border border-border bg-secondary hover:bg-border/50 text-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer">
            <ArrowUpRight className="w-4 h-4" /> Reports
          </button>
        </Link>
      </div>
    </div>
  );
}
