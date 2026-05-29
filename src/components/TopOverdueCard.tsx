"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Customer, Installment, Loan } from "@/data/db";
import { formatLKR } from "@/lib/format";

type TopOverdueProps = {
  installments: Installment[];
  loans: Loan[];
  customers: Customer[];
};

export function TopOverdueCard({ installments, loans, customers }: TopOverdueProps) {
  const today = new Date(new Date().toDateString());

  // Find all overdue installments (MISSED or PENDING past due date)
  const overdueInsts = installments.filter(i =>
    i.status === "MISSED" ||
    (i.status === "PENDING" && new Date(i.dueDate) < today)
  );

  if (overdueInsts.length === 0) return null;

  // Aggregate overdue amount per customer
  const customerOverdueMap = new Map<string, { customer: Customer; loan: Loan; totalOverdue: number; installmentCount: number }>();

  for (const inst of overdueInsts) {
    const loan = loans.find(l => l.id === inst.loanId);
    if (!loan) continue;
    const customer = customers.find(c => c.id === loan.customerId);
    if (!customer) continue;

    const existing = customerOverdueMap.get(customer.id);
    if (existing) {
      existing.totalOverdue += inst.amount;
      existing.installmentCount += 1;
    } else {
      customerOverdueMap.set(customer.id, {
        customer,
        loan,
        totalOverdue: inst.amount,
        installmentCount: 1,
      });
    }
  }

  // Sort by overdue amount desc, take top 4
  const topOverdue = Array.from(customerOverdueMap.values())
    .sort((a, b) => b.totalOverdue - a.totalOverdue)
    .slice(0, 4);

  const totalOverdueAmount = overdueInsts.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Overdue</p>
            <p className="text-xs font-bold text-foreground">
              {customerOverdueMap.size} client{customerOverdueMap.size !== 1 ? "s" : ""} · {formatLKR(totalOverdueAmount)}
            </p>
          </div>
        </div>
        <Link href="/customers" className="text-[10px] font-bold text-primary hover:underline">
          See all →
        </Link>
      </div>

      {/* Ranked list */}
      <div className="divide-y divide-border/40">
        {topOverdue.map(({ customer, totalOverdue, installmentCount }, idx) => (
          <Link key={customer.id} href={`/customers/${customer.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors group">
            {/* Rank badge */}
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
              idx === 0 ? "bg-rose-500 text-white" :
              idx === 1 ? "bg-rose-400/80 text-white" :
              "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}>
              {idx + 1}
            </span>

            <img
              src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`}
              alt={customer.name}
              className="w-8 h-8 rounded-full border border-border object-cover shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{customer.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {customer.state && <span className="text-primary font-bold">{customer.state} · </span>}
                {installmentCount} missed installment{installmentCount !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-black text-rose-600 dark:text-rose-400 block">
                {formatLKR(totalOverdue)}
              </span>
              <span className="text-[9px] text-muted-foreground">overdue</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
