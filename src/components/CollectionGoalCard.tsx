"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    if (overdueAmount > 0) {
      setStatus("overdue");
    } else if (expectedToday === 0 && collectedToday > 0) {
      setStatus("settled");
    } else {
      setStatus("pending");
    }
  }, [expectedToday, collectedToday, overdueAmount]);

  // Design assets based on the status vibe
  const getThemeData = () => {
    switch (status) {
      case "settled":
        return {
          bgColor: "bg-mood-pink-light dark:bg-mood-pink/10 dark:border-mood-pink/20",
          textColor: "text-neutral-900 dark:text-[#ffffff]",
          faceBg: "bg-[#fbb7db]",
          faceBorder: "border-[#fa9dc6]",
          title: "Outstanding Day!",
          desc: "100% of today's collections are completed. Fantastic work!",
          badgeColor: "bg-white/90 text-neutral-800 dark:bg-mood-pink/20 dark:text-mood-pink",
          faceSvg: (
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-neutral-900 stroke-[3] fill-none" strokeLinecap="round">
              {/* Curly Hair loop */}
              <path d="M 50 12 C 45 4, 38 4, 38 12 C 38 20, 52 20, 50 28" />
              {/* Eyes */}
              <circle cx="38" cy="46" r="3" fill="currentColor" className="stroke-none text-neutral-900" />
              <circle cx="62" cy="46" r="3" fill="currentColor" className="stroke-none text-neutral-900" />
              {/* Smiling mouth */}
              <path d="M 33 60 Q 50 78, 67 60" />
              {/* Smile Dimples */}
              <path d="M 31 58 Q 32 60, 34 58" />
              {/* Nose */}
              <path d="M 50 48 L 47 54 L 52 54" />
            </svg>
          )
        };
      case "overdue":
        return {
          bgColor: "bg-mood-blue-light dark:bg-mood-blue/10 dark:border-mood-blue/20",
          textColor: "text-neutral-900 dark:text-[#ffffff]",
          faceBg: "bg-[#a3e0f5]",
          faceBorder: "border-[#80cedd]",
          title: "Focus Required Today",
          desc: `You have $${overdueAmount.toFixed(0)} overdue. Let's connect with these accounts.`,
          badgeColor: "bg-white/90 text-neutral-800 dark:bg-mood-blue/20 dark:text-mood-blue",
          faceSvg: (
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-neutral-900 stroke-[3] fill-none" strokeLinecap="round">
              {/* Hair Part swipe */}
              <path d="M 28 20 C 35 15, 60 12, 72 24" />
              {/* Eyebrows */}
              <path d="M 32 40 L 44 40" />
              <path d="M 56 40 L 68 40" />
              {/* Eyes */}
              <circle cx="38" cy="48" r="2.5" fill="currentColor" className="stroke-none text-neutral-900" />
              <circle cx="62" cy="48" r="2.5" fill="currentColor" className="stroke-none text-neutral-900" />
              {/* Neutral flat mouth */}
              <path d="M 40 64 L 60 64" />
              {/* Nose */}
              <path d="M 49 46 L 47 55 L 51 55" />
            </svg>
          )
        };
      case "pending":
      default:
        return {
          bgColor: "bg-mood-mint-light dark:bg-mood-mint/10 dark:border-mood-mint/20",
          textColor: "text-neutral-900 dark:text-[#ffffff]",
          faceBg: "bg-[#9dedc8]",
          faceBorder: "border-[#7ccca4]",
          title: "Calm & Consistent",
          desc: `${collectedClientsToday} of ${totalClientsToday} collections settled today. Keep going!`,
          badgeColor: "bg-white/90 text-neutral-800 dark:bg-mood-mint/20 dark:text-mood-mint",
          faceSvg: (
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-neutral-900 stroke-[3] fill-none" strokeLinecap="round">
              {/* Gentle hair stroke on top */}
              <path d="M 32 22 Q 50 8, 68 20" />
              {/* Closed Eyes arcs */}
              <path d="M 32 46 Q 38 52, 44 46" />
              <path d="M 56 46 Q 62 52, 68 46" />
              {/* Gentle tiny smile */}
              <path d="M 42 63 Q 50 68, 58 63" />
              {/* Nose */}
              <path d="M 48 43 L 46 54 L 50 54" />
            </svg>
          )
        };
    }
  };

  const theme = getThemeData();

  return (
    <div className={`w-full rounded-[2.5rem] p-6 border transition-all duration-500 flex flex-col gap-6 ${theme.bgColor}`}>
      {/* Large Illustration Box */}
      <div className="w-full bg-white/60 dark:bg-[#121214]/60 backdrop-blur-md rounded-[2rem] p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Face Illustration Container */}
        <div className={`w-28 h-28 rounded-full flex items-center justify-center relative shadow-sm border ${theme.faceBg} ${theme.faceBorder} animate-in zoom-in-50 duration-500`}>
          {theme.faceSvg}
        </div>
        
        {/* Caption */}
        <div className="text-center mt-5 flex flex-col gap-1.5 px-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">Portfolio Status</span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-white leading-tight">
            {theme.title}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[240px] mx-auto">
            {theme.desc}
          </p>
        </div>
      </div>

      {/* Numerical Collection Summary info */}
      <div className="flex justify-between items-center px-2">
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">Outstanding Today</span>
          <div className="text-3xl font-black text-neutral-900 dark:text-white flex items-baseline tracking-tight mt-0.5">
            <span>${expectedToday.toFixed(2).split('.')[0]}</span>
            <span className="text-neutral-400 dark:text-neutral-500 text-lg">.{expectedToday.toFixed(2).split('.')[1]}</span>
          </div>
        </div>

        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">Settled Today</span>
          <div className="text-3xl font-black text-neutral-900 dark:text-white flex items-baseline tracking-tight mt-0.5">
            <span>${collectedToday.toFixed(2).split('.')[0]}</span>
            <span className="text-neutral-400 dark:text-neutral-500 text-lg">.{collectedToday.toFixed(2).split('.')[1]}</span>
          </div>
        </div>
      </div>

      {/* Bottom Button Actions */}
      <div className="flex items-center gap-3 w-full">
        <Link href="/new" className="flex-1">
          <button 
            className="w-full text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:opacity-90 rounded-2xl h-12 flex items-center justify-center gap-2 font-bold transition-all active:scale-98 cursor-pointer text-sm shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> New Loan
          </button>
        </Link>
        <Link href="/reports" className="flex-1">
          <button 
            className="w-full h-12 rounded-2xl border border-neutral-200 dark:border-[#2b2b31] bg-white/40 dark:bg-[#1f1f23]/40 text-neutral-800 dark:text-white hover:bg-white/60 dark:hover:bg-[#1f1f23]/60 transition-all active:scale-98 font-bold flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <ArrowUpRight className="w-4 h-4" /> Reports
          </button>
        </Link>
      </div>
    </div>
  );
}
