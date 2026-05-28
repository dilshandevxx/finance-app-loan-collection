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
    <div className="flex flex-col gap-6 pb-24 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 sm:pt-8">
      {/* Header */}
      <header className="w-full flex items-center justify-between bg-gradient-to-br from-neutral-50/60 via-white to-neutral-100/40 dark:from-[#1a1a1c] dark:via-[#141416] dark:to-[#0c0c0d] p-5 rounded-[1.75rem] border border-neutral-200 dark:border-neutral-800/60 shadow-sm relative overflow-hidden mb-2">
        <h1 className="text-xl font-bold text-black dark:text-white tracking-tight">All Customers</h1>
        <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-neon-lime bg-neon-lime/10 px-3 py-1 rounded-full border border-neon-lime/25 shadow-sm">
          Database
        </span>
      </header>

      <CustomersList customers={customers} loans={loans} installments={installments} />
      
      <BottomNav />
    </div>
  );
}
