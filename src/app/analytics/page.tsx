import { getCustomers, getDashboardInstallments, getLoans } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { DueTomorrowCard } from "@/components/DueTomorrowCard";
import { TopOverdueCard } from "@/components/TopOverdueCard";
import { VillageCollectionBars } from "@/components/VillageCollectionBars";
import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const [customers, loans, installments] = await Promise.all([
    getCustomers(),
    getLoans(),
    getDashboardInstallments(),
  ]);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-28 md:pb-12 px-4 pt-6 min-h-screen max-w-[1400px] mx-auto">
      
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl md:text-[32px] font-black tracking-tight text-white">
                Portfolio Analytics
              </h1>
            </div>
            <p className="text-sm text-white/50 font-medium">Detailed financial performance and client insights.</p>
          </div>
        </div>
      </div>

      {/* ── Content Grid ──────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:gap-8">
        
        {/* Row 1: Summary */}
        <div className="w-full">
          <PortfolioSummaryCard loans={loans} />
        </div>

        {/* Row 2: Chart */}
        <div className="rounded-[2rem] bg-[#0A0514]/40 border border-white/5 p-6 lg:p-8 shadow-sm backdrop-blur-sm">
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

        {/* Row 3: Actionable Cards side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <DueTomorrowCard installments={installments} loans={loans} customers={customers} />
          <TopOverdueCard installments={installments} loans={loans} customers={customers} />
        </div>

        {/* Row 4: Village Breakdown */}
        <div className="w-full">
          <VillageCollectionBars installments={installments} loans={loans} customers={customers} />
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
