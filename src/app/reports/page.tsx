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
      <header className="flex items-center justify-between mb-2 print:hidden max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">Reports & Exports</h1>
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
