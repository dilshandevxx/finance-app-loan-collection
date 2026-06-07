"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, TrendingUp, Zap, Trophy } from "lucide-react";
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
  const isGoalAchieved = progressPercent >= 100 && totalTargetToday > 0;
  const hasNoCollections = totalTargetToday === 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  // SVG Circle
  const size = 100;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  // Dynamic theme
  const ringColor = isGoalAchieved
    ? "stroke-emerald-400"
    : progressPercent > 60
    ? "stroke-primary"
    : progressPercent > 30
    ? "stroke-amber-400"
    : "stroke-rose-400";

  const gradientFrom = isGoalAchieved
    ? "from-emerald-950/60"
    : "from-card";

  return (
    <div className={`w-full rounded-[2rem] bg-gradient-to-br ${gradientFrom} to-card border border-white/5 dark:border-white/10 p-6 flex flex-col gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden`}>
      
      {/* Subtle glow blob */}
      {isGoalAchieved && (
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Top Label */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          {isGoalAchieved ? (
            <Trophy className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingUp className="w-4 h-4 text-primary" />
          )}
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
            {isGoalAchieved ? "Goal Achieved 🎉" : hasNoCollections ? "No Collections Due" : "Today's Progress"}
          </span>
        </div>
        {!hasNoCollections && (
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
            isGoalAchieved 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-primary/10 text-primary"
          }`}>
            {animatedProgress}% done
          </span>
        )}
      </div>

      {/* Main Grid: Amount + Ring */}
      <div className="grid grid-cols-12 gap-4 items-center relative z-10">
        
        {/* Left: Amounts */}
        <div className="col-span-7 flex flex-col gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
              {isGoalAchieved ? "Total Collected" : "Remaining"}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-foreground flex items-baseline tracking-tight">
              <span className="text-base font-bold mr-1 text-muted-foreground">Rs.</span>
              <span>{formatLKRShort(isGoalAchieved && totalTargetToday > 0 ? collectedToday : expectedToday)}</span>
              <span className="text-muted-foreground text-lg">.{formatLKRDecimal(isGoalAchieved && totalTargetToday > 0 ? collectedToday : expectedToday)}</span>
            </div>
          </div>

          {/* Progress mini bar */}
          {!hasNoCollections && (
            <div className="flex flex-col gap-1.5">
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    isGoalAchieved ? "bg-emerald-400" : progressPercent > 60 ? "bg-primary" : progressPercent > 30 ? "bg-amber-400" : "bg-rose-400"
                  }`}
                  style={{ width: `${animatedProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">{formatLKR(collectedToday)}</span> collected of <span className="font-semibold">{formatLKR(totalTargetToday)}</span>
              </p>
            </div>
          )}

          {/* Clients badge */}
          {totalClientsToday > 0 && (
            <div className={`inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md border ${
              isGoalAchieved 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-secondary/80 border-white/10 text-foreground"
            }`}>
              <CheckCircle2 className={`w-3 h-3 ${isGoalAchieved ? "text-emerald-400" : "text-primary"}`} />
              <span>{collectedClientsToday} / {totalClientsToday} clients settled</span>
            </div>
          )}
        </div>

        {/* Right: Ring */}
        <div className="col-span-5 flex justify-end items-center">
          <div className="relative w-[100px] h-[100px]">
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
                className={`${ringColor} transition-all duration-1000 ease-out`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              {isGoalAchieved ? (
                <>
                  <span className="text-2xl">🏆</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Done!</span>
                </>
              ) : (
                <>
                  <span className="text-xl font-black text-foreground leading-none">{animatedProgress}%</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Paid</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Banner */}
      {isGoalAchieved && (
        <div className="relative z-10 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-[12px] font-semibold text-emerald-400">
            Amazing! You&apos;ve hit your daily collection target. Keep it up!
          </p>
        </div>
      )}
    </div>
  );
}
