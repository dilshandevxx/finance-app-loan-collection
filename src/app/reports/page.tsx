import { ReportsDashboard } from "@/components/ReportsDashboard";
import { BottomNav } from "@/components/BottomNav";
import { getCustomers, getInstallments, getLoans } from "@/data/db";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [customers, loans, installments] = await Promise.all([
    getCustomers(),
    getLoans(),
    getInstallments(),
  ]);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <header className="w-full flex items-center justify-between bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/40 dark:from-[#16201a] dark:via-[#1f1f21] dark:to-[#121815] p-5 rounded-[1.75rem] border border-emerald-500/10 dark:border-emerald-500/20 shadow-sm relative overflow-hidden mb-2 print:hidden max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-black dark:text-white tracking-tight">Reports & Analytics</h1>
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10 shadow-sm">
          Analytics
        </span>
      </header>

      <ReportsDashboard 
        installments={installments} 
        loans={loans} 
        customers={customers} 
      />
      
      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
