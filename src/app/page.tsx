import { AlertCircle, Users } from "lucide-react";
import { getCustomers, getInstallments, getLoans } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { DashboardRoster } from "@/components/DashboardRoster";
import Link from "next/link";
import { config } from "@/lib/config";
import { CollectionGoalCard } from "@/components/CollectionGoalCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { formatLKR } from "@/lib/format";

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
    <div className="w-full flex flex-col gap-5 pb-28 max-w-md mx-auto px-4 pt-2 min-h-screen">

      {/* ── Header ───────────────────────────────────────── */}
      <DashboardHeader
        agentName={config.agentName}
        customers={customers}
        loans={loans}
        installments={installments}
      />

      {/* ── Metric Pills ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active Loans – Forest Green */}
        <div className="rounded-2xl p-4 flex flex-col gap-1 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <div className="flex items-center gap-1.5 text-primary-foreground/70 text-[10px] font-bold uppercase tracking-wider">
            <Users className="w-3 h-3" /> Active
          </div>
          <span className="text-3xl font-black tracking-tight">{activeLoans}</span>
          <span className="text-[10px] text-primary-foreground/60 font-medium">loans running</span>
        </div>

        {/* Overdue – Terracotta */}
        <div className="rounded-2xl p-4 flex flex-col gap-1 bg-destructive-foreground text-white shadow-lg shadow-destructive-foreground/20">
          <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" /> Overdue
          </div>
          <span className="text-3xl font-black tracking-tight truncate" title={formatLKR(overdueAmount)}>
            {formatLKR(overdueAmount)}
          </span>
          <span className="text-[10px] text-white/70 font-medium">amount due</span>
        </div>
      </div>

      {/* ── Quick Navigation ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 print:hidden">
        <Link
          href="/new"
          className="flex items-center justify-center gap-2 py-3 bg-card hover:bg-secondary border border-border rounded-2xl text-xs font-black text-foreground shadow-sm transition-all active:scale-[0.98]"
        >
          ➕ New Account
        </Link>
        <Link
          href="/villages"
          className="flex items-center justify-center gap-2 py-3 bg-card hover:bg-secondary border border-border rounded-2xl text-xs font-black text-foreground shadow-sm transition-all active:scale-[0.98]"
        >
          📍 Manage Villages
        </Link>
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

      {/* ── Due Today Roster ─────────────────────────────── */}
      <DashboardRoster
        pendingInstallments={pendingInstallments}
        customers={customers}
        loans={loans}
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

      <BottomNav />
    </div>
  );
}
