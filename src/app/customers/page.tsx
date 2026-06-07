import { BottomNav } from "@/components/BottomNav";
import { CustomersList } from "@/components/CustomersList";
import { getCustomers, getLoans, getInstallments } from "@/data/db";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const [customers, loans, installments] = await Promise.all([
    getCustomers(),
    getLoans(),
    getInstallments(),
  ]);

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-2 sm:pt-4">
      {/* Stunning Clients Directory Header */}
      <div className="w-full relative rounded-[2rem] overflow-hidden bg-primary/5 border border-primary/10 shadow-sm mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Client Directory</h1>
            <p className="text-xs font-semibold text-muted-foreground">Manage and track your customer base</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
              {customers.length} Total
            </span>
          </div>
        </div>
      </div>

      <CustomersList customers={customers} loans={loans} installments={installments} />
      
      <BottomNav />
    </div>
  );
}
