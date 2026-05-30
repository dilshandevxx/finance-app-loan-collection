"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Customer, Installment, Loan } from "@/data/db";
import { formatLKR } from "@/lib/format";

type DueTomorrowProps = {
  installments: Installment[];
  loans: Loan[];
  customers: Customer[];
};

export function DueTomorrowCard({ installments, loans, customers }: DueTomorrowProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toDateString();

  const dueTomorrow = installments.filter(
    i => (i.status === "PENDING") && new Date(i.dueDate).toDateString() === tomorrowStr
  );

  if (dueTomorrow.length === 0) return null;

  // Group by customer, take top 3
  const seen = new Set<string>();
  const previewItems: { customer: Customer; loan: Loan; inst: Installment }[] = [];

  for (const inst of dueTomorrow) {
    const loan = loans.find(l => l.id === inst.loanId);
    if (!loan) continue;
    const customer = customers.find(c => c.id === loan.customerId);
    if (!customer || seen.has(customer.id)) continue;
    seen.add(customer.id);
    previewItems.push({ customer, loan, inst });
    if (previewItems.length >= 3) break;
  }

  const totalTomorrow = dueTomorrow.reduce((s, i) => s + i.amount, 0);
  const uniqueCustomers = new Set(dueTomorrow.map(i => {
    const loan = loans.find(l => l.id === i.loanId);
    return loan?.customerId;
  })).size;

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Due Tomorrow</p>
            <p className="text-xs font-bold text-foreground">
              {uniqueCustomers} client{uniqueCustomers !== 1 ? "s" : ""} · {formatLKR(totalTomorrow)}
            </p>
          </div>
        </div>
        <Link href="/customers" className="text-[10px] font-bold text-primary hover:underline">
          See all →
        </Link>
      </div>

      {/* Preview rows */}
      <div className="divide-y divide-border/40">
        {previewItems.map(({ customer, inst }) => (
          <Link key={customer.id} href={`/customers/${customer.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors">
            <img
              src={customer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name.trim())}`}
              alt={customer.name}
              className="w-8 h-8 rounded-full border border-border object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{customer.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {customer.state && <span className="text-primary font-bold">{customer.state} · </span>}
                {customer.memberId || customer.id.slice(0, 8)}
              </p>
            </div>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400 shrink-0">
              {formatLKR(inst.amount)}
            </span>
          </Link>
        ))}

        {dueTomorrow.length > 3 && (
          <div className="px-4 py-2.5 text-center">
            <span className="text-[11px] text-muted-foreground font-semibold">
              +{uniqueCustomers - 3} more tomorrow
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
