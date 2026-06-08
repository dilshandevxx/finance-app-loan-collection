"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, Users, Clock, CheckCircle2 } from "lucide-react";

interface CollectionGoalCardProps {
  expectedToday: number;
  collectedToday: number;
  totalClientsToday?: number;
  collectedClientsToday?: number;
  activeLoans?: number;
  overdueAmount?: number;
}

function fmt(amount: number) {
  return Math.floor(amount).toLocaleString("en-LK");
}
function dec(amount: number) {
  return (amount % 1).toFixed(2).substring(2);
}

export function CollectionGoalCard({
  expectedToday,
  collectedToday,
  totalClientsToday = 0,
  collectedClientsToday = 0,
  activeLoans = 0,
  overdueAmount = 0,
}: CollectionGoalCardProps) {
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const totalTarget = expectedToday + collectedToday;
  const progressPercent = totalTarget > 0 ? Math.min(Math.round((collectedToday / totalTarget) * 100), 100) : 0;
  const isGoalMet = progressPercent >= 100 && totalTarget > 0;
  const pendingClients = totalClientsToday - collectedClientsToday;

  // Trend: how much collected vs expected
  const changeAmount = collectedToday;
  const changePct = totalTarget > 0 ? ((collectedToday / totalTarget) * 100).toFixed(1) : "0.0";
  const isPositive = collectedToday > 0;

  useEffect(() => {
    setMounted(true);
    // Animate the displayed amount from 0 to collectedToday
    let start: number;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setAnimatedAmount(collectedToday * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [collectedToday]);

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── HERO CARD ─────────────────────────────────── */}
      <div className="relative w-full rounded-[2rem] p-6 flex flex-col gap-2 shadow-sm overflow-hidden bg-gradient-to-br from-[#34d399] to-[#10b981] border-0">
        
        {/* Glow orb */}
        <div className="absolute -bottom-16 -right-12 w-56 h-56 rounded-full opacity-20 blur-3xl bg-white" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-2">

          {/* Label row */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/90">
              Today&apos;s Collection
            </p>
            {isGoalMet && (
              <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 text-white border border-white/20 px-2.5 py-1 rounded-full">
                ✅ Goal Met
              </span>
            )}
          </div>

          {/* Big amount */}
          <div className="flex items-start mt-1">
            <span className="text-xl sm:text-2xl font-black text-white mt-2 mr-1">Rs.</span>
            <div className="flex items-baseline gap-0.5 flex-wrap overflow-hidden">
              <span className="text-4xl sm:text-5xl xl:text-[3.2rem] font-black text-white leading-none tracking-tight truncate max-w-full">
                {fmt(mounted ? animatedAmount : 0)}
              </span>
              <span className="text-lg sm:text-2xl font-black text-white/80 self-end mb-1">
                .{dec(mounted ? animatedAmount : 0)}
              </span>
            </div>
          </div>

          {/* Trend sub-line */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
              isPositive ? "bg-white/20 text-white border border-white/20" : "bg-white/10 text-white/80"
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>Rs. {fmt(changeAmount)} ({changePct}%)</span>
            </div>
            <span className="text-white/80 text-[10px] font-semibold">of Rs. {fmt(totalTarget)} target</span>
          </div>

        </div>
      </div>

      {/* ── MINI STAT CARDS ──────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 md:gap-4">

        {/* Clients Paid */}
        <div className="group relative flex flex-col justify-between w-full min-h-[130px] p-4 rounded-[1.5rem] bg-[#0A0514] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#34d399]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max px-3 py-2 bg-[#0A0514] backdrop-blur-md border border-white/10 rounded-xl shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50 text-[11px] font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
            Rs. {fmt(collectedToday)} collected so far
          </div>

          <div className="relative flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#34d399]/20 flex items-center justify-center text-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 leading-tight">Clients<br/>Paid</span>
          </div>
          <div className="relative flex flex-col mt-auto">
            <span className="text-2xl font-black text-white tracking-tighter leading-none">{collectedClientsToday}</span>
          </div>
        </div>

        {/* Pending */}
        <div className="group relative flex flex-col justify-between w-full min-h-[130px] p-4 rounded-[1.5rem] bg-[#0A0514] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max px-3 py-2 bg-[#0A0514] backdrop-blur-md border border-white/10 rounded-xl shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50 text-[11px] font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
            Rs. {fmt(Math.max(0, expectedToday - collectedToday))} pending
          </div>

          <div className="relative flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 leading-tight">Pending<br/>Dues</span>
          </div>
          <div className="relative flex flex-col mt-auto">
            <span className="text-2xl font-black text-white tracking-tighter leading-none">{pendingClients}</span>
          </div>
        </div>

        {/* Active Loans */}
        <div className="group relative flex flex-col justify-between w-full min-h-[130px] p-4 rounded-[1.5rem] bg-[#0A0514] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute -top-12 right-0 md:left-1/2 md:-translate-x-1/2 w-max px-3 py-2 bg-[#0A0514] backdrop-blur-md border border-white/10 rounded-xl shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50 text-[11px] font-bold text-white flex items-center gap-3">
             <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" /> {Math.max(0, activeLoans - 4)} Good</div>
             <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> 4 Overdue</div>
          </div>

          <div className="relative flex flex-col gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 leading-tight">Active<br/>Loans</span>
          </div>
          <div className="relative flex flex-col mt-auto">
            <span className="text-2xl font-black text-white tracking-tighter leading-none">{activeLoans}</span>
          </div>
        </div>

      </div>

      {/* ── PROGRESS BAR ─────────────────────────────── */}
      {totalTarget > 0 && (
        <div className="flex flex-col gap-2 px-1">
          <div className="w-full h-1.5 rounded-full bg-border/40 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: isGoalMet
                  ? "#10b981"
                  : progressPercent > 65
                  ? "var(--primary)"
                  : progressPercent > 35
                  ? "#f59e0b"
                  : "#f43f5e",
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
            <span>{progressPercent}% collected</span>
            <span>{100 - progressPercent}% remaining</span>
          </div>
        </div>
      )}

    </div>
  );
}
