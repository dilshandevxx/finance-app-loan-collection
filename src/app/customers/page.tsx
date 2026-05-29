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
      <header className="w-full flex items-center justify-between bg-card p-5 rounded-[1.75rem] border border-border shadow-sm relative overflow-hidden mb-2">
        <h1 className="text-xl font-bold text-foreground tracking-tight">All Customers</h1>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-sm">
          Database
        </span>
      </header>

      <CustomersList customers={customers} loans={loans} installments={installments} />
      
      <BottomNav />
    </div>
  );
}
