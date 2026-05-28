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
  
  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-24 max-w-5xl mx-auto px-1.5 sm:px-6 pt-4 sm:pt-8 overflow-hidden">
      {/* Premium Header */}
      <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 dark:from-[#16201a] dark:via-[#1f1f21] dark:to-[#121815] backdrop-blur-2xl p-5 sm:p-6 rounded-[2.25rem] border-2 border-emerald-500/10 dark:border-emerald-500/20 shadow-[0_8px_32px_rgba(16,185,129,0.05)] animate-in slide-in-from-top-4 duration-700 ease-out fill-mode-forwards relative overflow-hidden gap-4 sm:gap-0">
        {/* Subtle decorative top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-550/40 to-transparent dark:via-emerald-400/50" />
        <div className="absolute -right-10 -top-10 w-28 h-28 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <Greeting name={config.agentName} />
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3.5">
          {/* Brand/Role Subtitle */}
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            LoanTrack Pro
          </span>
          
          <NotificationPanel 
            customers={customers}
            loans={loans}
            installments={installments}
          />
        </div>
      </header>

      <div className="w-full grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Left Column: Metrics & Actions */}
        <section className="w-full flex flex-col gap-5">
          {/* Main Balance / Collection Goal Card */}
          <CollectionGoalCard 
            expectedToday={expectedToday} 
            collectedToday={collectedToday} 
          />

          {/* Secondary Metric Cards */}
          <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-3.5 sm:p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-3 bg-blue-100/50 dark:bg-blue-900/30 w-fit px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Active</span>
              </div>
              <div className="text-[17px] min-[360px]:text-xl sm:text-3xl font-black text-blue-950 dark:text-blue-100 tracking-tight truncate">{activeLoans}</div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-3.5 sm:p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 mb-3 bg-rose-100/50 dark:bg-rose-900/30 w-fit px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Overdue</span>
              </div>
              <div className="text-[17px] min-[360px]:text-xl sm:text-3xl font-black text-rose-950 dark:text-rose-100 tracking-tight truncate" title={`$${overdueAmount.toFixed(2)}`}>
                ${overdueAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Today's Roster */}
        <div className="w-full">
          <DashboardRoster 
            pendingInstallments={pendingInstallments} 
            customers={customers} 
            loans={loans} 
          />
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
