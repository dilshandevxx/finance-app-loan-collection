"use client";

import Link from "next/link";
import { CollectionGoalCard } from "@/components/CollectionGoalCard";
import { BarChart3, Radio, Users, FileText } from "lucide-react";
import { Customer, Loan, Installment } from "@/data/db";

interface DesktopHomeGridProps {
  customers: Customer[];
  loans: Loan[];
  installments: Installment[];
  expectedToday: number;
  collectedToday: number;
  totalClientsToday: number;
  collectedClientsToday: number;
  activeLoans: number;
  overdueAmount: number;
}

const NAV_CARDS = [
  {
    title: "Portfolio Analytics",
    description: "Detailed performance, ROI, and village breakdown",
    href: "/analytics",
    icon: <BarChart3 className="w-8 h-8 text-emerald-400" />,
    gradient: "from-emerald-500/20 to-transparent",
    glow: "bg-emerald-500/20"
  },
  {
    title: "Live Action Feed",
    description: "Real-time updates on payments and pending actions",
    href: "/feed",
    icon: <Radio className="w-8 h-8 text-primary" />,
    gradient: "from-primary/20 to-transparent",
    glow: "bg-primary/20"
  },
  {
    title: "Client Directory",
    description: "Manage customers, loans, and applications",
    href: "/customers",
    icon: <Users className="w-8 h-8 text-orange-400" />,
    gradient: "from-orange-500/20 to-transparent",
    glow: "bg-orange-500/20"
  },
  {
    title: "Reports Center",
    description: "Export collection sheets and financial reports",
    href: "/reports",
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    gradient: "from-blue-500/20 to-transparent",
    glow: "bg-blue-500/20"
  }
];

export function DesktopHomeGrid({
  expectedToday,
  collectedToday,
  totalClientsToday,
  collectedClientsToday,
  activeLoans,
  overdueAmount,
}: DesktopHomeGridProps) {
  return (
    <div className="hidden md:flex flex-col xl:grid xl:grid-cols-12 gap-6 xl:gap-8 w-full mt-4">
      
      {/* ── Top Level Hero Card (Left Column on Desktop) ── */}
      <div className="w-full xl:col-span-5 2xl:col-span-4 flex flex-col justify-start">
        <CollectionGoalCard
          expectedToday={expectedToday}
          collectedToday={collectedToday}
          totalClientsToday={totalClientsToday}
          collectedClientsToday={collectedClientsToday}
          activeLoans={activeLoans}
          overdueAmount={overdueAmount}
        />
      </div>

      {/* ── Navigation Grid (Right Column on Desktop) ──── */}
      <div className="xl:col-span-7 2xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-6 items-start h-fit">
        {NAV_CARDS.map((card, idx) => (
          <Link href={card.href} key={idx} className="group block relative w-full h-full min-h-[160px]">
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.glow} rounded-full blur-[60px] pointer-events-none mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative h-full rounded-[2rem] bg-[#0A0514]/80 backdrop-blur-md border border-white/5 p-6 shadow-xl overflow-hidden hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-4">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                {card.icon}
              </div>
              
              <div className="relative z-10 flex flex-col gap-1.5">
                <h3 className="text-xl font-black text-white tracking-tight">{card.title}</h3>
                <p className="text-sm font-medium text-white/50 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
