import Image from "next/image";
import { Search, Plus, ArrowUpRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CUSTOMERS, MOCK_INSTALLMENTS, MOCK_LOANS } from "@/data/mock";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";

export default function Home() {
  const pendingInstallments = MOCK_INSTALLMENTS.filter(i => i.status === "PENDING");
  
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 overflow-hidden relative border border-white/10">
            <Image src="https://i.pravatar.cc/150?u=admin" alt="Profile" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white/50">Welcome back,</span>
            <span className="text-sm font-medium">Agent 007</span>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition">
          <Search className="w-5 h-5 text-white/70" />
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Balance Card */}
        <section>
          <div className="bg-gradient-to-b from-[#1c1c1f] to-black rounded-[2rem] p-8 border border-white/5 relative overflow-hidden shadow-2xl">
            {/* Abstract background shapes */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-white/60 text-sm font-medium mb-2">Today's Expected Collection</h2>
            <div className="text-5xl font-semibold tracking-tighter mb-6 text-white">
              $1,450<span className="text-white/40 text-3xl">.00</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 flex items-center gap-2 font-medium">
                <Plus className="w-4 h-4" /> New Loan
              </Button>
              <Button variant="outline" className="rounded-full px-6 border-white/10 text-white hover:bg-white/10 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Reports
              </Button>
            </div>
          </div>
        </section>

        {/* Today's Roster */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Roster</h3>
            <button className="text-sm text-white/50 hover:text-white transition">See All</button>
          </div>
          
          <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              {pendingInstallments.map((inst, i) => {
                const loan = MOCK_LOANS.find(l => l.id === inst.loanId);
                const customer = MOCK_CUSTOMERS.find(c => c.id === loan?.customerId);
                
                if (!customer) return null;
                
                return (
                  <Link key={inst.id} href={`/customers/${customer.id}`}>
                    <div className={`flex items-center justify-between p-4 px-6 hover:bg-white/5 transition cursor-pointer ${i !== pendingInstallments.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden relative">
                          {customer.avatarUrl ? (
                            <Image src={customer.avatarUrl} alt={customer.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50 font-semibold">
                              {customer.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{customer.name}</span>
                          <span className="text-xs text-white/50">Weekly Installment</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-red-400">-${inst.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>
      
      <BottomNav />
    </div>
  );
}
