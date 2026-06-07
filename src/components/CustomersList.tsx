"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ChevronRight, Phone, CheckCircle2, UserCheck, Inbox, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Customer, Loan, Installment } from "@/data/db";
import { formatLKR, formatLKPhone } from "@/lib/format";

type CustomersListProps = {
  customers: Customer[];
  loans: Loan[];
  installments: Installment[];
};

export function CustomersList({ customers, loans, installments }: CustomersListProps) {
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(customers);
  const [localLoans, setLocalLoans] = useState<Loan[]>(loans);
  const [localInstallments, setLocalInstallments] = useState<Installment[]>(installments);

  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "settled">("active");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  useEffect(() => {
    if (filterParam === "overdue") {
      setActiveTab("active");
    }
  }, [filterParam]);

  const loadFromCache = async () => {
    try {
      const { getCacheItem } = await import("@/lib/idb");
      const cachedCustomers = await getCacheItem<Customer[]>("customers");
      const cachedLoans = await getCacheItem<Loan[]>("loans");
      const cachedInstallments = await getCacheItem<Installment[]>("installments");

      if (cachedCustomers) setLocalCustomers(cachedCustomers);
      if (cachedLoans) setLocalLoans(cachedLoans);
      if (cachedInstallments) setLocalInstallments(cachedInstallments);
    } catch (err) {
      console.error("Failed to load customer list cache:", err);
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
      setLocalInstallments(installments);
    });
    return () => cancelAnimationFrame(handle);
  }, [customers, loans, installments]);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.onLine) {
      import("@/lib/idb").then(({ setCacheItem }) => {
        setCacheItem("customers", customers);
        setCacheItem("loans", loans);
        setCacheItem("installments", installments);
      }).catch(err => console.error("Error setting IndexedDB cache in customers list:", err));
    }
  }, [customers, loans, installments]);

  const villages = Array.from(
    new Set(
      localCustomers
        .map(c => c.state)
        .filter((s): s is string => !!s && s.trim() !== "")
    )
  ).sort();

  // Determine all active customers (have at least one active loan)
  const allActiveCustomers = localCustomers.filter(customer => {
    const customerLoans = localLoans.filter(l => l.customerId === customer.id);
    return customerLoans.some(l => l.status === "ACTIVE");
  });

  // Determine all settled customers (no loans, or all loans paid off/not active)
  const allSettledCustomers = localCustomers.filter(customer => {
    const customerLoans = localLoans.filter(l => l.customerId === customer.id);
    return customerLoans.length === 0 || customerLoans.every(l => l.status !== "ACTIVE");
  });

  const filteredCustomers = localCustomers.filter((customer) => {
    // 1. Village filter match
    if (selectedVillage && customer.state !== selectedVillage) {
      return false;
    }

    // 2. Search query match
    if (searchQuery.trim() === "") return true;

    const query = searchQuery.toLowerCase();
    const nameMatch = customer.name.toLowerCase().includes(query);
    const idMatch = customer.memberId?.toLowerCase().includes(query) || customer.id.toLowerCase().includes(query);
    const phoneMatch = customer.phone.toLowerCase().includes(query);
    const stateMatch = customer.state?.toLowerCase().includes(query);

    return nameMatch || idMatch || phoneMatch || stateMatch;
  });

  // Split search results between the active tab
  let displayCustomers = activeTab === "active"
    ? filteredCustomers.filter(c => allActiveCustomers.some(ac => ac.id === c.id))
    : filteredCustomers.filter(c => allSettledCustomers.some(sc => sc.id === c.id));

  // Apply Overdue filter if param is present
  if (filterParam === "overdue") {
    displayCustomers = displayCustomers.filter(customer => {
      const customerLoans = localLoans.filter(l => l.customerId === customer.id && l.status === "ACTIVE");
      return customerLoans.some(l => 
        localInstallments.some(i => i.loanId === l.id && (i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))))
      );
    });
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">

      {/* Search and Village Filter */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Search Field */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, phone, or area..."
            className="w-full bg-card/50 backdrop-blur-xl border border-border/50 rounded-[1.5rem] pl-14 pr-4 py-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
        </div>

        {/* Village Filter Selector */}
        <div className="flex flex-col gap-1.5 min-w-[200px] shrink-0">
          <div className="relative group">
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full bg-card/50 backdrop-blur-xl border border-border/50 rounded-[1.5rem] pl-5 pr-12 py-4 text-[15px] text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm appearance-none font-medium cursor-pointer"
            >
              <option value="">🌍 All Areas</option>
              {villages.map(v => (
                <option key={v} value={v}>📍 {v}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="flex bg-secondary/50 backdrop-blur-md p-1.5 rounded-[1.25rem] w-full max-w-md mx-auto shadow-sm border border-border/50">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-sm font-bold rounded-xl transition-all active:scale-[0.98] ${activeTab === "active"
              ? "bg-card text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <UserCheck className="w-4 h-4" />
          Active Clients
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-wide ${activeTab === "active"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
            }`}>
            {allActiveCustomers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("settled")}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-sm font-bold rounded-xl transition-all active:scale-[0.98] ${activeTab === "settled"
              ? "bg-card text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Settled
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-wide ${activeTab === "settled"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
            }`}>
            {allSettledCustomers.length}
          </span>
        </button>
      </div>

      {/* Grid / Table of Clients */}
      <div className="w-full">
        {displayCustomers.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-[2rem] border border-dashed border-border bg-card/30 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-foreground text-[15px] font-bold">
                No {activeTab} clients found
              </p>
              {searchQuery && (
                <p className="text-xs text-muted-foreground font-medium">
                  Try adjusting your search query "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Cards */}
            <div className="grid md:hidden grid-cols-1 gap-4">
              {displayCustomers.map((customer, i) => {
                const customerLoans = localLoans.filter(l => l.customerId === customer.id);
                const activeLoan = customerLoans.find(l => l.status === "ACTIVE");
                const totalRemaining = customerLoans.reduce((sum, l) => sum + (l.status === 'ACTIVE' ? l.remainingBalance : 0), 0);
                const isOverdue = customerLoans.some(l =>
                  localInstallments.some(i => i.loanId === l.id && (i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))))
                );

                return (
                  <Link key={customer.id} href={`/customers/${customer.id}`} className="group outline-none block">
                    <Card className="bg-card/80 backdrop-blur-sm border-border/60 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform group-hover:-translate-y-1 group-focus-visible:ring-4 ring-primary/20">
                      <CardContent className="p-5 sm:p-6 flex flex-col gap-4">

                        {/* Top Section: Avatar & Info */}
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/10 overflow-hidden relative shrink-0 shadow-md bg-secondary group-hover:scale-105 transition-transform duration-300">
                            <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
                          </div>

                          {/* Info */}
                          <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between gap-2 w-full mb-1">
                              <span className="font-extrabold text-[17px] text-foreground truncate tracking-tight">{customer.name}</span>
                              {isOverdue ? (
                                <span className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-[10px] uppercase font-black tracking-widest border border-destructive/20 shrink-0 shadow-sm animate-pulse">Overdue</span>
                              ) : activeLoan ? (
                                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest border border-primary/20 shrink-0 shadow-sm">Active</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] uppercase font-bold tracking-widest border border-border shrink-0 shadow-sm">Settled</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground min-w-0 flex-wrap font-semibold">
                              {customer.state && (
                                <span className="flex items-center gap-1 text-primary bg-primary/5 px-1.5 py-0.5 rounded-md shrink-0 border border-primary/10">
                                  📍 {customer.state}
                                </span>
                              )}
                              <span className="shrink-0 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {formatLKPhone(customer.phone)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Section: Financials & Progress */}
                        <div className="mt-2 pt-4 border-t border-border/50 flex flex-col gap-3">
                          <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">Balance</span>
                              {activeLoan ? (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xs font-bold text-foreground/50">Rs.</span>
                                  <span className={`font-black text-xl tracking-tight ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                                    {totalRemaining.toLocaleString("en-LK")}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-primary flex items-center gap-1">
                                  Fully Paid <CheckCircle2 className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                               <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                            </div>
                          </div>

                          {activeLoan && (
                            <div className="flex flex-col gap-1.5 w-full">
                              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span>Repayment</span>
                                <span className={isOverdue ? 'text-destructive' : 'text-primary'}>
                                  {Math.round(((activeLoan.totalAmountDue - totalRemaining) / activeLoan.totalAmountDue) * 100)}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverdue ? 'bg-destructive' : 'bg-primary'}`}
                                  style={{ width: `${Math.max(0, Math.min(100, ((activeLoan.totalAmountDue - totalRemaining) / activeLoan.totalAmountDue) * 100))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* DESKTOP VIEW: Data Table */}
            <div className="hidden md:block w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-card/40 backdrop-blur-md shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Client</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Contact & Area</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Status</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground">Progress</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground text-right">Balance</th>
                    <th className="p-4 font-bold text-[10px] tracking-widest uppercase text-muted-foreground text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayCustomers.map((customer, i) => {
                    const customerLoans = localLoans.filter(l => l.customerId === customer.id);
                    const activeLoan = customerLoans.find(l => l.status === "ACTIVE");
                    const totalRemaining = customerLoans.reduce((sum, l) => sum + (l.status === 'ACTIVE' ? l.remainingBalance : 0), 0);
                    const isOverdue = customerLoans.some(l =>
                      localInstallments.some(i => i.loanId === l.id && (i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))))
                    );
                    const progress = activeLoan ? Math.max(0, Math.min(100, ((activeLoan.totalAmountDue - totalRemaining) / activeLoan.totalAmountDue) * 100)) : 100;

                    return (
                      <tr key={customer.id} className="group hover:bg-white/5 transition-colors duration-200">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary border border-white/10 overflow-hidden shrink-0">
                               <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-[14px] text-foreground tracking-tight">{customer.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-primary/70" /> {formatLKPhone(customer.phone)}
                            </span>
                            {customer.state && <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-md w-fit">{customer.state}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          {isOverdue ? (
                            <span className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest border border-destructive/20 shadow-sm animate-pulse">Overdue</span>
                          ) : activeLoan ? (
                            <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 shadow-sm">Active</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest border border-border shadow-sm">Settled</span>
                          )}
                        </td>
                        <td className="p-4 w-[160px]">
                          {activeLoan ? (
                            <div className="flex items-center gap-2 w-full">
                               <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                 <div className={`h-full rounded-full ${isOverdue ? 'bg-destructive' : 'bg-primary'}`} style={{width: `${progress}%`}} />
                               </div>
                               <span className="text-[10px] font-bold text-muted-foreground shrink-0 w-8 text-right">{Math.round(progress)}%</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-primary font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> 100%</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex flex-col items-end">
                            {activeLoan ? (
                               <div className="flex items-baseline gap-1">
                                 <span className="text-[10px] font-bold text-foreground/50">Rs.</span>
                                 <span className={`text-[15px] font-black tracking-tight ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>{totalRemaining.toLocaleString("en-LK")}</span>
                               </div>
                            ) : (
                               <span className="text-xs text-muted-foreground font-semibold">0.00</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Link href={`/customers/${customer.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors duration-200 shadow-sm group-hover:scale-110">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
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
    </div>
  );
}
