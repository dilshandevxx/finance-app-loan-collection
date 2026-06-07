import { AlertCircle, Users } from "lucide-react";
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
import { BigPortfolioHeader } from "@/components/BigPortfolioHeader";
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

        {/* Big Portfolio Header on Home */}
        <BigPortfolioHeader loans={loans} customers={customers} />

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

      {/* ── Desktop: 2-Column Grid (High-End Dashboard Layout) ───────────────────────────── */}
      <div className="hidden md:grid md:grid-cols-12 gap-8 items-start max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* LEFT PANEL — Primary Insights & Analytics */}
        <div className="flex flex-col gap-6 md:col-span-8 lg:col-span-8 xl:col-span-8">
          
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Active Loans Stat */}
            <div className="relative group rounded-[2rem] p-6 bg-card/40 hover:bg-card/80 backdrop-blur-md border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-colors" />
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Active Loans</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black tracking-tighter text-foreground">{activeLoans}</span>
                  <span className="text-sm font-semibold text-muted-foreground mb-1.5">running</span>
                </div>
              </div>
            </div>

            {/* Overdue Stat */}
            <div className="relative group rounded-[2rem] p-6 bg-card/40 hover:bg-card/80 backdrop-blur-md border border-border/50 hover:border-destructive/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(244,63,94,0.12)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-[40px] group-hover:bg-destructive/20 transition-colors" />
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-destructive transition-colors">Total Overdue</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-destructive mb-0.5">Rs.</span>
                  <span className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground truncate" title={Math.floor(overdueAmount).toString()}>
                    {Math.floor(overdueAmount).toLocaleString("en-LK")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Analytics Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <PortfolioSummaryCard loans={loans} />
              <DueTomorrowCard installments={installments} loans={loans} customers={customers} />
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/50 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">Collections</p>
                    <p className="text-lg font-black text-foreground tracking-tight">Weekly Performance</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-secondary text-xs font-bold text-muted-foreground">This Week</div>
                </div>
                <div className="h-[200px] w-full">
                  <AnalyticsChart />
                </div>
              </div>
              <TopOverdueCard installments={installments} loans={loans} customers={customers} />
            </div>
          </div>

          <VillageCollectionBars installments={installments} loans={loans} customers={customers} />
        </div>

        {/* RIGHT PANEL — Action Center & Roster */}
        <div className="flex flex-col gap-6 md:col-span-4 lg:col-span-4 xl:col-span-4 md:sticky md:top-6">
          <BigPortfolioHeader loans={loans} customers={customers} />
          
          <CollectionGoalCard
            expectedToday={expectedToday}
            collectedToday={collectedToday}
            totalClientsToday={totalClientsToday}
            collectedClientsToday={collectedClientsToday}
            activeLoans={activeLoans}
            overdueAmount={overdueAmount}
          />
          
          <FeaturedSections
            customers={customers}
            installments={installments}
            loans={loans}
          />
          
          <div className="rounded-[2rem] bg-card/20 backdrop-blur-xl border border-white/5 md:max-h-[calc(100vh-28rem)] md:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full shadow-2xl">
            <div className="p-1">
              <DashboardRoster
                pendingInstallments={pendingInstallments}
                customers={customers}
                loans={loans}
              />
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
