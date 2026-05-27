import Image from "next/image";
import { Plus, ArrowUpRight, TrendingUp, AlertCircle, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CUSTOMERS, MOCK_INSTALLMENTS, MOCK_LOANS } from "@/data/mock";
import { BottomNav } from "@/components/BottomNav";
import { DashboardRoster } from "@/components/DashboardRoster";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function Home() {
  const pendingInstallments = MOCK_INSTALLMENTS.filter(i => i.status === "PENDING" || i.status === "MISSED");
  
  const expectedToday = pendingInstallments
    .filter(i => new Date(i.dueDate).toDateString() === new Date().toDateString() || i.status === "MISSED")
    .reduce((sum, inst) => sum + inst.amount, 0);

  const activeLoans = MOCK_LOANS.filter(l => l.status === "ACTIVE").length;
  
  const overdueAmount = pendingInstallments
    .filter(i => i.status === "MISSED" || new Date(i.dueDate) < new Date(new Date().toDateString()))
    .reduce((sum, inst) => sum + inst.amount, 0);
  
  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-24 max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
      {/* Premium Header */}
      <header className="flex items-center justify-between bg-white/70 dark:bg-[#111]/70 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-gray-200/60 dark:border-[#333]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-gray-100 to-gray-50 dark:from-[#222] dark:to-[#111] overflow-hidden relative border-2 border-white dark:border-[#333] shadow-inner p-0.5 shrink-0">
            <div className="w-full h-full rounded-[14px] overflow-hidden relative">
              <Image src="https://i.pravatar.cc/150?u=admin" alt="Profile" fill className="object-cover" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-white/50 font-bold uppercase tracking-wider mb-0.5">Welcome back</span>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-black dark:text-white leading-none">Agent 007</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 pr-1">
          <ThemeToggle />
          <button className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] flex items-center justify-center text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#222] transition-colors shadow-sm">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-white/80" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a1a1a]"></span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Metrics & Actions */}
        <section className="flex flex-col gap-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-8 border border-gray-200 dark:border-[#222] shadow-sm flex flex-col">
            <h2 className="text-gray-500 dark:text-white/50 text-sm font-medium mb-1">Expected Collection</h2>
            <div className="text-5xl font-semibold tracking-tighter mb-8 text-black dark:text-white">
              ${expectedToday.toFixed(2).split('.')[0]}<span className="text-gray-400 dark:text-white/40 text-3xl">.{expectedToday.toFixed(2).split('.')[1]}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/new" className="flex-1">
                <Button className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-xl h-12 flex items-center justify-center gap-2 font-medium shadow-sm">
                  <Plus className="w-4 h-4" /> New Loan
                </Button>
              </Link>
              <Link href="/reports" className="flex-1">
                <Button variant="outline" className="w-full h-12 rounded-xl border-gray-200 dark:border-[#222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#111] flex items-center justify-center gap-2 shadow-sm bg-white dark:bg-[#0a0a0a]">
                  <ArrowUpRight className="w-4 h-4" /> Reports
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-white/50 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Active Loans</span>
              </div>
              <div className="text-2xl font-semibold text-black dark:text-white">{activeLoans}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-red-500 dark:text-red-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Overdue Amount</span>
              </div>
              <div className="text-2xl font-semibold text-red-600 dark:text-red-400">${overdueAmount.toFixed(2)}</div>
            </div>
          </div>
        </section>

        {/* Right Column: Today's Roster */}
        <DashboardRoster 
          pendingInstallments={pendingInstallments} 
          customers={MOCK_CUSTOMERS} 
          loans={MOCK_LOANS} 
        />
      </div>
      
      <BottomNav />
    </div>
  );
}
