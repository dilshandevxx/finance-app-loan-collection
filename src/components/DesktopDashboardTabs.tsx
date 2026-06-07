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
      <div className="flex items-center gap-1.5 p-1.5 bg-secondary/60 border border-border/60 rounded-2xl w-fit backdrop-blur-sm">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                transition-all duration-300 cursor-pointer select-none
                ${isActive
                  ? "bg-card text-foreground shadow-md border border-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                }
              `}
            >
              <span className={`transition-colors duration-300 ${isActive ? "text-primary" : ""}`}>
                {tab.icon}
              </span>
              {tab.label}
              {/* Active dot under icon */}
              {isActive && (
                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <CollectionGoalCard
                  expectedToday={expectedToday}
                  collectedToday={collectedToday}
                  totalClientsToday={totalClientsToday}
                  collectedClientsToday={collectedClientsToday}
                  activeLoans={activeLoans}
                  overdueAmount={overdueAmount}
                />
              </div>
              <div className="lg:col-span-2">
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
          <div className="flex flex-col gap-6 animate-tabFade">

            {/* Row 1: Chart */}
            <div className="rounded-3xl bg-card border border-border p-6 lg:p-8 shadow-sm hover:border-border/80 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Collections</p>
                  <p className="text-xl font-black text-foreground tracking-tight">Weekly Performance</p>
                </div>
              </div>
              <div className="min-h-[280px] w-full">
                <AnalyticsChart />
              </div>
            </div>

            {/* Row 2: Due Tomorrow + Top Overdue side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
