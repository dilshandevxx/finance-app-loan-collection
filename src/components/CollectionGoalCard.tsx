"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowUpRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CollectionGoalCardProps {
  expectedToday: number;
  collectedToday: number;
  totalClientsToday?: number;
  collectedClientsToday?: number;
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
    // Animate progress ring on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  // SVG Circle calculation
  const size = 96; // Circle size
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div 
      className="w-full rounded-[2.25rem] p-6 sm:p-8 relative overflow-hidden flex flex-col shadow-2xl border border-white/5 text-white min-h-[220px] transition-all duration-300"
      style={{
        background: 'var(--color-fintech-dark)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Main Split Grid */}
      <div className="grid grid-cols-12 gap-4 items-center mb-6 relative z-10">
        
        {/* Left Side: Amounts & Labels */}
        <div className="col-span-8 flex flex-col gap-2">
          <h2 className="font-extrabold uppercase tracking-widest text-[10px] sm:text-xs text-fintech-accent">
            {progressPercent >= 100 
              ? (totalTargetToday > 0 ? "🏆 Today's Goal Achieved!" : "📅 No Due Collections Today") 
              : "Remaining Today"}
          </h2>
          
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm leading-none flex items-baseline">
            <span>${(progressPercent >= 100 && totalTargetToday > 0 ? collectedToday : expectedToday).toFixed(2).split('.')[0]}</span>
            <span className="text-white/40 text-2xl sm:text-3xl font-black">
              .{(progressPercent >= 100 && totalTargetToday > 0 ? collectedToday : expectedToday).toFixed(2).split('.')[1]}
            </span>
          </div>

          {/* Client Settlement Progress Badge */}
          {totalClientsToday > 0 && (
            <div 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold self-start mt-2 shadow-sm transition-all duration-300 border border-white/5 bg-white/[0.03] text-white/95"
            >
              <CheckCircle className="w-3.5 h-3.5 shrink-0 text-fintech-primary" />
              <span>{collectedClientsToday} of {totalClientsToday} clients settled today</span>
            </div>
          )}

          <div className="mt-1 text-[11px] sm:text-xs text-white/50 font-medium">
            {progressPercent >= 100 && totalTargetToday > 0 ? (
              <span className="text-white/80 font-medium leading-relaxed">
                Outstanding work! 100% of scheduled targets are cleared.
              </span>
            ) : (
              <span className="leading-relaxed">
                Collected: <span className="text-white font-bold">${collectedToday.toFixed(2)}</span> / ${totalTargetToday.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Animated Ring Progress */}
        <div className="col-span-4 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-[96px] h-[96px]">
            {/* Background Circle */}
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                stroke="rgba(255, 255, 255, 0.03)"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              
              {/* Animated Solid Progress Ring */}
              <circle
                stroke="var(--color-fintech-primary)"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {progressPercent >= 100 ? (
                <CheckCircle className="w-7 h-7 text-fintech-emerald animate-pulse" />
              ) : (
                <>
                  <span className="text-lg font-black tracking-tight text-white leading-none">
                    {animatedProgress}%
                  </span>
                  <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">
                    Paid
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center gap-3.5 relative z-10 mt-auto">
        <Link href="/new" className="flex-1">
          <Button 
            className="w-full text-white rounded-2xl h-12 flex items-center justify-center gap-2 font-black transition-all active:scale-95 border-none cursor-pointer"
            style={{
              backgroundColor: 'var(--color-fintech-primary)'
            }}
          >
            <Plus className="w-5 h-5 shrink-0 stroke-[3]" /> New Loan
          </Button>
        </Link>
        <Link href="/reports" className="flex-1">
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-2xl border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2 backdrop-blur-md bg-white/[0.04] transition-all active:scale-95 font-semibold cursor-pointer"
          >
            <ArrowUpRight className="w-5 h-5 shrink-0" /> Reports
          </Button>
        </Link>
      </div>
    </div>
  );
}
