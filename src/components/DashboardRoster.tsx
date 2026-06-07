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
            placeholder="Search customer, ID or area..."
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
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/new"
          className="flex items-center gap-3 p-4 bg-[#2c2c2e] hover:bg-[#3c3c3e] rounded-[1.25rem] transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white leading-tight">Create<br />Account</span>
        </Link>
        <Link
          href="/villages"
          className="flex items-center gap-3 p-4 bg-[#2c2c2e] hover:bg-[#3c3c3e] rounded-[1.25rem] transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white leading-tight">Manage<br />Areas</span>
        </Link>
      </div>

      {/* 3. LIST HEADER & FILTER */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground truncate">Due Today</h2>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/customers" className="shrink-0">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground group text-sm h-8 px-2 sm:px-3">
              See all
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          {villages.length > 0 && (
            <div className="relative min-w-[140px] shrink-0">
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full bg-secondary border border-border focus:border-ring/40 rounded-2xl pl-3 pr-8 py-2 text-sm text-foreground focus:outline-none transition-all appearance-none font-medium cursor-pointer"
              >
                <option value="">All Areas</option>
                {villages.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. CUSTOMER LIST */}
      <Card className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        <CardContent className="p-0">
          {sortedCustomerGroups.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <h4 className="text-foreground font-semibold mb-1">No pending collections</h4>
              <p className="text-muted-foreground text-sm">You&apos;re all caught up for the day.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {sortedCustomerGroups.map((group) => {
                const { customer, installments, totalAmount, isOverdue, oldestInstallment } = group;
                return (
                  <Link key={customer.id} href={`/customers/${customer.id}`} className="block hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between p-3 sm:p-4 gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-secondary border border-border overflow-hidden relative shrink-0">
                          <img
                            src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`}
                            alt={customer.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0 w-full flex-wrap">
                            <span className="font-semibold text-foreground text-sm break-words">{customer.name}</span>
                            {isOverdue && (
                              <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-destructive px-1.5 py-0.5 rounded-sm bg-destructive/10">
                                Overdue
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="shrink-0 font-mono">{customer.memberId || customer.id.slice(0, 8)}</span>
                            {customer.state && (
                              <>
                                <span className="shrink-0">•</span>
                                <span className="shrink-0 text-primary font-semibold uppercase text-[10px] bg-primary/10 px-1 py-0.5 rounded">
                                  📍 {customer.state}
                                </span>
                              </>
                            )}
                            <span className="shrink-0">•</span>
                            <span className="shrink-0">
                              {installments.length > 1 ? `${installments.length} installments` : `Due ${oldestInstallment.dueDate}`}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-bold text-sm ${isOverdue ? "text-destructive" : "text-foreground"}`}>
                          {formatLKR(totalAmount)}
                        </span>
                        <Button
                          onClick={(e) => handlePayClick(e, oldestInstallment.id, customer, oldestInstallment.amount)}
                          disabled={isPending}
                          className="h-8 px-3 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shrink-0 border-none cursor-pointer shadow-md shadow-primary/10"
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
