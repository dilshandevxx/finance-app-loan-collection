"use client";

import { MapPin } from "lucide-react";
import { Customer, Installment, Loan } from "@/data/db";
import { formatLKR } from "@/lib/format";

type VillageBarsProps = {
  installments: Installment[];
  loans: Loan[];
  customers: Customer[];
};

export function VillageCollectionBars({ installments, loans, customers }: VillageBarsProps) {
  // Build village summary from all installments
  const villageMap = new Map<string, { collected: number; expected: number; activeLoans: number }>();

  for (const customer of customers) {
    const village = customer.state?.trim() || "Unassigned";
    if (!villageMap.has(village)) {
      villageMap.set(village, { collected: 0, expected: 0, activeLoans: 0 });
    }
  }

  for (const inst of installments) {
    const loan = loans.find(l => l.id === inst.loanId);
    if (!loan) continue;
    const customer = customers.find(c => c.id === loan.customerId);
    if (!customer) continue;
    const village = customer.state?.trim() || "Unassigned";

    const entry = villageMap.get(village);
    if (!entry) continue;

    entry.expected += inst.amount;
    if (inst.status === "PAID") {
      entry.collected += inst.amount;
    }
  }

  // Count active loans per village
  for (const loan of loans) {
    if (loan.status !== "ACTIVE") continue;
    const customer = customers.find(c => c.id === loan.customerId);
    if (!customer) continue;
    const village = customer.state?.trim() || "Unassigned";
    const entry = villageMap.get(village);
    if (entry) entry.activeLoans += 1;
  }

  const villages = Array.from(villageMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .filter(v => v.expected > 0)
    .sort((a, b) => b.expected - a.expected);

  if (villages.length === 0) return null;

  const maxExpected = Math.max(...villages.map(v => v.expected));

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">By Area</p>
            <p className="text-xs font-bold text-foreground">Collection progress</p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold">{villages.length} areas</span>
      </div>

      {/* Village bars */}
      <div className="p-4 flex flex-col gap-3.5">
        {villages.map(v => {
          const rate = v.expected > 0 ? Math.round((v.collected / v.expected) * 100) : 0;
          const barWidth = v.expected > 0 ? (v.expected / maxExpected) * 100 : 0;
          const fillWidth = v.expected > 0 ? (v.collected / v.expected) * 100 : 0;

          const rateColor =
            rate >= 80 ? "bg-emerald-500" :
            rate >= 50 ? "bg-amber-500" :
            "bg-rose-500";

          const rateTextColor =
            rate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
            rate >= 50 ? "text-amber-600 dark:text-amber-400" :
            "text-rose-500 dark:text-rose-400";

          return (
            <div key={v.name} className="flex flex-col gap-1.5">
              {/* Area name + rate */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-black text-primary">📍</span>
                  <span className="text-xs font-semibold text-foreground truncate">{v.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    · {v.activeLoans} loan{v.activeLoans !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className={`text-xs font-black shrink-0 ml-2 ${rateTextColor}`}>{rate}%</span>
              </div>

              {/* Progress bar track (scaled relative to largest village) */}
              <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                {/* Relative width track */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-border/60"
                  style={{ width: `${barWidth}%` }}
                />
                {/* Collected fill */}
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${rateColor}`}
                  style={{ width: `${(fillWidth / 100) * barWidth}%` }}
                />
              </div>

              {/* Amounts */}
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>{formatLKR(v.collected)} collected</span>
                <span>{formatLKR(v.expected)} total</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
