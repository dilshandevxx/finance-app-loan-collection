import Image from "next/image";
import { Search, Plus, ArrowUpRight, TrendingUp, AlertCircle, Users } from "lucide-react";
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
    <div className="flex flex-col gap-8 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#111] overflow-hidden relative border border-gray-200 dark:border-[#222]">
            <Image src="https://i.pravatar.cc/150?u=admin" alt="Profile" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-white/50 font-medium uppercase tracking-wider">Welcome back</span>
            <span className="text-sm font-semibold tracking-tight text-black dark:text-white">Agent 007</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#111] transition-colors shadow-sm">
            <Search className="w-4 h-4 text-gray-500 dark:text-white/70" />
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
