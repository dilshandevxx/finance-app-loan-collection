import React from "react";
import { Flame, Trophy, TrendingUp, Target } from "lucide-react";
import { formatLKR } from "@/lib/format";

interface DailyMotivationCardProps {
  collectedToday: number;
  expectedToday: number;
}

export function DailyMotivationCard({ collectedToday, expectedToday }: DailyMotivationCardProps) {
  const totalTarget = collectedToday + expectedToday;
  const progressPercentage = totalTarget > 0 ? Math.round((collectedToday / totalTarget) * 100) : 0;
  
  // Determine message and icon based on progress
  let Message = () => <span className="text-foreground">Let&apos;s get started on today&apos;s collections!</span>;
  let Icon = Target;
  let iconColor = "text-blue-500";
  let bgColor = "bg-blue-500/10";
  let borderColor = "border-blue-500/20";
  
  if (progressPercentage === 100 && totalTarget > 0) {
    Message = () => <span className="text-emerald-500 font-bold">Incredible! You hit 100% of today&apos;s goal! 🏆</span>;
    Icon = Trophy;
    iconColor = "text-emerald-500";
    bgColor = "bg-emerald-500/10";
    borderColor = "border-emerald-500/30";
  } else if (progressPercentage >= 75) {
    Message = () => <span className="text-amber-500 font-bold">Almost there! Finish strong! 🔥</span>;
    Icon = Flame;
    iconColor = "text-amber-500";
    bgColor = "bg-amber-500/10";
    borderColor = "border-amber-500/30";
  } else if (progressPercentage >= 30) {
    Message = () => <span className="text-primary font-bold">Great progress! Keep the momentum going! 📈</span>;
    Icon = TrendingUp;
    iconColor = "text-primary";
    bgColor = "bg-primary/10";
    borderColor = "border-primary/30";
  }

  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] p-5 border ${borderColor} ${bgColor} transition-all`}>
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 opacity-10">
        <Icon className="w-32 h-32" />
      </div>
      
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-background shadow-sm ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">
            Daily Motivation
          </h3>
          <p className="text-[15px] leading-tight">
            <Message />
          </p>
          
          {/* Mini progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-background/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  progressPercentage === 100 ? 'bg-emerald-500' : 
                  progressPercentage >= 75 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className={`text-[10px] font-black ${iconColor}`}>
              {progressPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
