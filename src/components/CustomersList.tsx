"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Customer, Loan, Installment } from "@/data/db";

type CustomersListProps = {
  customers: Customer[];
  loans: Loan[];
  installments: Installment[];
};

export function CustomersList({ customers, loans, installments }: CustomersListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    if (searchQuery.trim() === "") return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = customer.name.toLowerCase().includes(query);
    const idMatch = customer.memberId?.toLowerCase().includes(query) || customer.id.toLowerCase().includes(query);
    const phoneMatch = customer.phone.toLowerCase().includes(query);
    
    return nameMatch || idMatch || phoneMatch;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="relative mb-2 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, ID, or phone..."
          className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl pl-12 pr-4 py-4 text-base text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-500/10 dark:focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#0a0a0a]">
            <p className="text-gray-500 dark:text-white/50 mb-1">No customers found matching "{searchQuery}"</p>
            <p className="text-sm text-gray-400 dark:text-white/30">Try a different name or member ID</p>
          </div>
        ) : (
          filteredCustomers.map((customer, i) => {
            const customerLoans = loans.filter(l => l.customerId === customer.id);
            const activeLoan = customerLoans.find(l => l.status === "ACTIVE");
            const totalRemaining = customerLoans.reduce((sum, l) => sum + (l.status === 'ACTIVE' ? l.remainingBalance : 0), 0);
            const isOverdue = customerLoans.some(l => 
              installments.some(i => i.loanId === l.id && (i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))))
            );

            // Generate a consistent gradient color based on name length/index for avatar fallback
            const gradients = [
              "from-blue-500 to-cyan-400",
              "from-purple-500 to-pink-500",
              "from-orange-500 to-amber-400",
              "from-emerald-500 to-teal-400",
            ];
            const gradient = gradients[i % gradients.length];

            return (
              <Link key={customer.id} href={`/customers/${customer.id}`}>
                <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-[#444] transition-all cursor-pointer group transform hover:-translate-y-0.5">
                  <CardContent className="p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4">
                    
                    {/* Avatar */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-100 dark:border-[#222] overflow-hidden relative shrink-0 shadow-sm mt-0.5 sm:mt-0 bg-gray-50 dark:bg-[#111]">
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
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider shrink-0 border border-emerald-200 dark:border-emerald-500/20">Active</span>
                            ) : (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider shrink-0 border border-gray-200 dark:border-white/10">Settled</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-500 dark:text-white/50 min-w-0 flex-wrap font-medium">
                            <span className="shrink-0 text-gray-400 dark:text-white/40">ID: {customer.memberId || customer.id}</span>
                            <span className="shrink-0 text-gray-300 dark:text-white/20 hidden sm:block">•</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex flex-col items-end">
                            {activeLoan ? (
                              <>
                                <span className={`font-bold text-base sm:text-lg tracking-tight ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>
                                  ${totalRemaining.toFixed(2)}
                                </span>
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-white/40">Remaining</span>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-gray-400 dark:text-white/40">Settled</span>
                            )}
                          </div>
                          <div className="hidden sm:flex w-8 h-8 rounded-full bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#222] items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-[#222] transition-colors shrink-0">
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
                          <div className="w-full h-1.5 sm:h-2 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
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
