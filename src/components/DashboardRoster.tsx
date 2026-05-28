"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
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

  return (
    <section className="flex flex-col h-full w-full max-w-full">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold tracking-tight text-black dark:text-white truncate">Due Today</h2>
        <Link href="/customers" className="shrink-0">
          <Button variant="ghost" className="text-gray-500 hover:text-black dark:text-white/50 dark:hover:text-white group text-sm h-8 px-2 sm:px-4">
            See all
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 dark:text-white/40" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Name or Member ID..."
          className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl pl-11 pr-4 py-3.5 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition"
        />
      </div>
      
      <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {sortedCustomerGroups.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-gray-300 dark:text-white/30" />
              </div>
              <h4 className="text-black dark:text-white font-medium mb-1">No pending collections</h4>
              <p className="text-gray-500 dark:text-white/40 text-sm">You're all caught up for the day.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#222]">
              {sortedCustomerGroups.map((group) => {
                const { customer, installments, totalAmount, isOverdue, oldestInstallment } = group;
                
                return (
                  <Link key={customer.id} href={`/customers/${customer.id}`} className="block hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                    <div className="flex items-center justify-between p-2.5 sm:p-4 px-2 sm:px-5 gap-2">
                      
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#222] overflow-hidden relative shrink-0">
                          <Image src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 w-full flex-wrap">
                            <span className="font-medium text-black dark:text-white text-sm break-words">{customer.name}</span>
                            {isOverdue && (
                              <span className="flex shrink-0 items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Overdue
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-white/40 mt-0.5 break-words">
                            ID: {customer.memberId || customer.id.slice(0, 8)} • {installments.length > 1 ? `${installments.length} weeks due (oldest: ${oldestInstallment.dueDate})` : `Due ${oldestInstallment.dueDate}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="flex flex-col items-end">
                          <span className={`font-medium text-sm ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                            ${totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          onClick={(e) => handlePayClick(e, oldestInstallment.id, customer, oldestInstallment.amount)}
                          disabled={isPending}
                          className="h-8 px-3.5 text-xs font-medium bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg shadow-sm shrink-0"
                        >
                          Pay
                        </Button>
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
