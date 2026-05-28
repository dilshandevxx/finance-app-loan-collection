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
      <header className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">All Customers</h1>
      </header>

      <CustomersList customers={customers} loans={loans} installments={installments} />
      
      <BottomNav />
    </div>
  );
}
