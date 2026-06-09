import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, MapPin, CheckCircle2, Circle, AlertCircle, TrendingUp, ChevronDown, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomerById, getLoansByCustomerId, getInstallmentsByLoanId, getCustomerNotes } from "@/data/db";
import { CustomerContactActions, CustomerPaymentActions } from "@/components/CustomerActions";
import { CustomerTabs } from "@/components/CustomerTabs";
import { TopBar } from "@/components/TopBar";
import { formatLKR, formatLKRShort, formatLKRDecimal } from "@/lib/format";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetails({ params }: Props) {
  const resolvedParams = await params;
  const customerId = resolvedParams.id;
  const customer = await getCustomerById(customerId);

  if (!customer) {
    return <div className="p-12 text-center text-gray-500 dark:text-white/50">Customer not found</div>;
  }

  const customerLoans = await getLoansByCustomerId(customerId);
  const loan = customerLoans.find(l => l.status === "ACTIVE") || customerLoans[0];

  if (!loan) {
    return (
      <div className="flex flex-col gap-8 pb-32 md:pb-12 max-w-5xl mx-auto">
        {/* Header */}
        <TopBar title="Customer Profile" backHref="/customers" />

        <div className="max-w-md mx-auto w-full">
          <div className="flex flex-col items-center bg-white dark:bg-card border border-gray-200 dark:border-border rounded-[2rem] p-8 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-muted overflow-hidden relative mb-5 shadow-sm border border-gray-200 dark:border-border">
              <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground text-center">{customer.name}</h1>
            <span className="text-muted-foreground text-sm font-medium">ID: {customer.memberId || customer.id}</span>
            {customer.companyName && (
              <span className="text-primary font-bold text-sm mt-1">{customer.companyName}</span>
            )}
            {customer.state && (
              <span className="mt-2 px-3 py-1 text-xs font-black bg-primary/10 dark:bg-white/10 text-primary dark:text-white/80 rounded-full flex items-center gap-1 select-none">
                📍 {customer.state}
              </span>
            )}

            <CustomerContactActions customer={customer} />

            <div className="mt-8 text-center text-gray-500 dark:text-white/50">
              No active or past loans found for this customer.
            </div>

            <Link href={`/new?customer=${customerId}`} className="w-full">
              <button className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                Create New Loan
              </button>
            </Link>
          </div>
        </div>
        <BottomNav hideOnMobile />
      </div>
    );
  }

  const installments = await getInstallmentsByLoanId(loan.id);
  const notes = await getCustomerNotes(customerId);

  const paidCount = installments.filter(i => i.status === "PAID").length;
  const progressPercent = Math.round((paidCount / installments.length) * 100) || 0;

  // Calculate reliability score: Paid on-time vs late/missed (simplified for mock data)
  // Assume if it's PAID, it's reliable.
  const reliabilityScore = paidCount > 0 ? 95 : 100; // Mock score

  // Find next pending installment
  const nextInstallment = installments.find(i => i.status !== "PAID");

  return (
    <div className="flex flex-col gap-8 pb-32 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <TopBar title="Customer Profile" backHref="/" />

      {/* Celebration Banner for Paid Off Loans */}
      {loan.status === "PAID_OFF" && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-5 rounded-[1.75rem] shadow-sm flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <PartyPopper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight mb-0.5">Loan Fully Settled!</h3>
            <p className="text-sm font-medium opacity-90">Great collection work. This customer has completely paid off their loan balance.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="md:col-span-5 flex flex-col gap-4">

          {/* Profile Card */}
          <div className="flex flex-col bg-card/80 backdrop-blur-2xl border border-border/40 rounded-[2.5rem] overflow-hidden shadow-xl shadow-foreground/5 relative">
            
            {/* Top Pattern / Gradient Background */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent z-0" />

            <div className="p-8 pb-10 relative z-10 flex flex-col items-center">
              
              {/* Reliability Score */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-foreground text-xs font-black border border-border shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                {reliabilityScore}
              </div>

              <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden relative mb-4 shadow-xl shadow-black/5 border-4 border-background">
                <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
              </div>

              <h1 className="text-2xl font-black tracking-tight mb-1 text-foreground text-center leading-tight">{customer.name}</h1>
              
              <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                <span className="text-muted-foreground text-xs font-bold bg-secondary/80 px-2.5 py-1 rounded-md">
                  ID: {customer.memberId || customer.id}
                </span>
                {customer.state && (
                  <span className="px-2.5 py-1 text-xs font-bold bg-primary/10 text-primary rounded-md flex items-center gap-1">
                    📍 {customer.state}
                  </span>
                )}
              </div>
              
              {customer.companyName && (
                <span className="text-foreground font-black text-sm mb-2">{customer.companyName}</span>
              )}

              <CustomerContactActions customer={customer} />

              {/* Outstanding Balance Banner */}
              <div className="mt-8 w-full bg-gradient-to-br from-secondary/50 to-secondary/10 rounded-3xl p-6 border border-border/50 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest relative z-10">Total Outstanding</span>
                <div className="text-5xl font-black tracking-tighter mt-1 text-foreground flex items-baseline gap-1 relative z-10">
                  <span className="text-xl text-muted-foreground font-bold">Rs.</span>
                  {formatLKRShort(loan.remainingBalance)}
                  <span className="text-muted-foreground text-2xl font-bold opacity-60">.{formatLKRDecimal(loan.remainingBalance)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full mt-6 bg-secondary/30 p-5 rounded-3xl border border-border/40">
                <div className="flex items-end justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2.5">
                  <span className="text-foreground/80">Repayment Progress</span>
                  <span className="text-primary text-sm">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-foreground/5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between mt-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>{paidCount} Paid</span>
                  <span>{installments.length} Total</span>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex mt-6 w-full">
                <CustomerPaymentActions customer={customer} loan={loan} nextInstallment={nextInstallment} />
              </div>
            </div>
          </div>

          {/* Map/Address */}
          {(customer.state || customer.address) && (
            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="h-24 bg-secondary w-full relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-primary/20 mix-blend-overlay" />
                  <MapPin className="w-6 h-6 text-muted-foreground relative z-10" />
                </div>
                <div className="p-4 px-5 text-sm text-gray-600 dark:text-white/70 flex items-center gap-3">
                  <span className="truncate">
                    {customer.state && <strong className="font-extrabold text-foreground mr-1">{customer.state}</strong>}
                    {customer.state && customer.address && " • "}
                    {customer.address}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Dynamic Tabs */}
        <div className="md:col-span-7 flex flex-col gap-6 w-full">
          <CustomerTabs 
            loan={loan} 
            installments={installments} 
            customer={customer} 
            notes={notes} 
            paidCount={paidCount} 
            nextInstallment={nextInstallment} 
          />
        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent z-50 pb-6">
        <div className="bg-card/95 p-3 rounded-[2rem] border border-border/60 shadow-2xl backdrop-blur-2xl">
          <CustomerPaymentActions customer={customer} loan={loan} nextInstallment={nextInstallment} />
        </div>
      </div>

      <BottomNav hideOnMobile />
    </div>
  );
}
