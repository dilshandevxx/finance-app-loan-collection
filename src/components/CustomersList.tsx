"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Customer, Loan } from "@/data/mock";

type CustomersListProps = {
  customers: Customer[];
  loans: Loan[];
};

export function CustomersList({ customers, loans }: CustomersListProps) {
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
      <div className="relative mb-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/50" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Name, Member ID, or Phone..."
          className="w-full bg-[#121214] border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition shadow-2xl"
        />
      </div>

      <div className="flex flex-col gap-4">
        {filteredCustomers.length === 0 ? (
          <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-8 text-center text-white/50">
              No customers found matching "{searchQuery}".
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => {
            const customerLoans = loans.filter(l => l.customerId === customer.id);
            const activeLoan = customerLoans.find(l => l.status === "ACTIVE");
            const totalRemaining = customerLoans.reduce((sum, l) => sum + (l.status === 'ACTIVE' ? l.remainingBalance : 0), 0);

            return (
              <Link key={customer.id} href={`/customers/${customer.id}`}>
                <Card className="bg-[#121214] border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <CardContent className="p-4 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/10 overflow-hidden relative border border-white/10">
                        {customer.avatarUrl ? (
                          <Image src={customer.avatarUrl} alt={customer.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 font-semibold text-lg">
                            {customer.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-lg text-white">{customer.name}</span>
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <span>{customer.memberId || customer.id}</span>
                          <span>•</span>
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end hidden sm:flex">
                        {activeLoan ? (
                          <>
                            <span className="font-semibold text-white">${totalRemaining.toFixed(2)}</span>
                            <span className="text-xs text-white/40">Remaining Balance</span>
                          </>
                        ) : (
                          <span className="text-sm text-white/40 bg-white/5 px-3 py-1 rounded-full">No Active Loan</span>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
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
