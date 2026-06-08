import { getCustomers, getDashboardInstallments, getLoans } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { DashboardRoster } from "@/components/DashboardRoster";
import { config } from "@/lib/config";
import { CollectionGoalCard } from "@/components/CollectionGoalCard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { formatLKR } from "@/lib/format";
import { DueTomorrowCard } from "@/components/DueTomorrowCard";
import { TopOverdueCard } from "@/components/TopOverdueCard";
import { VillageCollectionBars } from "@/components/VillageCollectionBars";
import { MobileDashboardSections } from "@/components/MobileDashboardSections";
import { FeaturedSections } from "@/components/FeaturedSections";
import { DesktopHomeGrid } from "@/components/DesktopHomeGrid";
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
    <div className="w-full flex flex-col gap-5 pb-28 md:pb-6 px-4 md:px-8 pt-2 md:pt-4 min-h-screen">

      {/* ── Full-width Header ────────────────────────────────── */}
      <DashboardHeader
        agentName={agentName}
        agentAvatar={agentAvatar}
        customers={customers}
        loans={loans}
        installments={installments}
      />

      {/* ── Mobile: Single column layout ─────────────────────── */}
      <div className="flex flex-col gap-4 md:hidden">

        {/* Goal Card */}
        <CollectionGoalCard
          expectedToday={expectedToday}
          collectedToday={collectedToday}
          totalClientsToday={totalClientsToday}
          collectedClientsToday={collectedClientsToday}
          activeLoans={activeLoans}
          overdueAmount={overdueAmount}
        />

        {/* Featured Sections (Horizontally Scrollable Cards) */}
        <FeaturedSections
          customers={customers}
          installments={installments}
          loans={loans}
        />

        {/* Due Today Roster */}
        <DashboardRoster
          pendingInstallments={pendingInstallments}
          customers={customers}
          loans={loans}
        />

        {/* Expandable Analytics Sections */}
        <MobileDashboardSections
          loans={loans}
          installments={installments}
          customers={customers}
          activeLoans={activeLoans}
          overdueAmount={overdueAmount}
        />
      </div>

      {/* ── Desktop: Navigation Grid ─────────────────────────────────── */}
      <DesktopHomeGrid
        customers={customers}
        loans={loans}
        installments={installments}
        expectedToday={expectedToday}
        collectedToday={collectedToday}
        totalClientsToday={totalClientsToday}
        collectedClientsToday={collectedClientsToday}
        activeLoans={activeLoans}
        overdueAmount={overdueAmount}
      />

      {/* ── Desktop: Action Required Roster ──────────────────────── */}
      <div className="hidden md:flex flex-col mt-6 bg-[#0A0514]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 shadow-xl w-full overflow-hidden">
        <h2 className="text-xl font-black text-white tracking-tight mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Action Required Today
        </h2>
        <DashboardRoster
          pendingInstallments={pendingInstallments}
          customers={customers}
          loans={loans}
        />
      </div>

      <BottomNav />
    </div>
  );
}
