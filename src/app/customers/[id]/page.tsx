import Link from "next/link";
import { ChevronLeft, MapPin, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomerById, getLoansByCustomerId, getInstallmentsByLoanId, getCustomerNotes } from "@/data/db";
import { CustomerContactActions, CustomerPaymentActions } from "@/components/CustomerActions";
import { CustomerOperations } from "@/components/CustomerOperations";
import { formatLKR, formatLKRShort, formatLKRDecimal } from "@/lib/format";

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
        <header className="w-full flex items-center justify-between bg-card p-4 rounded-[1.75rem] border border-border shadow-sm relative overflow-hidden mb-2">
          <Link href="/customers">
            <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#1f1f21] transition-colors shadow-sm cursor-pointer relative z-10">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <span className="text-sm font-semibold tracking-tight text-foreground">Customer Profile</span>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <div className="max-w-md mx-auto w-full">
          <div className="flex flex-col items-center bg-white dark:bg-card border border-gray-200 dark:border-border rounded-[2rem] p-8 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-muted overflow-hidden relative mb-5 shadow-sm border border-gray-200 dark:border-border">
              <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground text-center">{customer.name}</h1>
            <span className="text-muted-foreground text-sm font-medium">ID: {customer.memberId || customer.id}</span>
            {customer.state && (
              <span className="mt-2 px-3 py-1 text-xs font-black bg-primary/10 dark:bg-white/10 text-primary dark:text-white/80 rounded-full flex items-center gap-1 select-none">
                📍 {customer.state}
              </span>
            )}
            
            <CustomerContactActions customer={customer} />

            <div className="mt-8 text-center text-gray-500 dark:text-white/50">
              No active or past loans found for this customer.
            </div>
          </div>
        </div>
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
      <header className="w-full flex items-center justify-between bg-card p-4 rounded-[1.75rem] border border-border shadow-sm relative overflow-hidden mb-2">
        <Link href="/">
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#1f1f21] transition-colors shadow-sm cursor-pointer relative z-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-sm font-semibold tracking-tight text-foreground">Customer Profile</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="md:col-span-5 flex flex-col gap-4">
          
          {/* Profile Card */}
          <div className="flex flex-col items-center bg-white dark:bg-card border border-gray-200 dark:border-border rounded-[2rem] p-8 shadow-sm relative">
            
            <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black border border-primary/20">
              <TrendingUp className="w-3.5 h-3.5" />
              {reliabilityScore}
            </div>

            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-muted overflow-hidden relative mb-5 shadow-sm border border-gray-200 dark:border-border">
              <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground text-center">{customer.name}</h1>
            <span className="text-muted-foreground text-sm font-medium">ID: {customer.memberId || customer.id}</span>
            {customer.state && (
              <span className="mt-2 px-3 py-1 text-xs font-black bg-primary/10 dark:bg-white/10 text-primary dark:text-white/80 rounded-full flex items-center gap-1 select-none">
                📍 {customer.state}
              </span>
            )}
            
            <CustomerContactActions customer={customer} />

            <div className="mt-8 text-center w-full">
              <span className="text-muted-foreground text-sm font-medium">Remaining Balance</span>
              <div className="text-5xl font-bold tracking-tighter mt-1 text-foreground">
                Rs. {formatLKRShort(loan.remainingBalance)}<span className="text-muted-foreground text-3xl">.{formatLKRDecimal(loan.remainingBalance)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-8">
              <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
                <span>{paidCount} of {installments.length} Paid</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex mt-8 w-full">
              <CustomerPaymentActions customer={customer} loan={loan} nextInstallment={nextInstallment} />
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

        {/* Right Column */}
        <div className="md:col-span-7 flex flex-col gap-8">
          
          {/* Details List */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-foreground tracking-tight">Loan Details</h3>
            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Total Amount</span>
                  <span className="font-medium text-foreground">{formatLKR(loan.principalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Weekly Installment</span>
                  <span className="font-medium text-foreground">{formatLKR(loan.weeklyInstallment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <span className="font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5 uppercase tracking-wide">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {loan.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Installments Timeline */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-foreground tracking-tight">Timeline</h3>
            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm p-2">
              <CardContent className="p-0 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[39px] top-8 bottom-8 w-px bg-gray-200 dark:bg-border" />

                <div className="flex flex-col">
                  {installments.map((inst, i) => {
                    const isOverdue = inst.status === "MISSED" || (inst.status === "PENDING" && new Date(inst.dueDate) < new Date());
                    
                    return (
                      <div key={inst.id} className={`flex items-center justify-between p-4 relative hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors rounded-xl ${i === 0 ? 'mt-2' : ''} ${i === installments.length - 1 ? 'mb-2' : ''}`}>
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card rounded-full">
                            {inst.status === "PAID" ? (
                              <CheckCircle2 className="w-6 h-6 text-primary" />
                            ) : isOverdue ? (
                              <AlertCircle className="w-6 h-6 text-destructive-foreground" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-border bg-white dark:bg-card" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-medium text-sm ${isOverdue ? 'text-destructive-foreground' : 'text-foreground'}`}>Week {i + 1}</span>
                            <span className="text-xs text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className={`font-medium text-sm ${isOverdue ? 'text-destructive-foreground' : 'text-foreground'}`}>
                            {formatLKR(inst.amount)}
                          </span>
                          {inst.paidDate && (
                            <span className="text-xs text-muted-foreground">Paid {new Date(inst.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Customer Operations (Notes, restructuring, holidays) */}
          <CustomerOperations customer={customer} loan={loan} notes={notes} />
        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-transparent z-50">
        <div className="bg-card p-2 rounded-2xl border border-border shadow-2xl backdrop-blur-xl">
          <CustomerPaymentActions customer={customer} loan={loan} nextInstallment={nextInstallment} />
        </div>
      </div>

    </div>
  );
}
