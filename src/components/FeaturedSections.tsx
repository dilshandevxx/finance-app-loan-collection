"use client";

import Link from "next/link";
import { Users, BarChart3, Map, CalendarClock, AlertTriangle } from "lucide-react";
import { Customer, Installment, Loan } from "@/data/db";
import { formatLKRShort } from "@/lib/format";

type Props = {
  customers: Customer[];
  installments: Installment[];
  loans: Loan[];
};

export function FeaturedSections({ customers, installments, loans }: Props) {
  
  // -- Calculate metrics for the cards --
  
  // 1. Portfolio
  const activeLoansCount = loans.filter(l => l.status === "ACTIVE").length;
  const totalPrincipal = loans.filter(l => l.status === "ACTIVE").reduce((sum, l) => sum + l.principalAmount, 0);

  // 2. Weekly Performance (Mocked as we don't have exact weekly ranges right now, using total paid)
  const totalPaid = installments.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);
  
  // 3. Area Breakdown
  const uniqueAreas = new Set(customers.map(c => c.address?.split(",").pop()?.trim() || "Unknown")).size;
  
  // 4. Overdue
  const overdueAmount = installments.filter(i => i.status === "MISSED").reduce((sum, i) => sum + i.amount, 0);

  const sections = [
    {
      title: "Portfolio",
      subtitle: "All Customers",
      value: formatLKRShort(totalPrincipal),
      trend: `${activeLoansCount} active loans`,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      href: "/customers",
      color: "from-indigo-500/10 to-indigo-500/5",
      iconBg: "bg-indigo-500/20",
    },
    {
      title: "Performance",
      subtitle: "Total Collected",
      value: formatLKRShort(totalPaid),
      trend: "View reports",
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
      href: "/reports",
      color: "from-emerald-500/10 to-emerald-500/5",
      iconBg: "bg-emerald-500/20",
    },
    {
      title: "Villages",
      subtitle: "Area Breakdown",
      value: `${uniqueAreas} Areas`,
      trend: "View map",
      icon: <Map className="w-5 h-5 text-violet-400" />,
      href: "/villages",
      color: "from-violet-500/10 to-violet-500/5",
      iconBg: "bg-violet-500/20",
    },
    {
      title: "Overdue",
      subtitle: "Missed Payments",
      value: formatLKRShort(overdueAmount),
      trend: "Needs attention",
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      href: "/customers?filter=overdue",
      color: "from-rose-500/10 to-rose-500/5",
      iconBg: "bg-rose-500/20",
    }
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[13px] font-bold text-foreground">Featured Sections</h2>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-none no-scrollbar snap-x">
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {sections.map((section, idx) => (
          <Link
            key={idx}
            href={section.href}
            className="flex flex-col justify-between shrink-0 w-[140px] p-4 rounded-[1.5rem] bg-card border border-white/5 dark:border-white/10 shadow-lg shadow-black/5 snap-start relative overflow-hidden group active:scale-95 transition-transform"
          >
            {/* Background Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            {/* Top row: Icon and Title */}
            <div className="relative z-10 flex flex-col gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full ${section.iconBg} flex items-center justify-center`}>
                {section.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-extrabold text-foreground leading-tight tracking-tight">{section.title}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{section.subtitle}</span>
              </div>
            </div>

            {/* Bottom row: Value and Trend */}
            <div className="relative z-10 flex flex-col mt-auto">
              <span className="text-[16px] font-black text-foreground tracking-tight">{section.value}</span>
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">{section.trend}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
