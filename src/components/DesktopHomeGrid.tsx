"use client";

import Link from "next/link";
import { CollectionGoalCard } from "@/components/CollectionGoalCard";
import { BarChart3, Radio, Users, FileText } from "lucide-react";
import { Customer, Loan, Installment } from "@/data/db";

interface DesktopHomeGridProps {
  customers: Customer[];
  loans: Loan[];
  installments: Installment[];
  expectedToday: number;
  collectedToday: number;
  totalClientsToday: number;
  collectedClientsToday: number;
  activeLoans: number;
  overdueAmount: number;
}

const NAV_CARDS = [
  {
    title: "Portfolio Analytics",
    description: "Detailed performance, ROI, and village breakdown",
    href: "/analytics",
    icon: <BarChart3 className="w-8 h-8 text-emerald-400" />,
    gradient: "from-emerald-500/20 to-transparent",
    glow: "bg-emerald-500/20"
  },
  {
    title: "Live Action Feed",
    description: "Real-time updates on payments and pending actions",
    href: "/feed",
    icon: <Radio className="w-8 h-8 text-primary" />,
    gradient: "from-primary/20 to-transparent",
    glow: "bg-primary/20"
  },
  {
    title: "Client Directory",
    description: "Manage customers, loans, and applications",
    href: "/customers",
    icon: <Users className="w-8 h-8 text-orange-400" />,
    gradient: "from-orange-500/20 to-transparent",
    glow: "bg-orange-500/20"
  },
  {
    title: "Reports Center",
    description: "Export collection sheets and financial reports",
    href: "/reports",
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    gradient: "from-blue-500/20 to-transparent",
    glow: "bg-blue-500/20"
  }
];

export function DesktopHomeGrid({
  customers,
  loans,
  installments,
  expectedToday,
  collectedToday,
  totalClientsToday,
  collectedClientsToday,
  activeLoans,
  overdueAmount,
}: DesktopHomeGridProps) {
  
  // -- Calculate Live Widgets Data --
  // 1. Sparkline (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });
  const dailyTotals = last7Days.map(dateStr => {
    return installments
      .filter(i => i.status === "PAID" && i.paidDate && new Date(i.paidDate).toDateString() === dateStr)
      .reduce((sum, inst) => sum + inst.amount, 0);
  });
  const maxTotal = Math.max(...dailyTotals, 1);
  const sparklineBars = dailyTotals.map(t => Math.max(10, Math.round((t / maxTotal) * 100)));

  // 2. Recent Payments (Feed)
  const recentPayments = installments
    .filter(i => i.status === "PAID" && i.paidDate)
    .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
    .slice(0, 2);

  return (
    <div className="hidden md:flex flex-col xl:grid xl:grid-cols-12 gap-6 xl:gap-8 w-full mt-4">
      
      {/* ── Top Level Hero Card (Left Column on Desktop) ── */}
      <div className="w-full xl:col-span-5 2xl:col-span-4 flex flex-col justify-start">
        <CollectionGoalCard
          expectedToday={expectedToday}
          collectedToday={collectedToday}
          totalClientsToday={totalClientsToday}
          collectedClientsToday={collectedClientsToday}
          activeLoans={activeLoans}
          overdueAmount={overdueAmount}
        />
      </div>

      {/* ── Navigation Grid (Right Column on Desktop) ──── */}
      <div className="xl:col-span-7 2xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-6 items-start h-fit">
        {NAV_CARDS.map((card, idx) => {
          
          let widget = null;
          if (card.title === "Portfolio Analytics") {
            widget = (
              <div className="flex items-end gap-1.5 h-10 mt-2 mb-4 w-full">
                {sparklineBars.map((h, i) => (
                  <div key={i} className="w-full bg-emerald-500/20 rounded-t-sm" style={{ height: '100%' }}>
                    <div className="w-full bg-emerald-400 rounded-t-sm transition-all duration-1000 mt-auto" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
            );
          } else if (card.title === "Live Action Feed") {
            widget = (
              <div className="flex flex-col gap-2 mt-2 mb-4 w-full">
                {recentPayments.length > 0 ? recentPayments.map((p, i) => {
                  const loan = loans.find(l => l.id === p.loanId);
                  const cust = customers.find(c => c.id === loan?.customerId);
                  return (
                    <div key={i} className="flex items-center gap-2 bg-black/20 rounded-lg p-1.5 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] text-white/80 font-bold truncate">{cust?.name || "Client"}</span>
                      <span className="text-[10px] text-primary font-black ml-auto">Rs.{p.amount}</span>
                    </div>
                  );
                }) : (
                  <div className="flex items-center gap-2 bg-black/20 rounded-lg p-2 border border-white/5">
                     <span className="text-[10px] text-white/40">Waiting for payments...</span>
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavCard key={idx} card={card} widget={widget} />
          );
        })}
      </div>

    </div>
  );
}

// -- Spotlight Card Subcomponent --
function NavCard({ card, widget }: { card: any, widget: React.ReactNode }) {
  const [mousePosition, setMousePosition] = import("react").useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = import("react").useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <Link 
      href={card.href} 
      className="group block relative w-full h-full min-h-[220px] rounded-[2rem] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background container */}
      <div className="absolute inset-0 bg-[#0A0514]/80 backdrop-blur-md border border-white/5" />
      
      {/* Flashlight Spotlight Effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />
      
      <div className={`absolute top-0 right-0 w-32 h-32 ${card.glow} rounded-full blur-[60px] pointer-events-none mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative h-full p-6 shadow-xl flex flex-col hover:-translate-y-1 transition-transform duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
          {card.icon}
        </div>
        
        {widget && <div className="relative z-10">{widget}</div>}
        
        <div className="relative z-10 flex flex-col gap-1 mt-auto">
          <h3 className="text-xl font-black text-white tracking-tight">{card.title}</h3>
          <p className="text-sm font-medium text-white/50 leading-relaxed">
            {card.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
