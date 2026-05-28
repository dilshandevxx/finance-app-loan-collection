"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowUpRight } from "lucide-react";
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
  collectedClientsToday = 0,
  activeLoans = 0,
  overdueAmount = 0
}: CollectionGoalCardProps) {
  const [status, setStatus] = useState<"settled" | "pending" | "overdue">("pending");

  useEffect(() => {
    if (overdueAmount > 0) setStatus("overdue");
    else if (expectedToday === 0 && collectedToday > 0) setStatus("settled");
    else setStatus("pending");
  }, [expectedToday, collectedToday, overdueAmount]);

  /* ── Theme per status ─────────────────────────────────── */
  const themes = {
    settled: {
      wrap: "bg-[#fce9f0] dark:bg-[#3a1a2a]",
      circleBg: "bg-[#fbb7db]",
      title: "Outstanding Day!",
      desc: "100% of today's collections are completed.",
      face: (
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#13102a] dark:stroke-[#f0eeff] stroke-[3]" strokeLinecap="round">
          {/* Curly hair */}
          <path d="M 50 12 C 45 4, 38 4, 38 12 C 38 20, 52 20, 50 28" />
          {/* Eyes */}
          <circle cx="38" cy="46" r="3" fill="#13102a" className="stroke-none dark:fill-[#f0eeff]" />
          <circle cx="62" cy="46" r="3" fill="#13102a" className="stroke-none dark:fill-[#f0eeff]" />
          {/* Big smile */}
          <path d="M 33 60 Q 50 80, 67 60" />
          {/* Nose */}
          <path d="M 50 48 L 47 54 L 52 54" />
        </svg>
      ),
    },
    overdue: {
      wrap: "bg-[#e3f4fd] dark:bg-[#0e2236]",
      circleBg: "bg-[#a3e0f5]",
      title: "Focus Required",
      desc: `$${overdueAmount.toFixed(0)} overdue — time to connect.`,
      face: (
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#13102a] dark:stroke-[#f0eeff] stroke-[3]" strokeLinecap="round">
          {/* Hair */}
          <path d="M 28 20 C 35 15, 60 12, 72 24" />
          {/* Furrowed brows */}
          <path d="M 32 38 L 44 41" />
          <path d="M 56 41 L 68 38" />
          {/* Eyes */}
          <circle cx="38" cy="49" r="2.5" fill="#13102a" className="stroke-none dark:fill-[#f0eeff]" />
          <circle cx="62" cy="49" r="2.5" fill="#13102a" className="stroke-none dark:fill-[#f0eeff]" />
          {/* Flat mouth */}
          <path d="M 40 65 L 60 65" />
          {/* Nose */}
          <path d="M 49 47 L 47 55 L 51 55" />
        </svg>
      ),
    },
    pending: {
      wrap: "bg-[#e6f9f0] dark:bg-[#0e2a1e]",
      circleBg: "bg-[#9dedc8]",
      title: "Calm & Consistent",
      desc: `${collectedClientsToday} of ${totalClientsToday} clients settled today.`,
      face: (
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#13102a] dark:stroke-[#f0eeff] stroke-[3]" strokeLinecap="round">
          {/* Hair */}
          <path d="M 32 22 Q 50 8, 68 20" />
          {/* Closed eyes arcs */}
          <path d="M 32 46 Q 38 52, 44 46" />
          <path d="M 56 46 Q 62 52, 68 46" />
          {/* Gentle smile */}
          <path d="M 42 63 Q 50 68, 58 63" />
          {/* Nose */}
          <path d="M 48 43 L 46 54 L 50 54" />
        </svg>
      ),
    },
  };

  const t = themes[status];

  return (
    <div className={`w-full rounded-3xl p-5 flex flex-col gap-5 transition-all duration-500 border border-transparent ${t.wrap}`}>

      {/* Illustration panel */}
      <div className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-md ${t.circleBg}`}>
          {t.face}
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Portfolio Status</p>
          <h2 className="text-lg font-bold text-foreground leading-snug">{t.title}</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto leading-relaxed">{t.desc}</p>
        </div>
      </div>

      {/* Numbers row */}
      <div className="flex justify-between px-1">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Outstanding</p>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="text-2xl font-black text-foreground">${expectedToday.toFixed(2).split('.')[0]}</span>
            <span className="text-base text-muted-foreground">.{expectedToday.toFixed(2).split('.')[1]}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Settled</p>
          <div className="flex items-baseline gap-0.5 mt-0.5 justify-end">
            <span className="text-2xl font-black text-foreground">${collectedToday.toFixed(2).split('.')[0]}</span>
            <span className="text-base text-muted-foreground">.{collectedToday.toFixed(2).split('.')[1]}</span>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <Link href="/new" className="flex-1">
          <button className="w-full h-11 rounded-2xl bg-[#7c6dbf] hover:bg-[#6a5caa] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#7c6dbf]/30 cursor-pointer">
            <Plus className="w-4 h-4 stroke-[2.5]" /> New Loan
          </button>
        </Link>
        <Link href="/reports" className="flex-1">
          <button className="w-full h-11 rounded-2xl border border-border bg-card hover:bg-secondary text-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer">
            <ArrowUpRight className="w-4 h-4" /> Reports
          </button>
        </Link>
      </div>
    </div>
  );
}
