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
  
  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-24 max-w-5xl mx-auto px-1.5 sm:px-6 pt-4 sm:pt-8 overflow-hidden">
      {/* Premium Header */}
      <header className="w-full flex items-center justify-between bg-gradient-to-r from-white/90 via-white/80 to-white/90 dark:from-[#0d0d0d]/90 dark:via-[#121212]/80 dark:to-[#0d0d0d]/90 backdrop-blur-2xl p-4 sm:p-5 rounded-[2rem] border border-gray-200/50 dark:border-[#222]/50 shadow-md animate-in slide-in-from-top-4 duration-700 ease-out fill-mode-forwards relative overflow-hidden">
        {/* Subtle decorative top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent dark:via-emerald-500/30" />
        
        <div className="flex flex-col gap-1">
          {/* Brand/Role Subtitle */}
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full w-max border border-emerald-500/10 mb-1">
            LoanTrack Pro
          </span>
          <Greeting name={config.agentName} />
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button className="relative w-12 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-[#161616] border border-gray-200/60 dark:border-[#2b2b2b] flex items-center justify-center text-black dark:text-white dark:hover:bg-[#222] transition-all active:scale-95 shadow-sm group">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#161616] animate-pulse"></span>
          </button>
        </div>
      </header>

      <div className="w-full grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Left Column: Metrics & Actions */}
        <section className="w-full flex flex-col gap-5">
          {/* Main Balance Card */}
          <div className="w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col shadow-xl bg-gradient-to-br from-emerald-900 to-teal-950 dark:from-emerald-950 dark:to-black">
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-emerald-500 blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-teal-500 blur-3xl opacity-20 pointer-events-none"></div>
            
            <h2 className="text-emerald-100/70 font-semibold mb-2 relative z-10 flex items-center gap-2 uppercase tracking-widest text-xs">
              Expected Collection
            </h2>
            <div className="text-5xl sm:text-6xl font-black tracking-tighter mb-8 text-white relative z-10 drop-shadow-sm">
              ${expectedToday.toFixed(2).split('.')[0]}<span className="text-emerald-400 text-3xl sm:text-4xl">.{expectedToday.toFixed(2).split('.')[1]}</span>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <Link href="/new" className="flex-1">
                <Button className="w-full bg-white text-emerald-950 hover:bg-emerald-50 rounded-2xl h-14 flex items-center justify-center gap-2 font-bold shadow-lg transition-all active:scale-95">
                  <Plus className="w-5 h-5" /> New Loan
                </Button>
              </Link>
              <Link href="/reports" className="flex-1">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2 backdrop-blur-md bg-white/5 transition-all active:scale-95 font-semibold">
                  <ArrowUpRight className="w-5 h-5" /> Reports
                </Button>
              </Link>
            </div>
          </div>

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
