"use client";

import { useState } from "react";
import { LayoutDashboard, BarChart3, Radio } from "lucide-react";
import { CollectionGoalCard } from "@/components/CollectionGoalCard";
import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";
import { FeaturedSections } from "@/components/FeaturedSections";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { DueTomorrowCard } from "@/components/DueTomorrowCard";
import { TopOverdueCard } from "@/components/TopOverdueCard";
import { VillageCollectionBars } from "@/components/VillageCollectionBars";
import { DashboardRoster } from "@/components/DashboardRoster";
import { Customer, Loan, Installment } from "@/data/db";

type TabKey = "overview" | "analytics" | "feed";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { key: "overview",  label: "Overview",    icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "analytics", label: "Analytics",   icon: <BarChart3 className="w-4 h-4" /> },
  { key: "feed",      label: "Action Feed", icon: <Radio className="w-4 h-4" /> },
];

interface DesktopDashboardTabsProps {
  customers: Customer[];
  loans: Loan[];
  installments: Installment[];
  pendingInstallments: Installment[];
  expectedToday: number;
  collectedToday: number;
  totalClientsToday: number;
  collectedClientsToday: number;
  activeLoans: number;
  overdueAmount: number;
}

export function DesktopDashboardTabs({
  customers,
  loans,
  installments,
  pendingInstallments,
  expectedToday,
  collectedToday,
  totalClientsToday,
  collectedClientsToday,
  activeLoans,
  overdueAmount,
}: DesktopDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <div className="hidden md:flex flex-col gap-6 w-full max-w-[1400px]">

      {/* ── Tab Bar ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-2 bg-[#0A0514]/80 border border-white/5 rounded-2xl w-fit backdrop-blur-md shadow-2xl">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                relative flex items-center gap-2 px-6 py-3 rounded-[14px] text-sm font-bold
                transition-all duration-300 cursor-pointer select-none overflow-hidden
                ${isActive
                  ? "text-white shadow-lg bg-white/5 border border-white/10"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
                }
              `}
            >
              {/* Active glow background */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50 blur-xl" />
              )}
              
              <span className={`relative z-10 transition-colors duration-300 ${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : ""}`}>
                {tab.icon}
              </span>
              <span className="relative z-10 tracking-wide">{tab.label}</span>
              
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-primary shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────────── */}
      <div className="tab-content-area">

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6 animate-tabFade">

            {/* Row 1: Collection Goal + KPI Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
              <div className="lg:col-span-3 flex">
                <CollectionGoalCard
                  expectedToday={expectedToday}
                  collectedToday={collectedToday}
                  totalClientsToday={totalClientsToday}
                  collectedClientsToday={collectedClientsToday}
                  activeLoans={activeLoans}
                  overdueAmount={overdueAmount}
                />
              </div>
              <div className="lg:col-span-2 flex">
                <PortfolioSummaryCard loans={loans} />
              </div>
            </div>

            {/* Row 2: Featured Section Cards (grid on desktop) */}
            <FeaturedSections
              customers={customers}
              installments={installments}
              loans={loans}
            />
          </div>
        )}

        {/* ═══ ANALYTICS TAB ═══ */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6 lg:gap-8 animate-tabFade">

            {/* Row 1: Chart */}
            <div className="rounded-[2rem] bg-[#0A0514]/40 border border-white/5 p-6 lg:p-8 shadow-sm backdrop-blur-sm hover:bg-[#0A0514]/60 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Collections</p>
                  <p className="text-xl font-black text-white tracking-tight">Weekly Performance</p>
                </div>
              </div>
              <div className="min-h-[280px] w-full">
                <AnalyticsChart />
              </div>
            </div>

            {/* Row 2: Due Tomorrow + Top Overdue side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <DueTomorrowCard installments={installments} loans={loans} customers={customers} />
              <TopOverdueCard installments={installments} loans={loans} customers={customers} />
            </div>

            {/* Row 3: Village Breakdown */}
            <VillageCollectionBars installments={installments} loans={loans} customers={customers} />
          </div>
        )}

        {/* ═══ ACTION FEED TAB ═══ */}
        {activeTab === "feed" && (
          <div className="animate-tabFade">
            <div className="rounded-3xl bg-card border border-border flex flex-col shadow-sm p-6 lg:p-8">
              <h3 className="font-black text-xl text-foreground mb-6 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                Live Action Feed
              </h3>
              <DashboardRoster
                pendingInstallments={pendingInstallments}
                customers={customers}
                loans={loans}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
