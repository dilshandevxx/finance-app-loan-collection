import { AlertCircle, Users } from "lucide-react";
import { getCustomers, getInstallments, getLoans } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { DashboardRoster } from "@/components/DashboardRoster";
import Link from "next/link";
import { config } from "@/lib/config";
import { CollectionGoalCard } from "@/components/CollectionGoalCard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { AnalyticsChart } from "@/components/AnalyticsChart";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [customers, loans, installments] = await Promise.all([
    getCustomers(),
    getLoans(),
    getInstallments(),
  ]);

  const pendingInstallments = installments.filter(i => i.status === "PENDING" || i.status === "MISSED");
  
  const expectedToday = pendingInstallments
    .filter(i => new Date(i.dueDate).toDateString() === new Date().toDateString() || i.status === "MISSED")
    .reduce((sum, inst) => sum + inst.amount, 0);

  const activeLoans = loans.filter(l => l.status === "ACTIVE").length;
  
  const overdueAmount = pendingInstallments
    .filter(i => i.status === "MISSED" || new Date(i.dueDate) < new Date(new Date().toDateString()))
    .reduce((sum, inst) => sum + inst.amount, 0);

  const collectedToday = installments
    .filter(i => i.status === "PAID" && i.paidDate && new Date(i.paidDate).toDateString() === new Date().toDateString())
    .reduce((sum, inst) => sum + inst.amount, 0);

  const todayInstallmentsList = installments.filter(i => {
    const isPendingTodayOrMissed = (i.status === "PENDING" || i.status === "MISSED") && 
      (new Date(i.dueDate).toDateString() === new Date().toDateString() || i.status === "MISSED");
    const isPaidToday = i.status === "PAID" && i.paidDate && 
      new Date(i.paidDate).toDateString() === new Date().toDateString();
    return isPendingTodayOrMissed || isPaidToday;
  });

  const totalClientsToday = todayInstallmentsList.length;
  const collectedClientsToday = todayInstallmentsList.filter(i => i.status === "PAID").length;
  
  return (
    <div className="w-full flex flex-col gap-5 pb-28 max-w-md mx-auto px-4 pt-6 min-h-screen">

      {/* ── Header ───────────────────────────────────────── */}
      <header className="flex items-center justify-between py-1">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">Hello,</span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {config.agentName} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationPanel customers={customers} loans={loans} installments={installments} />
        </div>
      </header>

      {/* ── Metric Pills ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active Loans – violet */}
        <div className="rounded-2xl p-4 flex flex-col gap-1 bg-[#7c6dbf] text-white shadow-lg shadow-[#7c6dbf]/30">
          <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-wider">
            <Users className="w-3 h-3" /> Active
          </div>
          <span className="text-3xl font-black tracking-tight">{activeLoans}</span>
          <span className="text-[10px] text-white/60 font-medium">loans running</span>
        </div>

        {/* Overdue – coral */}
        <div className="rounded-2xl p-4 flex flex-col gap-1 bg-[#e05470] text-white shadow-lg shadow-[#e05470]/30">
          <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" /> Overdue
          </div>
          <span className="text-3xl font-black tracking-tight truncate" title={`$${overdueAmount.toFixed(2)}`}>
            ${overdueAmount.toFixed(0)}
          </span>
          <span className="text-[10px] text-white/60 font-medium">amount due</span>
        </div>
      </div>

      {/* ── Portfolio Status Card ─────────────────────────── */}
      <CollectionGoalCard
        expectedToday={expectedToday}
        collectedToday={collectedToday}
        totalClientsToday={totalClientsToday}
        collectedClientsToday={collectedClientsToday}
        activeLoans={activeLoans}
        overdueAmount={overdueAmount}
      />

      {/* ── Weekly Chart ─────────────────────────────────── */}
      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Collections</p>
            <p className="text-sm font-bold text-foreground">Weekly Performance</p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">This Week</span>
        </div>
        <AnalyticsChart />
      </div>

      {/* ── Due Today Roster ─────────────────────────────── */}
      <DashboardRoster
        pendingInstallments={pendingInstallments}
        customers={customers}
        loans={loans}
      />

      <BottomNav />
    </div>
  );
}
