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
      <div className="relative w-full rounded-[2rem] overflow-hidden" style={{ minHeight: 180 }}>

        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: isGoalMet
              ? "linear-gradient(135deg, #059669 0%, #10b981 40%, #34d399 100%)"
              : "linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #8b5cf6 70%, #a78bfa 100%)",
          }}
        />

        {/* Noise texture overlay for premium feel */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
        />

        {/* Glow orb */}
        <div className="absolute -bottom-16 -right-12 w-56 h-56 rounded-full opacity-20 blur-3xl"
          style={{ background: isGoalMet ? "#34d399" : "#c4b5fd" }}
        />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-2xl"
          style={{ background: "white" }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col gap-2">

          {/* Label row */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/70">
              Today&apos;s Collection
            </p>
            {isGoalMet && (
              <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 text-white px-2.5 py-1 rounded-full">
                ✅ Goal Met
              </span>
            )}
          </div>

          {/* Big amount */}
          <div className="flex items-start mt-1">
            <span className="text-2xl font-black text-white/80 mt-2 mr-1">Rs.</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[3.2rem] font-black text-white leading-none tracking-tight">
                {fmt(mounted ? animatedAmount : 0)}
              </span>
              <span className="text-2xl font-black text-white/60 self-end mb-1">
                .{dec(mounted ? animatedAmount : 0)}
              </span>
            </div>
          </div>

          {/* Trend sub-line */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
              isPositive ? "bg-white/20 text-white" : "bg-black/20 text-white/60"
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>Rs. {fmt(changeAmount)} ({changePct}%)</span>
            </div>
            <span className="text-white/50 text-[10px] font-semibold">of Rs. {fmt(totalTarget)} target</span>
          </div>

        </div>
      </div>

      {/* ── MINI STAT CARDS ──────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">

        {/* Clients Paid */}
        <div className="flex flex-col gap-1.5 p-4 rounded-[1.5rem] bg-card border border-white/5 shadow-md shadow-black/10">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Paid</span>
          </div>
          <span className="text-2xl font-black text-foreground leading-none">{collectedClientsToday}</span>
          <span className="text-[9px] text-muted-foreground font-medium">clients</span>
        </div>

        {/* Pending */}
        <div className="flex flex-col gap-1.5 p-4 rounded-[1.5rem] bg-card border border-white/5 shadow-md shadow-black/10">
          <div className="flex items-center justify-between">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-400">Due</span>
          </div>
          <span className="text-2xl font-black text-foreground leading-none">{pendingClients}</span>
          <span className="text-[9px] text-muted-foreground font-medium">pending</span>
        </div>

        {/* Active Loans */}
        <div className="flex flex-col gap-1.5 p-4 rounded-[1.5rem] bg-card border border-white/5 shadow-md shadow-black/10">
          <div className="flex items-center justify-between">
            <Users className="w-4 h-4 text-violet-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-violet-400">Active</span>
          </div>
          <span className="text-2xl font-black text-foreground leading-none">{activeLoans}</span>
          <span className="text-[9px] text-muted-foreground font-medium">loans</span>
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
                  ? "#34d399"
                  : progressPercent > 65
                  ? "#8b5cf6"
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
