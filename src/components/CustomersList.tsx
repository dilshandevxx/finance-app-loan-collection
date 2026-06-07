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
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Search Field */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, phone, or village..."
            className="w-full bg-white dark:bg-muted border border-gray-200 dark:border-border rounded-2xl pl-12 pr-4 py-4 text-base text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
          />
        </div>

        {/* Village Filter Selector */}
        <div className="flex flex-col gap-1.5 min-w-[200px] shrink-0">
          <div className="relative">
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full bg-white dark:bg-muted border border-gray-200 dark:border-border rounded-2xl pl-4 pr-10 py-4 text-base text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm appearance-none font-medium cursor-pointer"
            >
              <option value="">📍 All Areas</option>
              {villages.map(v => (
                <option key={v} value={v}>📍 {v}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-455 dark:text-white/40">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
          <Link href="/villages" className="text-right text-[11px] font-bold text-primary hover:underline px-1 flex items-center justify-end gap-1">
            <span>Manage Areas</span> ⚙️
          </Link>
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="flex bg-gray-50 dark:bg-muted p-1.5 rounded-2xl w-full max-w-sm mx-auto shadow-inner border border-gray-100 dark:border-border/30">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-sm font-bold rounded-xl transition-all active:scale-[0.98] ${activeTab === "active"
              ? "bg-white dark:bg-card text-black dark:text-white shadow-md"
              : "text-gray-500 dark:text-white/40 hover:text-black dark:hover:text-white"
            }`}
        >
          <UserCheck className="w-4 h-4" />
          Active Clients
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === "active"
              ? "bg-primary/20 text-primary dark:bg-primary/10 dark:text-primary-foreground"
              : "bg-gray-200 dark:bg-card text-gray-600 dark:text-white/40"
            }`}>
            {allActiveCustomers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("settled")}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-sm font-bold rounded-xl transition-all active:scale-[0.98] ${activeTab === "settled"
              ? "bg-white dark:bg-card text-black dark:text-white shadow-md"
              : "text-gray-500 dark:text-white/40 hover:text-black dark:hover:text-white"
            }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Settled
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === "settled"
              ? "bg-primary/20 text-primary dark:bg-primary/10 dark:text-primary-foreground"
              : "bg-gray-200 dark:bg-card text-gray-600 dark:text-white/40"
            }`}>
            {allSettledCustomers.length}
          </span>
        </button>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayCustomers.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-border bg-gray-50/50 dark:bg-card/30 flex flex-col items-center justify-center gap-3">
            <Inbox className="w-8 h-8 text-gray-300 dark:text-neutral-700" />
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 dark:text-white/50 text-sm font-medium">
                No {activeTab} clients found
              </p>
              {searchQuery && (
                <p className="text-xs text-gray-400 dark:text-white/30">
                  Try adjusting your search query &quot;{searchQuery}&quot;
                </p>
              )}
            </div>
          </div>
        ) : (
          displayCustomers.map((customer, i) => {
            const customerLoans = localLoans.filter(l => l.customerId === customer.id);
            const activeLoan = customerLoans.find(l => l.status === "ACTIVE");
            const totalRemaining = customerLoans.reduce((sum, l) => sum + (l.status === 'ACTIVE' ? l.remainingBalance : 0), 0);
            const isOverdue = customerLoans.some(l =>
              localInstallments.some(i => i.loanId === l.id && (i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))))
            );

            return (
              <Link key={customer.id} href={`/customers/${customer.id}`}>
                <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-primary/40 transition-all cursor-pointer group transform hover:-translate-y-0.5">
                  <CardContent className="p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4">

                    {/* Avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-100 dark:border-border overflow-hidden relative shrink-0 shadow-sm mt-0.5 sm:mt-0 bg-gray-50 dark:bg-muted">
                      <img src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`} alt={customer.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Right Side: Info & Balance Column */}
                    <div className="flex flex-col flex-1 min-w-0 gap-2 sm:gap-3">

                      {/* Top Row: Name/ID and Balance */}
                      <div className="flex items-start justify-between gap-2 w-full">

                        <div className="flex flex-col min-w-0 gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base sm:text-lg text-black dark:text-white truncate tracking-tight">{customer.name}</span>
                            {isOverdue ? (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider shrink-0 border border-red-200 dark:border-red-500/20">Overdue</span>
                            ) : activeLoan ? (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] sm:text-[10px] uppercase font-black tracking-wider shrink-0 border border-primary/20">Active</span>
                            ) : (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider shrink-0 border border-gray-200 dark:border-white/10">Settled</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-500 dark:text-white/50 min-w-0 flex-wrap font-medium">
                            {customer.state && (
                              <>
                                <span className="flex items-center gap-0.5 text-primary dark:text-white/70 font-semibold uppercase bg-primary/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                  📍 {customer.state}
                                </span>
                                <span className="shrink-0 text-gray-300 dark:text-white/20 hidden sm:block">•</span>
                              </>
                            )}
                            <span className="shrink-0 text-gray-400 dark:text-white/40">ID: {customer.memberId || customer.id}</span>
                            <span className="shrink-0 text-gray-300 dark:text-white/20 hidden sm:block">•</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Phone className="w-3 h-3" />
                              {formatLKPhone(customer.phone)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex flex-col items-end">
                            {activeLoan ? (
                              <>
                                <span className={`font-bold text-base sm:text-lg tracking-tight ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                                  {formatLKR(totalRemaining)}
                                </span>
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-white/40">Remaining</span>
                              </>
                            ) : (
                              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
                                Paid ✅
                              </span>
                            )}
                          </div>
                          <div className="hidden sm:flex w-8 h-8 rounded-full bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-secondary transition-colors shrink-0">
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors" />
                          </div>
                        </div>

                      </div>

                      {/* Bottom Row: Progress Bar */}
                      {activeLoan && (
                        <div className="flex flex-col gap-1.5 w-full pr-0 sm:pr-12">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 dark:text-white/50">
                            <span>Repayment Progress</span>
                            <span>{Math.round(((activeLoan.totalAmountDue - totalRemaining) / activeLoan.totalAmountDue) * 100)}%</span>
                          </div>
                          <div className="w-full h-1.5 sm:h-2 bg-gray-100 dark:bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isOverdue ? 'bg-red-500' : 'bg-black dark:bg-white'}`}
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
          })
        )}
      </div>
    </div>
  );
}
