import { getCustomers, getDashboardInstallments, getLoans } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { DashboardRoster } from "@/components/DashboardRoster";
import { ArrowLeft, Radio } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const [customers, loans, installments] = await Promise.all([
    getCustomers(),
    getLoans(),
    getDashboardInstallments(),
  ]);

  const pendingInstallments = installments.filter(i => i.status === "PENDING" || i.status === "MISSED");

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-28 md:pb-12 px-4 pt-6 min-h-screen max-w-[1400px] mx-auto">
      
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6 text-primary" />
              <h1 className="text-2xl md:text-[32px] font-black tracking-tight text-white">
                Live Action Feed
              </h1>
            </div>
            <p className="text-sm text-white/50 font-medium">Real-time updates and pending actions across your roster.</p>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="rounded-[2rem] bg-[#0A0514]/40 border border-white/5 p-6 lg:p-8 shadow-sm backdrop-blur-sm min-h-[500px]">
        <DashboardRoster
          pendingInstallments={pendingInstallments}
          customers={customers}
          loans={loans}
        />
      </div>

      <BottomNav />
    </div>
  );
}
