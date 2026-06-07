"use client";

import { useState } from "react";
import { ChevronDown, BarChart2, Users, AlertTriangle, Calendar, MapPin } from "lucide-react";
import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { DueTomorrowCard } from "@/components/DueTomorrowCard";
import { TopOverdueCard } from "@/components/TopOverdueCard";
import { VillageCollectionBars } from "@/components/VillageCollectionBars";
import { Installment, Loan, Customer } from "@/data/db";
import { formatLKR } from "@/lib/format";

type Props = {
  loans: Loan[];
  installments: Installment[];
  customers: Customer[];
  activeLoans: number;
  overdueAmount: number;
};

type SectionKey = "portfolio" | "chart" | "tomorrow" | "overdue" | "villages";

function ExpandableCard({
  id,
  icon,
  title,
  subtitle,
  badge,
  badgeColor,
  isOpen,
  onToggle,
  children,
  accentColor = "primary",
}: {
  id: SectionKey;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <div
      className={`w-full rounded-[1.75rem] border overflow-hidden transition-all duration-300 ${
        isOpen
          ? "border-white/10 shadow-xl shadow-black/10"
          : "border-white/5 shadow-md shadow-black/5"
      } bg-card`}
    >
      {/* Header — always visible, clickable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left active:scale-[0.99] transition-transform"
      >
        {/* Icon bubble */}
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-${accentColor}/10`}>
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{subtitle}</p>
          <p className="text-[15px] font-black text-foreground leading-tight mt-0.5 truncate">{title}</p>
        </div>

        {/* Badge */}
        {badge && (
          <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${badgeColor || "bg-primary/10 text-primary"}`}>
            {badge}
          </span>
        )}

        {/* Chevron */}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-primary/10 rotate-180" : "bg-secondary/80"}`}>
          <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-5 pt-1 border-t border-border/40">
          {children}
        </div>
      </div>
    </div>
  );
}

export function MobileDashboardSections({ loans, installments, customers, activeLoans, overdueAmount }: Props) {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const toggle = (key: SectionKey) => {
    setOpenSection(prev => (prev === key ? null : key));
  };

  const overdueCount = installments.filter(
    i => i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))
  ).length;

  const tomorrowCount = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return installments.filter(
      i => i.status === "PENDING" && new Date(i.dueDate).toDateString() === tomorrow.toDateString()
    ).length;
  })();

  const villageCount = new Set(customers.map(c => c.state).filter(Boolean)).size;

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px bg-border flex-1" />
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">Analytics & Insights</span>
        <div className="h-px bg-border flex-1" />
      </div>

      {/* 1. Portfolio */}
      <ExpandableCard
        id="portfolio"
        icon={<Users className="w-5 h-5 text-primary" />}
        title="Portfolio Overview"
        subtitle="Loans & Capital"
        badge={`${activeLoans} active`}
        badgeColor="bg-primary/10 text-primary"
        isOpen={openSection === "portfolio"}
        onToggle={() => toggle("portfolio")}
        accentColor="primary"
      >
        <div className="mt-3">
          <PortfolioSummaryCard loans={loans} />
        </div>
      </ExpandableCard>

      {/* 2. Analytics Chart */}
      <ExpandableCard
        id="chart"
        icon={<BarChart2 className="w-5 h-5 text-violet-400" />}
        title="Weekly Performance"
        subtitle="Collection Analytics"
        isOpen={openSection === "chart"}
        onToggle={() => toggle("chart")}
        accentColor="violet-400"
      >
        <div className="mt-3 rounded-2xl bg-secondary/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-foreground">Collections This Week</p>
            <span className="text-xs text-muted-foreground font-medium">7 days</span>
          </div>
          <AnalyticsChart />
        </div>
      </ExpandableCard>

      {/* 3. Due Tomorrow */}
      <ExpandableCard
        id="tomorrow"
        icon={<Calendar className="w-5 h-5 text-amber-400" />}
        title="Due Tomorrow"
        subtitle="Upcoming Collections"
        badge={tomorrowCount > 0 ? `${tomorrowCount} clients` : undefined}
        badgeColor="bg-amber-500/10 text-amber-400"
        isOpen={openSection === "tomorrow"}
        onToggle={() => toggle("tomorrow")}
        accentColor="amber-400"
      >
        <div className="mt-3">
          <DueTomorrowCard installments={installments} loans={loans} customers={customers} />
        </div>
      </ExpandableCard>

      {/* 4. Top Overdue */}
      <ExpandableCard
        id="overdue"
        icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        title="Top Overdue"
        subtitle="Needs Attention"
        badge={overdueCount > 0 ? `${overdueCount} overdue` : "All clear"}
        badgeColor={overdueCount > 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}
        isOpen={openSection === "overdue"}
        onToggle={() => toggle("overdue")}
        accentColor="rose-400"
      >
        <div className="mt-3">
          <TopOverdueCard installments={installments} loans={loans} customers={customers} />
        </div>
      </ExpandableCard>

      {/* 5. Village Breakdown */}
      <ExpandableCard
        id="villages"
        icon={<MapPin className="w-5 h-5 text-emerald-400" />}
        title="Area Breakdown"
        subtitle="Village Collections"
        badge={villageCount > 0 ? `${villageCount} areas` : undefined}
        badgeColor="bg-emerald-500/10 text-emerald-400"
        isOpen={openSection === "villages"}
        onToggle={() => toggle("villages")}
        accentColor="emerald-400"
      >
        <div className="mt-3">
          <VillageCollectionBars installments={installments} loans={loans} customers={customers} />
        </div>
      </ExpandableCard>
    </div>
  );
}
