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
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-24 max-w-5xl mx-auto px-1.5 sm:px-6 pt-4 sm:pt-8 overflow-hidden">
      {/* Premium Header */}
      <header 
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between backdrop-blur-2xl p-5 sm:p-6 rounded-[2.25rem] border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-4 duration-700 ease-out fill-mode-forwards relative overflow-hidden gap-4 sm:gap-0"
        style={{
          background: 'linear-gradient(145deg, #121214 0%, #0d0d0f 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Subtle decorative top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-fintech-purple/40 to-transparent" />
        <div className="absolute -right-10 -top-10 w-28 h-28 bg-fintech-purple/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <Greeting name={config.agentName} />
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3.5">
          {/* Brand/Role Subtitle */}
          <span 
            className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(139,92,246,0.3)] border-none"
            style={{
              background: 'linear-gradient(90deg, var(--color-fintech-purple) 0%, var(--color-fintech-pink) 100%)'
            }}
          >
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
            totalClientsToday={totalClientsToday}
            collectedClientsToday={collectedClientsToday}
          />

          {/* Secondary Metric Cards */}
          <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-4">
            <div 
              className="rounded-3xl p-3.5 sm:p-5 shadow-2xl border border-white/5 overflow-hidden flex flex-col relative"
              style={{
                background: 'linear-gradient(145deg, #121214 0%, #0d0d0f 100%)',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex items-center gap-1.5 text-fintech-purple mb-3 bg-fintech-purple/10 border border-fintech-purple/20 w-fit px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Active</span>
              </div>
              <div className="text-[17px] min-[360px]:text-xl sm:text-3xl font-black text-white tracking-tight truncate">{activeLoans}</div>
            </div>
            
            <div 
              className="rounded-3xl p-3.5 sm:p-5 shadow-2xl border border-white/5 overflow-hidden flex flex-col relative"
              style={{
                background: 'linear-gradient(145deg, #121214 0%, #0d0d0f 100%)',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex items-center gap-1.5 text-fintech-crimson mb-3 bg-fintech-crimson/10 border border-fintech-crimson/20 w-fit px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Overdue</span>
              </div>
              <div className="text-[17px] min-[360px]:text-xl sm:text-3xl font-black text-white tracking-tight truncate" title={`$${overdueAmount.toFixed(2)}`}>
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
