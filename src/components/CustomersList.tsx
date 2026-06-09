"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ChevronRight, Phone, CheckCircle2, UserCheck, Inbox, ChevronDown, AlertCircle, Banknote } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"all" | "active" | "overdue" | "settled">("active");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  useEffect(() => {
    if (filterParam === "overdue") {
      setActiveTab("overdue");
    } else if (filterParam === "active") {
      setActiveTab("active");
    } else if (filterParam === "settled") {
      setActiveTab("settled");
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

  // Determine overdue customers
  const allOverdueCustomers = localCustomers.filter(customer => {
    const customerLoans = localLoans.filter(l => l.customerId === customer.id && l.status === "ACTIVE");
    return customerLoans.some(l => 
      localInstallments.some(i => i.loanId === l.id && (i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))))
    );
  });

  // Split search results based on active tab
  let displayCustomers = filteredCustomers;
  if (activeTab === "active") {
    displayCustomers = filteredCustomers.filter(c => allActiveCustomers.some(ac => ac.id === c.id));
  } else if (activeTab === "overdue") {
    displayCustomers = filteredCustomers.filter(c => allOverdueCustomers.some(oc => oc.id === c.id));
  } else if (activeTab === "settled") {
    displayCustomers = filteredCustomers.filter(c => allSettledCustomers.some(sc => sc.id === c.id));
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">

      {/* Search and Village Filter */}
      <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
        {/* Search Field */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, phone, or area..."
            className="w-full bg-card/60 backdrop-blur-2xl border border-border/40 rounded-3xl pl-12 pr-4 py-4 text-[15px] font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5 transition-all shadow-sm"
          />
        </div>

        {/* Village Filter Selector */}
        <div className="flex flex-col gap-1.5 min-w-[200px] shrink-0">
          <div className="relative group">
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full bg-card/60 backdrop-blur-2xl border border-border/40 rounded-3xl pl-5 pr-12 py-4 text-[15px] text-foreground focus:outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5 transition-all shadow-sm appearance-none font-semibold cursor-pointer"
            >
              <option value="">🌍 All Areas</option>
              {villages.map(v => (
                <option key={v} value={v}>📍 {v}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Filter Chips */}
      <div className="w-full -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2.5 min-w-max">
          {[
            { id: "all", label: "All Clients", count: localCustomers.length, icon: null },
            { id: "active", label: "Active", count: allActiveCustomers.length, icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: "overdue", label: "Overdue", count: allOverdueCustomers.length, icon: <AlertCircle className="w-3.5 h-3.5" /> },
            { id: "settled", label: "Settled", count: allSettledCustomers.length, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                  isActive 
                    ? "bg-foreground text-background shadow-md" 
                    : "bg-card text-muted-foreground border border-border/50 hover:bg-secondary/80"
                }`}
              >
                {tab.icon && <span className={isActive ? "opacity-80" : "opacity-60"}>{tab.icon}</span>}
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black tracking-wide ${
                  isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
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
                  <div key={customer.id} className="group outline-none block">
                    <Card className="bg-card/80 backdrop-blur-md border-border/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative group-focus-within:ring-4 ring-primary/20">
                      <CardContent className="p-5 flex flex-col gap-5">

                        {/* Top Row: Avatar, Name, Status */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full border border-border/50 overflow-hidden relative shrink-0 shadow-sm bg-secondary">
                              <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col pt-0.5">
                              <span className="font-bold text-lg text-foreground tracking-tight leading-tight">{customer.name}</span>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mt-0.5">
                                {customer.state && (
                                  <span className="flex items-center">
                                    {customer.state}
                                  </span>
                                )}
                                {customer.state && customer.phone && "•"}
                                <span className="flex items-center gap-1">
                                  {formatLKPhone(customer.phone)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="shrink-0">
                            {isOverdue ? (
                              <span className="px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive text-[10px] uppercase font-black tracking-widest border border-destructive/20 shadow-sm animate-pulse">Overdue</span>
                            ) : activeLoan ? (
                              <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest border border-primary/20 shadow-sm">Active</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground text-[10px] uppercase font-bold tracking-widest border border-border shadow-sm">Settled</span>
                            )}
                          </div>
                        </div>

                        {/* Financials */}
                        <div className="flex flex-col bg-secondary/30 rounded-2xl p-4 border border-border/30">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Total Outstanding</span>
                          {activeLoan ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-foreground/50">Rs.</span>
                              <span className={`font-black text-2xl tracking-tight ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                                {totalRemaining.toLocaleString("en-LK")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-primary flex items-center gap-1">
                              Fully Paid <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}

                          {/* Progress */}
                          {activeLoan && (
                            <div className="mt-4 flex flex-col gap-1.5 w-full">
                              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span>Repayment Progress</span>
                                <span className={isOverdue ? 'text-destructive' : 'text-primary'}>
                                  {Math.round(((activeLoan.totalAmountDue - totalRemaining) / activeLoan.totalAmountDue) * 100)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverdue ? 'bg-destructive' : 'bg-primary'}`}
                                  style={{ width: `${Math.max(0, Math.min(100, ((activeLoan.totalAmountDue - totalRemaining) / activeLoan.totalAmountDue) * 100))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <a 
                            href={`tel:${customer.phone}`}
                            className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-bold py-3 rounded-xl transition-colors text-sm"
                          >
                            <Phone className="w-4 h-4 text-primary" /> Call
                          </a>
                          <Link 
                            href={`/customers/${customer.id}`}
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
                          >
                            <Banknote className="w-4 h-4" /> View Account
                          </Link>
                        </div>

                      </CardContent>
                    </Card>
                  </div>
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
