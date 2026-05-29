"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatLKR, formatLKRShort, formatLKRDecimal } from "@/lib/format";

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
    <div className="w-full rounded-[2rem] bg-card border border-white/5 dark:border-white/10 p-6 flex flex-col gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden">
      
      {/* Background glow accent */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-primary/20 to-vibe-violet/20 rounded-full blur-[50px] pointer-events-none" />

      {/* Main Grid: Info + Ring */}
      <div className="grid grid-cols-12 gap-4 items-center relative z-10">
        
        {/* Left Side: Goal & Amounts */}
        <div className="col-span-8 flex flex-col gap-1.5">
          <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-primary to-vibe-violet">
            {progressPercent >= 100 
              ? (totalTargetToday > 0 ? "Goal Achieved" : "No Collections Due") 
              : "Remaining Today"}
          </h2>
          
          <div className="text-3xl sm:text-4xl font-black text-foreground flex items-baseline tracking-tight mt-1">
            <span className="text-xl font-bold mr-1 text-muted-foreground">Rs.</span>
            <span>{formatLKRShort(progressPercent >= 100 && totalTargetToday > 0 ? collectedToday : expectedToday)}</span>
            <span className="text-muted-foreground text-xl">.{formatLKRDecimal(progressPercent >= 100 && totalTargetToday > 0 ? collectedToday : expectedToday)}</span>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Collected <span className="font-bold text-foreground">{formatLKR(collectedToday)}</span> / {formatLKR(totalTargetToday)}
          </p>

          {/* Settlement Badge */}
          {totalClientsToday > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-secondary/80 border border-white/10 text-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-full w-fit shadow-sm backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span>{collectedClientsToday} / {totalClientsToday} clients settled</span>
            </div>
          )}
        </div>

        {/* Right Side: Animated Ring */}
        <div className="col-span-4 flex justify-end items-center relative">
          <div className="relative w-24 h-24 drop-shadow-[0_0_18px_rgba(244,63,94,0.4)]">
            <svg width={size} height={size} className="transform -rotate-90">
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>
              <circle
                className="text-secondary/50 dark:text-secondary"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              <circle
                className="transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="url(#ringGradient)"
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
          <button className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer">
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
