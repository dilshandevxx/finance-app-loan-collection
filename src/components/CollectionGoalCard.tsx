"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowUpRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { config } from "@/lib/config";

interface CollectionGoalCardProps {
  expectedToday: number;
  collectedToday: number;
}

export function CollectionGoalCard({ expectedToday, collectedToday }: CollectionGoalCardProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const totalTargetToday = expectedToday + collectedToday;
  const progressPercent = totalTargetToday > 0 ? Math.round((collectedToday / totalTargetToday) * 100) : 0;

  useEffect(() => {
    // Animate progress ring on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent);
      if (progressPercent >= 100) {
        setShowConfetti(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  // SVG Circle calculation
  const size = 96; // Circle size
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="w-full rounded-[2rem] p-6 sm:p-8 relative overflow-hidden flex flex-col shadow-xl bg-gradient-to-br from-emerald-950 via-[#062419] to-black border border-emerald-900/30 text-white min-h-[220px]">
      
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-emerald-500 blur-[80px] opacity-25 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-teal-500 blur-[80px] opacity-20 pointer-events-none"></div>

      {/* Confetti Celebration Particle Layer */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          {[...Array(20)].map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const size = Math.random() * 8 + 6;
            const colorClass = [
              "bg-yellow-400",
              "bg-emerald-400",
              "bg-teal-400",
              "bg-amber-400",
              "bg-white"
            ][Math.floor(Math.random() * 5)];
            
            return (
              <div
                key={i}
                className={`absolute rounded-full ${colorClass} animate-confetti`}
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDelay: `${delay}s`,
                  top: `-20px`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-12 gap-4 items-center mb-6 relative z-10">
        
        {/* Left Side: Amounts & Labels */}
        <div className="col-span-8 flex flex-col gap-1">
          <h2 className="text-emerald-400/80 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
            {progressPercent >= 100 
              ? (totalTargetToday > 0 ? "🏆 Today's Goal Achieved!" : "📅 No Due Collections Today") 
              : "Remaining Today"}
          </h2>
          
          <div className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm">
            ${(progressPercent >= 100 && totalTargetToday > 0 ? collectedToday : expectedToday).toFixed(2).split('.')[0]}
            <span className="text-emerald-400 text-2xl sm:text-3xl">
              .{(progressPercent >= 100 && totalTargetToday > 0 ? collectedToday : expectedToday).toFixed(2).split('.')[1]}
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-400 font-medium">
            {progressPercent >= 100 && totalTargetToday > 0 ? (
              <span className="text-emerald-400 font-semibold">
                Successfully collected all <span className="text-white font-bold">${collectedToday.toFixed(2)}</span> targets!
              </span>
            ) : (
              <>
                Collected: <span className="text-white font-bold">${collectedToday.toFixed(2)}</span> / ${totalTargetToday.toFixed(2)}
              </>
            )}
          </div>
        </div>

        {/* Right Side: Animated Ring Progress */}
        <div className="col-span-4 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-[96px] h-[96px]">
            {/* Background Circle */}
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                stroke="rgba(16, 185, 129, 0.1)"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              
              {/* Animated Glowing Progress Ring */}
              <circle
                stroke="url(#emeraldGradient)"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              />
              
              {/* Gradients definition */}
              <defs>
                <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {progressPercent >= 100 ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 animate-bounce" />
              ) : (
                <>
                  <span className="text-lg font-black tracking-tight text-white leading-none">
                    {animatedProgress}%
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                    Paid
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center gap-3 relative z-10 mt-auto">
        <Link href="/new" className="flex-1">
          <Button className="w-full bg-white hover:bg-emerald-50 text-emerald-950 rounded-2xl h-12 flex items-center justify-center gap-2 font-bold shadow-lg transition-all active:scale-95 border-none">
            <Plus className="w-5 h-5 shrink-0" /> New Loan
          </Button>
        </Link>
        <Link href="/reports" className="flex-1">
          <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 text-white hover:bg-white/10 flex items-center justify-center gap-2 backdrop-blur-md bg-white/5 transition-all active:scale-95 font-semibold">
            <ArrowUpRight className="w-5 h-5 shrink-0" /> Reports
          </Button>
        </Link>
      </div>

      {/* CSS-only Confetti animation styles */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(220px) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall 2.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
