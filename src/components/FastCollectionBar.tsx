"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowDownLeft, ArrowUpRight, FileText } from "lucide-react";
import { Customer, Installment, Loan } from "@/data/db";
import { formatLKR } from "@/lib/format";

type Props = {
  customers: Customer[];
  installments: Installment[];
  loans: Loan[];
};

export function FastCollectionBar({ customers, installments, loans }: Props) {
  const router = useRouter();

  // Get customers with pending installments due today/overdue first, then recent
  const priorityCustomerIds = new Set(
    installments
      .filter(i => i.status === "PENDING" || i.status === "MISSED")
      .map(i => {
        const loan = loans.find(l => l.id === i.loanId);
        return loan?.customerId;
      })
      .filter(Boolean) as string[]
  );

  // Sort: priority (have pending) first, then by name
  const sortedCustomers = [...customers]
    .sort((a, b) => {
      const aPriority = priorityCustomerIds.has(a.id) ? 0 : 1;
      const bPriority = priorityCustomerIds.has(b.id) ? 0 : 1;
      return aPriority - bPriority;
    })
    .slice(0, 10);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Generate a deterministic vibrant color from name
  const getAvatarColor = (name: string) => {
    const colors = [
      "from-violet-500 to-purple-600",
      "from-indigo-500 to-blue-600",
      "from-rose-500 to-pink-600",
      "from-amber-500 to-orange-600",
      "from-emerald-500 to-teal-600",
      "from-cyan-500 to-sky-600",
      "from-fuchsia-500 to-violet-600",
    ];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="w-full rounded-[1.75rem] bg-card border border-white/5 dark:border-white/8 p-5 shadow-xl shadow-black/10 relative overflow-hidden">
      
      {/* Subtle top-right glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Label */}
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground mb-4">
        Fast Collection
      </p>

      {/* Avatar Scroll Row */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none no-scrollbar">
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* New Customer Button */}
        <Link href="/new" className="flex flex-col items-center gap-1.5 shrink-0 group">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-violet-500/40 bg-violet-500/10 flex items-center justify-center group-hover:border-violet-400 group-hover:bg-violet-500/20 transition-all duration-200 active:scale-95">
            <Plus className="w-5 h-5 text-violet-400" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">New</span>
        </Link>

        {/* Customer Avatars */}
        {sortedCustomers.map((customer) => {
          const hasPending = priorityCustomerIds.has(customer.id);
          const firstName = customer.name.split(" ")[0];
          const shortName = firstName.length > 6 ? firstName.slice(0, 5) + "." : firstName;

          return (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform"
            >
              <div className="relative">
                <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 transition-all duration-200 ${
                  hasPending
                    ? "ring-violet-500/60 group-hover:ring-violet-400"
                    : "ring-white/10 group-hover:ring-white/30"
                }`}>
                  {customer.avatarUrl ? (
                    <img
                      src={customer.avatarUrl}
                      alt={customer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(customer.name)} flex items-center justify-center`}>
                      <span className="text-white text-sm font-black">{getInitials(customer.name)}</span>
                    </div>
                  )}
                </div>
                {/* Pending indicator dot */}
                {hasPending && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-500 border-2 border-card rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors max-w-[56px] truncate text-center">
                {shortName}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50 my-4" />

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          href="/new"
          className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary/90 active:scale-[0.97] transition-all border border-white/5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 group-hover:bg-violet-500/25 flex items-center justify-center transition-colors">
            <ArrowDownLeft className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">Collect</span>
        </Link>

        <Link
          href="/new?type=loan"
          className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary/90 active:scale-[0.97] transition-all border border-white/5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 group-hover:bg-indigo-500/25 flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">New Loan</span>
        </Link>

        <Link
          href="/reports"
          className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary/90 active:scale-[0.97] transition-all border border-white/5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 group-hover:bg-purple-500/25 flex items-center justify-center transition-colors">
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">Reports</span>
        </Link>
      </div>
    </div>
  );
}
