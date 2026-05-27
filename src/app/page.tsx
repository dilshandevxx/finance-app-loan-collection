import Image from "next/image";
import { Plus, ArrowUpRight, TrendingUp, AlertCircle, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CUSTOMERS, MOCK_INSTALLMENTS, MOCK_LOANS } from "@/data/mock";
import { BottomNav } from "@/components/BottomNav";
import { DashboardRoster } from "@/components/DashboardRoster";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Greeting } from "@/components/Greeting";
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
    <div className="flex flex-col gap-6 sm:gap-8 pb-24 max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 overflow-hidden">
      {/* Premium Header */}
      <header className="flex items-center justify-between bg-white/70 dark:bg-[#111]/70 backdrop-blur-2xl p-3 sm:p-4 rounded-3xl border border-gray-200/60 dark:border-[#333]/60 shadow-sm animate-in slide-in-from-top-4 duration-700 ease-out fill-mode-forwards">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-gray-100 to-gray-50 dark:from-[#222] dark:to-[#111] overflow-hidden relative border-2 border-white dark:border-[#333] shadow-lg p-0.5 shrink-0">
            <div className="w-full h-full rounded-[14px] overflow-hidden relative">
              <Image src="https://i.pravatar.cc/150?u=dilshan" alt="Profile" fill className="object-cover" />
            </div>
          </div>
          <Greeting name="Dilshan" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="relative shrink-0 w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-[#222] border border-gray-200 dark:border-[#333] flex items-center justify-center text-black dark:text-white dark:hover:bg-[#333] transition-all active:scale-95 shadow-sm">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#222] animate-pulse"></span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Metrics & Actions */}
        <section className="flex flex-col gap-5">
          {/* Main Balance Card */}
          <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col shadow-xl bg-gradient-to-br from-emerald-900 to-teal-950 dark:from-emerald-950 dark:to-black animate-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-forwards opacity-0">
            
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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-5 shadow-sm animate-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-forwards opacity-0">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3 bg-blue-100/50 dark:bg-blue-900/30 w-fit px-3 py-1.5 rounded-xl">
                <Users className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Active</span>
              </div>
              <div className="text-3xl font-black text-blue-950 dark:text-blue-100 tracking-tight">{activeLoans}</div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-5 shadow-sm animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-forwards opacity-0">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-3 bg-rose-100/50 dark:bg-rose-900/30 w-fit px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Overdue</span>
              </div>
              <div className="text-3xl font-black text-rose-950 dark:text-rose-100 tracking-tight">${overdueAmount.toFixed(2)}</div>
            </div>
          </div>
        </section>

        {/* Right Column: Today's Roster */}
        <div className="animate-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-forwards opacity-0">
          <DashboardRoster 
            pendingInstallments={pendingInstallments} 
            customers={MOCK_CUSTOMERS} 
            loans={MOCK_LOANS} 
          />
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
