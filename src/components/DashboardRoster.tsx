"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Search, CheckCircle2, ArrowRight, ChevronDown, Plus, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Installment, Loan, Customer } from "@/data/db";
import { markInstallmentPaid } from "@/app/actions";
import { formatLKR, phoneToDial } from "@/lib/format";
import { QuickPaymentModal } from "@/components/QuickPaymentModal";
import { SidePanel } from "@/components/SidePanel";

type DashboardRosterProps = {
  pendingInstallments: Installment[];
  loans: Loan[];
  customers: Customer[];
};

export function DashboardRoster({ pendingInstallments, loans, customers }: DashboardRosterProps) {
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(customers);
  const [localLoans, setLocalLoans] = useState<Loan[]>(loans);
  const [localInstallments, setLocalInstallments] = useState<Installment[]>(pendingInstallments);

  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPayment, setSelectedPayment] = useState<{
    customer: Customer;
    installmentId: string;
    expectedAmount: number;
  } | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [sidePanelCustomer, setSidePanelCustomer] = useState<Customer | null>(null);

  const loadFromCache = async () => {
    try {
      const { getCacheItem } = await import("@/lib/idb");
      const cachedCustomers = await getCacheItem<Customer[]>("customers");
      const cachedLoans = await getCacheItem<Loan[]>("loans");
      const cachedInstallments = await getCacheItem<Installment[]>("installments");

      if (cachedCustomers) setLocalCustomers(cachedCustomers);
      if (cachedLoans) setLocalLoans(cachedLoans);
      if (cachedInstallments) {
        const pending = cachedInstallments.filter(i => i.status === "PENDING" || i.status === "MISSED");
        setLocalInstallments(pending);
      }
    } catch (err) {
      console.error("Failed to load roster cache:", err);
    }
  };

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      loadFromCache();
    });

    const handleCacheUpdated = () => {
      loadFromCache();
    };
    window.addEventListener("local-cache-updated", handleCacheUpdated);
    return () => {
      cancelAnimationFrame(handle);
      window.removeEventListener("local-cache-updated", handleCacheUpdated);
    };
  }, []);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setLocalCustomers(customers);
      setLocalLoans(loans);
      setLocalInstallments(pendingInstallments);
    });
    return () => cancelAnimationFrame(handle);
  }, [customers, loans, pendingInstallments]);

  const villages = React.useMemo(() => Array.from(
    new Set(
      localCustomers
        .map(c => c.state)
        .filter((s): s is string => !!s && s.trim() !== "")
    )
  ).sort(), [localCustomers]);

  const filteredInstallments = React.useMemo(() => localInstallments.filter((inst) => {
    const loan = localLoans.find(l => l.id === inst.loanId);
    const customer = localCustomers.find(c => c.id === loan?.customerId);

    if (!customer) return false;

    const dueDateStr = new Date(inst.dueDate).toDateString();
    const todayStr = new Date().toDateString();
    const isTodayOrMissed = dueDateStr === todayStr || inst.status === "MISSED" || new Date(inst.dueDate) < new Date(todayStr);

    if (!isTodayOrMissed) return false;

    if (selectedVillage && customer.state !== selectedVillage) {
      return false;
    }

    if (searchQuery.trim() === "") return true;

    const query = searchQuery.toLowerCase();
    const nameMatch = customer.name.toLowerCase().includes(query);
    const idMatch = customer.memberId?.toLowerCase().includes(query) || customer.id.toLowerCase().includes(query);
    const stateMatch = customer.state?.toLowerCase().includes(query);

    return nameMatch || idMatch || stateMatch;
  }), [localInstallments, localLoans, localCustomers, selectedVillage, searchQuery]);

  const customerGroups = React.useMemo(() => filteredInstallments.reduce((acc, inst) => {
    const loan = localLoans.find(l => l.id === inst.loanId);
    const customer = localCustomers.find(c => c.id === loan?.customerId);

    if (!customer) return acc;

    const existingGroup = acc.find(g => g.customer.id === customer.id);
    const isOverdue = inst.status === "MISSED" || new Date(inst.dueDate) < new Date(new Date().toDateString());

    if (existingGroup) {
      existingGroup.installments.push(inst);
      existingGroup.totalAmount += inst.amount;
      if (isOverdue) {
        existingGroup.isOverdue = true;
      }
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
  }>), [filteredInstallments, localLoans, localCustomers]);

  const sortedCustomerGroups = React.useMemo(() => [...customerGroups].sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return new Date(a.oldestInstallment.dueDate).getTime() - new Date(b.oldestInstallment.dueDate).getTime();
  }), [customerGroups]);

  const handlePayClick = React.useCallback((e: React.MouseEvent, installmentId: string, customer: Customer, expectedAmount: number) => {
    e.preventDefault();
    setSelectedPayment({ customer, installmentId, expectedAmount });
  }, []);

  const handleConfirmPayment = (amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!selectedPayment) return resolve();

      startTransition(async () => {
        try {
          if (!navigator.onLine) {
            const queueStr = localStorage.getItem("offlineSyncQueue");
            const queue = queueStr ? JSON.parse(queueStr) : [];
            queue.push({
              type: "markInstallmentPaid",
              installmentId: selectedPayment.installmentId,
              amount: amount,
              timestamp: Date.now()
            });
            localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));
            resolve();
          } else {
            await markInstallmentPaid(selectedPayment.installmentId, amount);
            resolve();
          }
        } catch (err) {
          const error = err as Error;
          if (error?.message?.includes("fetch") || error?.message?.includes("network")) {
            const queueStr = localStorage.getItem("offlineSyncQueue");
            const queue = queueStr ? JSON.parse(queueStr) : [];
            queue.push({
              type: "markInstallmentPaid",
              installmentId: selectedPayment.installmentId,
              amount: amount,
              timestamp: Date.now()
            });
            localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));
            resolve();
          } else {
            reject(error);
          }
        }
      });
    });
  };

  return (
    <section className="flex flex-col h-full w-full max-w-full">

      {/* 1. SEARCH FIELD — Beautiful mobile-first */}
      <div className="relative w-full mb-5">
        {/* Glow effect */}
        <div className="absolute -inset-[1px] rounded-[1.75rem] bg-gradient-to-r from-primary/30 via-transparent to-primary/10 opacity-60 blur-[2px] pointer-events-none" />
        <div className="relative flex items-center bg-secondary/80 dark:bg-secondary/60 border border-border/60 backdrop-blur-sm rounded-[1.75rem] overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/20 transition-all focus-within:border-primary/40 focus-within:shadow-primary/10 focus-within:shadow-xl">
          {/* Icon left */}
          <div className="pl-4 pr-2 flex items-center shrink-0">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search today's clients..."
            className="flex-1 bg-transparent py-3.5 pr-3 text-[14px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {/* Clear button */}
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery("")}
              className="mr-2 w-7 h-7 rounded-full bg-border/60 hover:bg-border flex items-center justify-center transition-colors shrink-0"
            >
              <span className="text-muted-foreground text-xs font-bold leading-none">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3 mb-8 md:hidden">
        <Link
          href="/new"
          className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-[1.25rem] transition-all active:scale-[0.98] border border-border/40"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground leading-tight">Create<br />Account</span>
        </Link>
        <Link
          href="/villages"
          className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-[1.25rem] transition-all active:scale-[0.98] border border-border/40"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground leading-tight">Manage<br />Areas</span>
        </Link>
      </div>

      {/* 3. LIST HEADER & FILTER */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-[22px] font-black tracking-tight text-foreground">Today's Clients</h2>
          <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest shadow-sm">
            {sortedCustomerGroups.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {villages.length > 0 && (
            <div className="relative group">
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full bg-secondary/80 hover:bg-secondary border border-border/60 hover:border-border rounded-full pl-3 pr-8 py-1.5 text-[11px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-sm"
              >
                <option value="">🌍 All Areas</option>
                {villages.map(v => (
                  <option key={v} value={v}>📍 {v}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          <Link href="/customers" className="group flex items-center gap-1">
            <span className="text-[12px] font-bold text-muted-foreground group-hover:text-primary transition-colors">See all</span>
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
               <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. CUSTOMER GRID / TABLE */}
      <div className="w-full">
        {sortedCustomerGroups.length === 0 ? (
          <Card className="rounded-[1.5rem] border border-white/5 bg-card shadow-sm">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <h4 className="text-foreground font-semibold mb-1">No pending collections</h4>
              <p className="text-muted-foreground text-sm">You&apos;re all caught up for today.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* MOBILE VIEW: Cards Beautifully Redesigned */}
            <div className="flex md:hidden flex-col gap-4">
              {sortedCustomerGroups.map((group) => {
                const { customer, totalAmount, isOverdue } = group;
                return (
                  <Link key={customer.id} href={`/customers/${customer.id}`} className="block group outline-none">
                    <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2rem] p-5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Decorative Gradient Background */}
                      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none transition-opacity duration-500 ${isOverdue ? 'bg-destructive' : 'bg-primary group-hover:opacity-40'}`} />
                      
                      <div className="flex items-start gap-4 relative z-10">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-secondary to-secondary/50 p-[2px] shadow-sm">
                            <div className="w-full h-full rounded-[1.1rem] bg-card flex items-center justify-center overflow-hidden">
                              {customer.avatarUrl ? (
                                <img src={customer.avatarUrl} alt={customer.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className={`text-[16px] font-black tracking-widest ${isOverdue ? 'text-destructive' : 'text-primary'}`}>
                                  {customer.name.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          {isOverdue && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-card flex items-center justify-center shadow-sm animate-pulse">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                          <h3 className="text-[17px] font-black text-foreground tracking-tight truncate pr-4">
                            {customer.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {customer.state && (
                              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                {customer.state}
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                              isOverdue ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                              {isOverdue ? 'Overdue' : 'Due Today'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Amount & Action */}
                      <div className="flex items-end justify-between mt-5 pt-4 border-t border-border/40 relative z-10">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Amount Expected
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xs font-bold ${isOverdue ? 'text-destructive/70' : 'text-primary/70'}`}>Rs.</span>
                            <span className={`text-xl font-black tracking-tighter ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                              {Math.floor(totalAmount).toLocaleString("en-LK")}
                            </span>
                          </div>
                        </div>
                        
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOverdue 
                            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20' 
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 group-hover:scale-105'
                        }`}>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* DESKTOP VIEW: Data Table */}
            <div className="hidden md:block w-full overflow-x-auto rounded-[1.5rem] border border-border bg-card shadow-sm">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Customer</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Area</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Status</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground text-right">Expected</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedCustomerGroups.map((group) => {
                    const { customer, totalAmount, isOverdue } = group;
                    return (
                      <tr key={customer.id} className="group hover:bg-secondary transition-colors duration-200">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black tracking-widest shrink-0 ${
                              isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                            }`}>
                              {customer.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-[15px] text-foreground">{customer.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">{customer.state || "Unknown"}</span>
                        </td>
                        <td className="p-4">
                          {isOverdue ? (
                            <span className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest border border-destructive/20 shadow-sm animate-pulse">Overdue</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">Pending</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className={`text-[10px] font-bold ${isOverdue ? 'text-destructive' : 'text-primary'}`}>Rs.</span>
                            <span className={`text-[15px] font-black tracking-tight ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>{Math.floor(totalAmount).toLocaleString("en-LK")}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={(e) => { e.preventDefault(); setSidePanelCustomer(customer); }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors duration-200 shadow-sm group-hover:scale-110"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

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

      <SidePanel
        isOpen={!!sidePanelCustomer}
        onClose={() => setSidePanelCustomer(null)}
        customer={sidePanelCustomer}
        loans={localLoans}
        installments={localInstallments}
      />
    </section>
  );
}
