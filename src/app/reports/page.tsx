import { ReportsDashboard } from "@/components/ReportsDashboard";
import { BottomNav } from "@/components/BottomNav";
import { MOCK_CUSTOMERS, MOCK_INSTALLMENTS, MOCK_LOANS } from "@/data/mock";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-2 print:hidden">
        <h1 className="text-2xl font-bold text-white">Reports & Exports</h1>
      </header>

      <ReportsDashboard 
        installments={MOCK_INSTALLMENTS} 
        loans={MOCK_LOANS} 
        customers={MOCK_CUSTOMERS} 
      />
      
      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
