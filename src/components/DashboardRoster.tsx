"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, AlertCircle, CheckCircle2, ArrowRight, MessageCircle, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Installment, Loan, Customer } from "@/data/db";
import { markInstallmentPaid } from "@/app/actions";
import { QuickPaymentModal } from "@/components/QuickPaymentModal";

type DashboardRosterProps = {
  pendingInstallments: Installment[];
  loans: Loan[];
  customers: Customer[];
};

export function DashboardRoster({ pendingInstallments, loans, customers }: DashboardRosterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPayment, setSelectedPayment] = useState<{
    customer: Customer;
    installmentId: string;
    expectedAmount: number;
  } | null>(null);

  const filteredInstallments = pendingInstallments.filter((inst) => {
    const loan = loans.find(l => l.id === inst.loanId);
    const customer = customers.find(c => c.id === loan?.customerId);
    
    if (!customer) return false;
    
    if (searchQuery.trim() === "") return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = customer.name.toLowerCase().includes(query);
    const idMatch = customer.memberId?.toLowerCase().includes(query) || customer.id.toLowerCase().includes(query);
    
    return nameMatch || idMatch;
  });

  // Group the filtered installments by customer
  const customerGroups = filteredInstallments.reduce((acc, inst) => {
    const loan = loans.find(l => l.id === inst.loanId);
    const customer = customers.find(c => c.id === loan?.customerId);
    
    if (!customer) return acc;
    
    const existingGroup = acc.find(g => g.customer.id === customer.id);
    const isOverdue = inst.status === "MISSED" || new Date(inst.dueDate) < new Date(new Date().toDateString());
    
    if (existingGroup) {
      existingGroup.installments.push(inst);
      existingGroup.totalAmount += inst.amount;
      if (isOverdue) {
        existingGroup.isOverdue = true;
      }
      // Keep oldest installment
      if (new Date(inst.dueDate) < new Date(existingGroup.oldestInstallment.dueDate)) {
        existingGroup.oldestInstallment = inst;
      }
    } else {
      acc.push({
        customer,
        installments: [inst],
        totalAmount: inst.amount,
        isOverdue,
        oldestInstallment: inst
      });
    }
    
    return acc;
  }, [] as Array<{
    customer: Customer;
    installments: Installment[];
    totalAmount: number;
    isOverdue: boolean;
    oldestInstallment: Installment;
  }>);

  // Sort customer groups: overdue first, then by oldest installment date ascending
  const sortedCustomerGroups = [...customerGroups].sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return new Date(a.oldestInstallment.dueDate).getTime() - new Date(b.oldestInstallment.dueDate).getTime();
  });

  const handlePayClick = (e: React.MouseEvent, installmentId: string, customer: Customer, expectedAmount: number) => {
    e.preventDefault(); // Prevent navigating to customer details
    setSelectedPayment({ customer, installmentId, expectedAmount });
  };

  const handleConfirmPayment = (amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!selectedPayment) return resolve();
      
      startTransition(async () => {
        try {
          if (!navigator.onLine) {
            // Queue offline
            const queueStr = localStorage.getItem("offlineSyncQueue");
            const queue = queueStr ? JSON.parse(queueStr) : [];
            queue.push({
              type: "markInstallmentPaid",
              installmentId: selectedPayment.installmentId,
              timestamp: Date.now()
            });
            localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));
            resolve();
          } else {
            await markInstallmentPaid(selectedPayment.installmentId);
            resolve();
          }
        } catch (err: any) {
          if (err?.message?.includes("fetch") || err?.message?.includes("network")) {
            const queueStr = localStorage.getItem("offlineSyncQueue");
            const queue = queueStr ? JSON.parse(queueStr) : [];
            queue.push({
              type: "markInstallmentPaid",
              installmentId: selectedPayment.installmentId,
              timestamp: Date.now()
            });
            localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));
            resolve();
          } else {
            reject(err);
          }
        }
      });
    });
  };

  const handleWhatsAppReminder = (e: React.MouseEvent, customer: Customer, amount: number) => {
    e.preventDefault();
    e.stopPropagation();
    const loan = loans.find(l => l.customerId === customer.id && l.status === 'ACTIVE');
    const remaining = loan ? loan.remainingBalance : amount;
    const phone = customer.phone.replace(/[^0-9]/g, '');
    const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
    const text = `${greeting} ${customer.name}, this is a friendly reminder from LoanTrack Pro that your weekly installment of $${amount.toFixed(2)} is due today. Your remaining balance is $${remaining.toFixed(2)}. Please coordinate with your collection agent. Thank you!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSmsReminder = (e: React.MouseEvent, customer: Customer, amount: number) => {
    e.preventDefault();
    e.stopPropagation();
    const loan = loans.find(l => l.customerId === customer.id && l.status === 'ACTIVE');
    const remaining = loan ? loan.remainingBalance : amount;
    const phone = customer.phone.replace(/[^0-9]/g, '');
    const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
    const text = `${greeting} ${customer.name}, this is a friendly reminder from LoanTrack Pro that your weekly installment of $${amount.toFixed(2)} is due today. Your remaining balance is $${remaining.toFixed(2)}. Please coordinate with your collection agent. Thank you!`;
    window.open(`sms:${phone}?body=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className="flex flex-col h-full w-full max-w-full">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground truncate">Due Today</h2>
        <Link href="/customers" className="shrink-0">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground group text-sm h-8 px-2 sm:px-4">
            See all
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or member ID…"
          className="w-full bg-secondary border border-border focus:border-ring/40 rounded-2xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
        />
      </div>
      
      <Card className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        <CardContent className="p-0">
          {sortedCustomerGroups.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <h4 className="text-foreground font-semibold mb-1">No pending collections</h4>
              <p className="text-muted-foreground text-sm">You're all caught up for the day.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedCustomerGroups.map((group) => {
                const { customer, installments, totalAmount, isOverdue, oldestInstallment } = group;
                
                return (
                  <Link key={customer.id} href={`/customers/${customer.id}`} className="block hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between p-3 sm:p-4 gap-2">
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-secondary border border-border overflow-hidden relative shrink-0">
                          <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0 w-full flex-wrap">
                            <span className="font-semibold text-foreground text-sm break-words">{customer.name}</span>
                            {isOverdue && (
                              <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white bg-[#e05470] px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-2.5 h-2.5" /> Overdue
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5 break-words">
                            {customer.memberId || customer.id.slice(0, 8)} · {installments.length > 1 ? `${installments.length} installments` : `Due ${oldestInstallment.dueDate}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-bold text-sm ${isOverdue ? 'text-[#e05470]' : 'text-foreground'}`}>
                          ${totalAmount.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleWhatsAppReminder(e, customer, totalAmount)}
                            title="WhatsApp"
                            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c6dbf]/10 hover:bg-[#7c6dbf]/20 text-[#7c6dbf] border border-[#7c6dbf]/20 transition-all active:scale-95 shrink-0 cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleSmsReminder(e, customer, totalAmount)}
                            title="SMS"
                            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl bg-[#6ab4e8]/10 hover:bg-[#6ab4e8]/20 text-[#6ab4e8] border border-[#6ab4e8]/20 transition-all active:scale-95 shrink-0 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <Button 
                            onClick={(e) => handlePayClick(e, oldestInstallment.id, customer, oldestInstallment.amount)}
                            disabled={isPending}
                            className="h-8 px-3 text-xs font-bold bg-[#7c6dbf] hover:bg-[#6a5caa] text-white rounded-xl shrink-0 border-none cursor-pointer shadow-md shadow-[#7c6dbf]/20"
                          >
                            Pay
                          </Button>
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPayment && (
        <QuickPaymentModal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          customer={selectedPayment.customer}
          expectedAmount={selectedPayment.expectedAmount}
          installmentId={selectedPayment.installmentId}
          onConfirm={handleConfirmPayment}
        />
      )}
    </section>
  );
}
