import { BottomNav } from "@/components/BottomNav";
import { CustomersList } from "@/components/CustomersList";
import { MOCK_CUSTOMERS, MOCK_LOANS } from "@/data/mock";

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-white">All Customers</h1>
      </header>

      <CustomersList customers={MOCK_CUSTOMERS} loans={MOCK_LOANS} />
      
      <BottomNav />
    </div>
  );
}
