import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MapPin, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CUSTOMERS, MOCK_INSTALLMENTS, MOCK_LOANS } from "@/data/mock";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetails({ params }: Props) {
  const resolvedParams = await params;
  const customerId = resolvedParams.id;
  const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
  const loan = MOCK_LOANS.find(l => l.customerId === customerId);
  
  if (!customer || !loan) {
    return <div className="p-12 text-center text-white/50">Customer or Loan not found</div>;
  }

  const installments = MOCK_INSTALLMENTS.filter(i => i.loanId === loan.id).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  const paidCount = installments.filter(i => i.status === "PAID").length;
  const progressPercent = Math.round((paidCount / installments.length) * 100) || 0;

  return (
    <div className="flex flex-col gap-8 pb-32 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-2">
        <Link href="/">
          <button className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-[#222] flex items-center justify-center text-white hover:bg-[#111] transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-white/70 font-medium tracking-tight">Customer Profile</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="md:col-span-5 flex flex-col gap-4">
          
          {/* Profile Card */}
          <div className="flex flex-col items-center bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 shadow-sm">
            
            <div className="w-24 h-24 rounded-full bg-[#111] overflow-hidden relative mb-5 shadow-sm border border-[#222]">
              {customer.avatarUrl ? (
                <Image src={customer.avatarUrl} alt={customer.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 font-bold text-2xl">
                  {customer.name.charAt(0)}
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-white">{customer.name}</h1>
            <span className="text-white/50 text-sm font-medium">{customer.phone} • ID: {customer.memberId || customer.id}</span>
            
            <div className="mt-8 text-center w-full">
              <span className="text-white/50 text-sm font-medium">Remaining Balance</span>
              <div className="text-5xl font-bold tracking-tighter mt-1 text-white">
                ${Math.floor(loan.remainingBalance)}<span className="text-white/40 text-3xl">.{(loan.remainingBalance % 1).toFixed(2).substring(2)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-8">
              <div className="flex justify-between text-xs font-medium text-white/50 mb-2">
                <span>{paidCount} of {installments.length} Paid</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Desktop Actions (Hidden on Mobile, replaced by sticky bar) */}
            <div className="hidden md:flex gap-3 mt-8 w-full">
              <Button className="flex-1 bg-white text-black hover:bg-white/90 rounded-xl font-medium h-12 shadow-sm">
                Mark Paid
              </Button>
              <Button variant="outline" className="flex-1 border-[#222] bg-[#0a0a0a] rounded-xl hover:bg-[#111] text-white h-12 shadow-sm">
                Edit
              </Button>
            </div>
          </div>

          {/* Map/Address */}
          {customer.address && (
            <Card className="bg-[#0a0a0a] border-[#222] rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="h-24 bg-[#111] w-full relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay" />
                  <MapPin className="w-6 h-6 text-white/30 relative z-10" />
                </div>
                <div className="p-4 px-5 text-sm text-white/70 flex items-center gap-3">
                  <span className="truncate">{customer.address}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 flex flex-col gap-8">
          
          {/* Details List */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-white tracking-tight">Loan Details</h3>
            <Card className="bg-[#0a0a0a] border-[#222] rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Total Amount</span>
                  <span className="font-medium text-white">${loan.principalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Weekly Installment</span>
                  <span className="font-medium text-white">${loan.weeklyInstallment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Status</span>
                  <span className="font-medium text-green-400 text-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    {loan.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Installments Timeline */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-white tracking-tight">Timeline</h3>
            <Card className="bg-[#0a0a0a] border-[#222] rounded-2xl overflow-hidden shadow-sm p-2">
              <CardContent className="p-0 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[39px] top-8 bottom-8 w-px bg-[#222]" />

                <div className="flex flex-col">
                  {installments.map((inst, i) => {
                    const isOverdue = inst.status === "MISSED" || (inst.status === "PENDING" && new Date(inst.dueDate) < new Date());
                    
                    return (
                      <div key={inst.id} className={`flex items-center justify-between p-4 relative hover:bg-[#111] transition-colors rounded-xl ${i === 0 ? 'mt-2' : ''} ${i === installments.length - 1 ? 'mb-2' : ''}`}>
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 flex items-center justify-center bg-[#0a0a0a] rounded-full">
                            {inst.status === "PAID" ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : isOverdue ? (
                              <AlertCircle className="w-6 h-6 text-red-400" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-[#444] bg-[#0a0a0a]" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-medium text-sm ${isOverdue ? 'text-red-400' : 'text-white'}`}>Week {i + 1}</span>
                            <span className="text-xs text-white/40">{new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className={`font-medium text-sm ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                            ${inst.amount.toFixed(2)}
                          </span>
                          {inst.paidDate && (
                            <span className="text-xs text-white/40">Paid {new Date(inst.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent z-50">
        <div className="flex gap-3 bg-[#111] p-2 rounded-2xl border border-[#222] shadow-2xl backdrop-blur-xl">
          <Button className="flex-1 bg-white text-black hover:bg-white/90 rounded-xl font-medium h-14">
            Mark Paid
          </Button>
          <Button variant="outline" className="flex-1 border-[#222] bg-transparent rounded-xl hover:bg-[#222] text-white h-14">
            Edit
          </Button>
        </div>
      </div>

    </div>
  );
}
