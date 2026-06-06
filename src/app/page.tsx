import { AlertCircle, Users } from "lucide-react";
import { getCustomers, getDashboardInstallments, getLoans } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { DashboardRoster } from "@/components/DashboardRoster";
import Link from "next/link";
import { config } from "@/lib/config";
import { CollectionGoalCard } from "@/components/CollectionGoalCard";
import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { formatLKR } from "@/lib/format";
import { DueTomorrowCard } from "@/components/DueTomorrowCard";
import { TopOverdueCard } from "@/components/TopOverdueCard";
import { VillageCollectionBars } from "@/components/VillageCollectionBars";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let agentName = config.agentName;
  let agentAvatar = "";
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.full_name) {
      agentName = profile.full_name;
    } else if (user.user_metadata?.full_name) {
      agentName = user.user_metadata.full_name;
    } else if (user.email) {
      agentName = user.email.split('@')[0];
      agentName = agentName.charAt(0).toUpperCase() + agentName.slice(1);
    }

    if (user.user_metadata?.avatar_url) {
      agentAvatar = user.user_metadata.avatar_url;
    }
  }

  const [customers, loans, installments] = await Promise.all([
    getCustomers(),
    getLoans(),
    getDashboardInstallments(),
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
    const isPendingTodayOrMissed =
      (i.status === "PENDING" || i.status === "MISSED") &&
      (new Date(i.dueDate).toDateString() === new Date().toDateString() || i.status === "MISSED");
    const isPaidToday =
      i.status === "PAID" && i.paidDate &&
      new Date(i.paidDate).toDateString() === new Date().toDateString();
    return isPendingTodayOrMissed || isPaidToday;
  });

  const totalClientsToday = todayInstallmentsList.length;
  const collectedClientsToday = todayInstallmentsList.filter(i => i.status === "PAID").length;

  return (
    <div className="w-full flex flex-col gap-5 pb-28 md:pb-6 px-4 pt-2 min-h-screen">

      {/* ── Full-width Header ────────────────────────────────── */}
      <DashboardHeader
        agentName={agentName}
        agentAvatar={agentAvatar}
        customers={customers}
        loans={loans}
        installments={installments}
      />

      {/* ── Desktop: 2-Column Grid │ Mobile: Single Column ───── */}
      <div className="flex flex-col md:grid md:grid-cols-12 gap-5 items-start">

        {/* ════════════════════════════════════════
            LEFT PANEL — Metrics, Portfolio, Chart
            ════════════════════════════════════════ */}
        <div className="flex flex-col gap-5 md:col-span-7">

          {/* Metric Pills */}
          <div className="grid grid-cols-2 gap-3">

            {/* Active Loans */}
            <div className="rounded-[1.5rem] p-5 flex flex-col gap-1 bg-white dark:bg-card border border-zinc-200 dark:border-border text-zinc-900 dark:text-white shadow-sm">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-primary" /> Active Loans
              </div>
              <span className="text-4xl font-black tracking-tight">{activeLoans}</span>
              <span className="text-[10px] text-zinc-500 dark:text-muted-foreground font-medium">loans running</span>
            </div>

            {/* Overdue */}
            <div className="rounded-[1.5rem] p-5 flex flex-col gap-1 bg-white dark:bg-card border border-zinc-200 dark:border-border text-zinc-900 dark:text-white shadow-sm">
              <div className="flex items-center gap-1.5 text-zinc-500 dark:text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-destructive-foreground" /> Overdue
              </div>
              <span className="text-4xl font-black tracking-tight truncate" title={formatLKR(overdueAmount)}>
                {formatLKR(overdueAmount)}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-muted-foreground font-medium">total overdue amount</span>
            </div>
          </div>

          {/* Portfolio Summary Card */}
          <PortfolioSummaryCard loans={loans} />

          {/* Portfolio Status Card */}
          <CollectionGoalCard
            expectedToday={expectedToday}
            collectedToday={collectedToday}
            totalClientsToday={totalClientsToday}
            collectedClientsToday={collectedClientsToday}
            activeLoans={activeLoans}
            overdueAmount={overdueAmount}
          />

          {/* Weekly Collections Chart */}
          <div className="rounded-2xl bg-card border border-white/5 dark:border-white/10 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Collections</p>
                <p className="text-sm font-bold text-foreground">Weekly Performance</p>
              </div>
              <span className="text-xs text-muted-foreground font-medium">This Week</span>
            </div>
            <AnalyticsChart />
          </div>

          {/* Due Tomorrow Preview */}
          <DueTomorrowCard
            installments={installments}
            loans={loans}
            customers={customers}
          />

          {/* Top Overdue Customers */}
          <TopOverdueCard
            installments={installments}
            loans={loans}
            customers={customers}
          />

          {/* Village Collection Bars */}
          <VillageCollectionBars
            installments={installments}
            loans={loans}
            customers={customers}
          />

          {/* Quick Nav — Mobile only */}
          <div className="grid grid-cols-2 gap-3 md:hidden print:hidden">
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
              📍 Manage Areas
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT PANEL — Quick Nav + Roster
            ════════════════════════════════════════ */}
        <div className="flex flex-col gap-4 md:col-span-5 md:sticky md:top-4">

          {/* Quick Nav — Desktop only */}
          <div className="hidden md:grid grid-cols-2 gap-3 print:hidden">
            <Link
              href="/new"
              className="flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xs font-black shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              ➕ New Account
            </Link>
            <Link
              href="/villages"
              className="flex items-center justify-center gap-2 py-3 bg-card hover:bg-secondary border border-border rounded-2xl text-xs font-black text-foreground shadow-sm transition-all active:scale-[0.98]"
            >
              📍 Manage Areas
            </Link>
          </div>

          {/* Due Today Roster — sticky & scrollable on desktop */}
          <div className="md:max-h-[calc(100vh-11rem)] md:overflow-y-auto md:rounded-2xl">
            <DashboardRoster
              pendingInstallments={pendingInstallments}
              customers={customers}
              loans={loans}
            />
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
