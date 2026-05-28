import Image from "next/image";
import { Plus, ArrowUpRight, TrendingUp, AlertCircle, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomers, getInstallments, getLoans } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { DashboardRoster } from "@/components/DashboardRoster";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Greeting } from "@/components/Greeting";
import { LogoutButton } from "@/components/LogoutButton";
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

  // Compute stats for today's collection targets
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
    <div className="w-full flex flex-col gap-6 pb-28 max-w-md mx-auto px-4 pt-6 overflow-hidden min-h-screen">
      {/* Premium Minimalist Header */}
      <header className="w-full flex items-center justify-between py-2">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Hello,</span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
            {config.agentName} 👋
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationPanel 
            customers={customers}
            loans={loans}
            installments={installments}
          />
        </div>
      </header>

      {/* Main Dynamic Mood Portfolio Status Card */}
      <section className="w-full">
        <CollectionGoalCard 
          expectedToday={expectedToday} 
          collectedToday={collectedToday} 
          totalClientsToday={totalClientsToday}
          collectedClientsToday={collectedClientsToday}
          activeLoans={activeLoans}
          overdueAmount={overdueAmount}
        />
      </section>

      {/* Analytics chart: Weekly Mood/Collections Progress */}
      <section className="w-full bg-white dark:bg-mood-charcoal border border-neutral-100 dark:border-[#1f1f23] rounded-[2rem] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Collections</span>
            <span className="text-sm font-bold text-neutral-800 dark:text-white">Weekly Performance</span>
          </div>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">This Week</span>
        </div>
        <AnalyticsChart />
      </section>

      {/* Today's Roster List */}
      <section className="w-full">
        <DashboardRoster 
          pendingInstallments={pendingInstallments} 
          customers={customers} 
          loans={loans} 
        />
      </section>
      
      <BottomNav />
    </div>
  );
}
