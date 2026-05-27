import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MapPin, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CUSTOMERS, MOCK_INSTALLMENTS, MOCK_LOANS } from "@/data/mock";

// Update the parameter type to reflect what Next.js 15 actually provides:
type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetails({ params }: Props) {
  const resolvedParams = await params;
  const customerId = resolvedParams.id;
  const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
  const loan = MOCK_LOANS.find(l => l.customerId === customerId);
  
  if (!customer || !loan) {
    return <div className="p-8 text-center text-white/50">Customer or Loan not found</div>;
  }

  const installments = MOCK_INSTALLMENTS.filter(i => i.loanId === loan.id).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between mb-2">
        <Link href="/">
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-white/70 font-medium">Customer Details</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="flex flex-col items-center bg-white border border-white/10 rounded-[2.5rem] p-8 text-black shadow-xl relative overflow-hidden">
            {/* Subtle inner shadow/gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
            
            <div className="w-20 h-20 rounded-full bg-black/10 overflow-hidden relative mb-4 border-4 border-white shadow-sm">
              {customer.avatarUrl ? (
                <Image src={customer.avatarUrl} alt={customer.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/50 font-bold text-xl">
                  {customer.name.charAt(0)}
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-1">{customer.name}</h1>
            <span className="text-black/60 text-sm font-medium">{customer.phone}</span>
            
            <div className="mt-8 text-center">
              <span className="text-black/60 text-sm font-medium">Remaining Balance</span>
              <div className="text-5xl font-bold tracking-tighter mt-1 text-black">
                ${Math.floor(loan.remainingBalance)}<span className="text-black/40 text-3xl">.{(loan.remainingBalance % 1).toFixed(2).substring(2)}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-8 w-full">
              <Button className="flex-1 bg-black text-white hover:bg-black/80 rounded-full shadow-lg">
                Mark Paid
              </Button>
              <Button variant="outline" className="flex-1 border-black/10 rounded-full hover:bg-black/5 text-black">
                Edit Loan
              </Button>
            </div>
          </div>

          {/* Map/Address placeholder */}
          {customer.address && (
            <section className="mt-2">
              <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <div className="h-32 bg-white/5 w-full relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Staten+Island,NY&zoom=13&size=600x300&maptype=roadmap&style=element:geometry%7Ccolor:0x242f3e&style=element:labels.text.stroke%7Ccolor:0x242f3e&style=element:labels.text.fill%7Ccolor:0x746855&client=gme-dummy')] bg-cover opacity-30 mix-blend-luminosity" />
                    <MapPin className="w-8 h-8 text-red-500 relative z-10" />
                  </div>
                  <div className="p-4 px-6 text-sm text-white/70 flex items-center gap-3">
                    <span className="truncate">{customer.address}</span>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Details List */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-white">Loan Details</h3>
            <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Total Loan Amount</span>
                  <span className="font-medium text-white">${loan.principalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Weekly Installment</span>
                  <span className="font-medium text-white">${loan.weeklyInstallment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Status</span>
                  <span className="font-medium text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-sm">
                    {loan.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Installments Timeline */}
          <section className="mt-4 md:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-white">Installment Timeline</h3>
            <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                {installments.map((inst, i) => (
                  <div key={inst.id} className={`flex items-center justify-between p-4 px-6 hover:bg-white/5 transition ${i !== installments.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className="flex items-center gap-4">
                      {inst.status === "PAID" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : inst.status === "MISSED" ? (
                        <Circle className="w-6 h-6 text-red-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-white/20" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-white">Week {i + 1}</span>
                        <span className="text-xs text-white/50">{new Date(inst.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-medium ${inst.status === 'PAID' ? 'text-green-400' : 'text-white'}`}>
                        ${inst.amount.toFixed(2)}
                      </span>
                      {inst.paidDate && (
                        <span className="text-xs text-white/40">Paid {new Date(inst.paidDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
