"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
      
      {/* Main Grid: Info + Ring */}
      <div className="grid grid-cols-12 gap-4 items-center relative z-10">
        
        {/* Left Side: Goal & Amounts */}
        <div className="col-span-8 flex flex-col gap-1.5">
          <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground">
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
          <div className="relative w-24 h-24">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-zinc-200 dark:stroke-border"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-primary transition-all duration-1000 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-foreground leading-none">{animatedProgress}%</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">Paid</span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
