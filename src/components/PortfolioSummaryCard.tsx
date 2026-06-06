import { formatLKR } from "@/lib/format";
import { Loan } from "@/data/db";
import { Briefcase, Landmark, TrendingUp, CheckCircle, Clock } from "lucide-react";

interface PortfolioSummaryCardProps {
  loans: Loan[];
}

export function PortfolioSummaryCard({ loans }: PortfolioSummaryCardProps) {
  const totalLoans = loans.length;
  const activeLoans = loans.filter((l) => l.status === "ACTIVE").length;
  const settledLoans = loans.filter((l) => l.status === "PAID_OFF").length;

  const totalCapital = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalExpectedReturn = loans.reduce((sum, l) => sum + l.totalAmountDue, 0);
  const totalInterest = totalExpectedReturn - totalCapital;

  return (
    <div className="w-full rounded-[2rem] bg-card border border-border p-6 flex flex-col gap-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-bold tracking-tight text-foreground">Portfolio Summary</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Capital */}
        <div className="flex flex-col gap-1 bg-secondary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <Landmark className="w-3.5 h-3.5" /> Total Capital
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-foreground" title={formatLKR(totalCapital)}>
            {formatLKR(totalCapital)}
          </span>
        </div>

        {/* Total Interest */}
        <div className="flex flex-col gap-1 bg-secondary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Expected Interest
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-foreground" title={formatLKR(totalInterest)}>
            {formatLKR(totalInterest)}
          </span>
        </div>

        {/* Total Expected Return */}
        <div className="flex flex-col gap-1 bg-secondary/30 p-4 rounded-2xl col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <Landmark className="w-3.5 h-3.5 text-primary" /> Total Expected
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-foreground" title={formatLKR(totalExpectedReturn)}>
            {formatLKR(totalExpectedReturn)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20">
          <span className="text-xl font-black">{totalLoans}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Loans</span>
        </div>
        
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-xl font-black">{activeLoans}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Active</span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span className="text-xl font-black">{settledLoans}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Settled</span>
        </div>
      </div>
    </div>
  );
}
