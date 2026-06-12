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
      <div className="flex flex-col gap-8 pb-28 md:pb-12 max-w-5xl mx-auto">
        {/* Header */}
        <TopBar title="Customer Profile" backHref="/customers" />

        <div className="max-w-md mx-auto w-full">
          <div className="flex flex-col items-center bg-white dark:bg-card border border-gray-200 dark:border-border rounded-[2rem] p-8 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-muted overflow-hidden relative mb-5 shadow-sm border border-gray-200 dark:border-border">
              <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground text-center">{customer.name}</h1>
            <div className="flex flex-col items-center gap-1 mb-2 text-sm font-medium text-muted-foreground">
              <span>ID: {customer.memberId || customer.id.slice(0,8)}</span>
              {customer.idNumber && (
                <span>NIC: {customer.idNumber}</span>
              )}
            </div>
            {customer.companyName && (
              <span className="text-primary font-bold text-sm mt-1">{customer.companyName}</span>
            )}
            {customer.state && (
              <span className="mt-2 px-3 py-1 text-xs font-black bg-primary/10 dark:bg-white/10 text-primary dark:text-white/80 rounded-full flex items-center gap-1 select-none">
                {customer.state}
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
  const nextInstallmentIndex = installments.findIndex(i => i.status !== "PAID");
  const nextInstallment = nextInstallmentIndex !== -1 ? installments[nextInstallmentIndex] : undefined;

  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-12 max-w-5xl mx-auto px-4 sm:px-6">
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

      <div className="grid lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Column - Hero Profile */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Profile Card */}
          <div className="flex flex-col bg-card rounded-[2rem] shadow-sm border border-border/40 relative overflow-hidden">
            <Link href={`/customers/${customerId}/edit`} className="absolute top-4 right-4 z-20">
              <button className="p-2 bg-secondary/50 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
              </button>
            </Link>

            <div className="p-8 relative z-10 flex flex-col items-center">
              
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden relative mb-4 shadow-sm border-2 border-background">
                <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-primary border-2 border-background rounded-full" />
              </div>

              <h1 className="text-2xl font-black tracking-tight mb-1 text-foreground text-center leading-tight line-clamp-2">{customer.name}</h1>
              
              <div className="flex flex-col items-center gap-1 mb-4 text-xs font-semibold text-muted-foreground text-center">
                <span>ID: {customer.memberId || customer.id.slice(0,8)}</span>
                {customer.idNumber && (
                  <span className="flex items-center gap-1">
                    NIC: {customer.idNumber}
                  </span>
                )}
                {customer.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {customer.state}
                  </span>
                )}
              </div>
              
              {customer.companyName && (
                <span className="text-primary font-bold text-xs mb-4 bg-primary/10 px-3 py-1 rounded-full text-center line-clamp-1">{customer.companyName}</span>
              )}

              <CustomerContactActions customer={customer} />

              <div className="w-full h-px bg-border/40 my-6" />

              {/* Outstanding Balance Banner */}
              <div className="w-full flex flex-col items-center text-center">
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Remaining Balance</span>
                <div className="text-4xl font-black tracking-tighter text-foreground flex items-baseline justify-center">
                  <span className="text-xl text-muted-foreground font-bold mr-1">Rs.</span>
                  <span className="truncate max-w-[200px]">{formatLKRShort(loan.remainingBalance)}</span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full mt-6">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-2">
                  <span>{paidCount} of {installments.length} Paid</span>
                  <span className="text-primary">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:flex mt-8 w-full justify-center">
                <CustomerPaymentActions customer={customer} loan={loan} nextInstallment={nextInstallment} nextInstallmentIndex={nextInstallmentIndex !== -1 ? nextInstallmentIndex + 1 : undefined} />
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
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          <CustomerTabs 
            loan={loan} 
            allLoans={customerLoans}
            installments={installments} 
            customer={customer} 
            notes={notes} 
            paidCount={paidCount} 
            nextInstallment={nextInstallment} 
          />
        </div>
      </div>

      {/* Floating Mobile Action Button */}
      <div className="lg:hidden fixed bottom-24 right-4 z-50 animate-in slide-in-from-bottom-5 duration-500 fade-in">
        <CustomerPaymentActions customer={customer} loan={loan} nextInstallment={nextInstallment} nextInstallmentIndex={nextInstallmentIndex !== -1 ? nextInstallmentIndex + 1 : undefined} isFloating={true} />
      </div>

      <BottomNav hideOnMobile />
    </div>
  );
}
