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
      <header className="w-full flex items-center justify-between bg-card p-5 rounded-[1.75rem] border border-border shadow-sm relative overflow-hidden mb-2 print:hidden max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Reports & Analytics</h1>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-sm">
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
