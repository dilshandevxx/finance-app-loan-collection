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
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-[22px] font-black tracking-tight text-foreground">Due</h2>
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

      {/* 4. CUSTOMER GRID */}
      <div className="w-full">
        {sortedCustomerGroups.length === 0 ? (
          <Card className="rounded-[1.5rem] border border-white/5 bg-card shadow-sm">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <h4 className="text-foreground font-semibold mb-1">No pending collections</h4>
              <p className="text-muted-foreground text-sm">You&apos;re all caught up for the day.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedCustomerGroups.map((group) => {
              const { customer, totalAmount, isOverdue } = group;
              const firstName = customer.name.split(" ")[0];
              const shortName = firstName.length > 8 ? firstName.slice(0, 7) + "." : firstName;

              return (
                <Link key={customer.id} href={`/customers/${customer.id}`} className="block group active:scale-95 transition-transform">
                  <div className={`flex flex-col p-5 rounded-[1.5rem] bg-card/50 backdrop-blur-md border shadow-sm transition-all duration-300 ${
                    isOverdue 
                      ? "border-destructive/30 hover:border-destructive/50 hover:shadow-[0_4px_20px_-4px_rgba(244,63,94,0.15)]" 
                      : "border-border/50 hover:border-primary/30 hover:shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)]"
                  }`}>
                    
                    {/* Top Section: Initials & Status */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Clean Initials Badge instead of ugly image */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black tracking-widest text-primary ${
                        isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10'
                      }`}>
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      
                      {isOverdue && (
                        <div className="px-2 py-0.5 rounded-md bg-destructive/10 border border-destructive/20 flex items-center shadow-sm">
                          <span className="text-[9px] font-black uppercase tracking-widest text-destructive animate-pulse">Overdue</span>
                        </div>
                      )}
                    </div>

                    {/* Middle Section: Name & Area */}
                    <div className="flex flex-col mb-4">
                      <span className="font-extrabold text-foreground text-[15px] truncate tracking-tight">{shortName}</span>
                      <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest truncate mt-0.5">
                        {customer.state || "Unknown Area"}
                      </span>
                    </div>

                    {/* Bottom Section: Amount */}
                    <div className="mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Expected</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-[11px] font-bold leading-none ${isOverdue ? "text-destructive" : "text-primary"}`}>Rs.</span>
                          <span className={`text-xl font-black leading-none tracking-tighter ${isOverdue ? "text-destructive" : "text-foreground"}`}>
                            {Math.floor(totalAmount).toLocaleString("en-LK")}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
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
    </section>
  );
}
