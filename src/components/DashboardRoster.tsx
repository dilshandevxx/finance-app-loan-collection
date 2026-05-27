"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Installment, Loan, Customer } from "@/data/mock";

type DashboardRosterProps = {
  pendingInstallments: Installment[];
  loans: Loan[];
  customers: Customer[];
};

export function DashboardRoster({ pendingInstallments, loans, customers }: DashboardRosterProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Today's Roster</h3>
        <button className="text-sm text-white/50 hover:text-white transition">See All</button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white/50" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Name or Member ID..."
          className="w-full bg-[#121214] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
        />
      </div>
      
      <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          {filteredInstallments.length === 0 ? (
            <div className="p-8 text-center text-white/50 text-sm">
              No pending collections found for "{searchQuery}".
            </div>
          ) : (
            filteredInstallments.map((inst, i) => {
              const loan = loans.find(l => l.id === inst.loanId);
              const customer = customers.find(c => c.id === loan?.customerId)!;
              
              return (
                <Link key={inst.id} href={`/customers/${customer.id}`}>
                  <div className={`flex items-center justify-between p-4 px-6 hover:bg-white/5 transition cursor-pointer ${i !== filteredInstallments.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden relative">
                        {customer.avatarUrl ? (
                          <Image src={customer.avatarUrl} alt={customer.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 font-semibold">
                            {customer.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{customer.name}</span>
                        <span className="text-xs text-white/50">ID: {customer.memberId || customer.id}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-red-400">-${inst.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
}
