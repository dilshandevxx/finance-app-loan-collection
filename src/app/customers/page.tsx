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
      {/* Beautiful Portfolio Header */}
      <div className="w-full relative rounded-[2rem] overflow-hidden bg-[#0a0514] border border-white/10 shadow-2xl mb-4">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Portfolio</h1>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm backdrop-blur-sm">
              Overview
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">Total Capital</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-white/40">Rs.</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
                  {Math.floor(loans.filter(l => l.status === "ACTIVE").reduce((sum, l) => sum + l.principalAmount, 0)).toLocaleString("en-LK")}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">Expected Return</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-white/40">Rs.</span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
                  {Math.floor(loans.filter(l => l.status === "ACTIVE").reduce((sum, l) => sum + l.totalAmountDue, 0)).toLocaleString("en-LK")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-5 border-t border-white/10 flex items-center justify-between">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Clients</span>
               <span className="text-lg font-bold text-white">
                 {Array.from(new Set(loans.filter(l => l.status === "ACTIVE").map(l => l.customerId))).length}
               </span>
             </div>
             <div className="flex flex-col text-right">
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Loans</span>
               <span className="text-lg font-bold text-white">
                 {loans.filter(l => l.status === "ACTIVE").length}
               </span>
             </div>
          </div>
        </div>
      </div>

      <CustomersList customers={customers} loans={loans} installments={installments} />
      
      <BottomNav />
    </div>
  );
}
