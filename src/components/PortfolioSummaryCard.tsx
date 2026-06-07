import { formatLKR } from "@/lib/format";
import { Loan } from "@/data/db";
import { Briefcase, Landmark, TrendingUp, CheckCircle, Clock, AlertTriangle, ArrowDownToLine, Wallet } from "lucide-react";

interface PortfolioSummaryCardProps {
  loans: Loan[];
}

export function PortfolioSummaryCard({ loans }: PortfolioSummaryCardProps) {
  const totalLoans = loans.length;
  const activeLoans = loans.filter((l) => l.status === "ACTIVE").length;
  const settledLoans = loans.filter((l) => l.status === "PAID_OFF").length;
  const defaultedLoans = loans.filter((l) => l.status === "DEFAULTED").length;

  const totalCapital = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalExpectedReturn = loans.reduce((sum, l) => sum + l.totalAmountDue, 0);
  const totalInterest = totalExpectedReturn - totalCapital;
  
  const totalCollected = loans.reduce((sum, l) => sum + (l.totalAmountDue - l.remainingBalance), 0);
  const outstandingBalance = loans.reduce((sum, l) => sum + l.remainingBalance, 0);

  const avgLoanSize = totalLoans > 0 ? totalCapital / totalLoans : 0;
  const roi = totalCapital > 0 ? Math.round((totalInterest / totalCapital) * 100) : 0;

  const topLoanSizes = (() => {
    const map = new Map<number, number>();
    loans.forEach(loan => {
      const p = loan.principalAmount;
      map.set(p, (map.get(p) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([amount, count]) => ({ amount, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Show top 5
  })();

  return (
    <div className="w-full rounded-[2rem] bg-card border border-border p-6 flex flex-col gap-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold tracking-tight text-foreground">Portfolio Summary</h2>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          {totalLoans} Total Records
        </div>
      </div>

      {/* Main Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Capital */}
        <div className="flex flex-col gap-1 bg-secondary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <Landmark className="w-3.5 h-3.5" /> Total Capital
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-foreground" title={formatLKR(totalCapital)}>
            {formatLKR(totalCapital)}
          </span>
        </div>

        {/* Expected Interest */}
        <div className="flex flex-col gap-1 bg-secondary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Expected Interest
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-foreground" title={formatLKR(totalInterest)}>
            {formatLKR(totalInterest)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">~{roi}% ROI</span>
        </div>

        {/* Total Collected */}
        <div className="flex flex-col gap-1 bg-secondary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <ArrowDownToLine className="w-3.5 h-3.5 text-primary" /> Collected
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-foreground" title={formatLKR(totalCollected)}>
            {formatLKR(totalCollected)}
          </span>
        </div>

        {/* Outstanding Balance */}
        <div className="flex flex-col gap-1 bg-secondary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5 text-orange-500" /> Outstanding
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-foreground" title={formatLKR(outstandingBalance)}>
            {formatLKR(outstandingBalance)}
          </span>
        </div>
      </div>

      {/* Secondary Metrics / Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/50">
        
        {/* Active Loans */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-xl font-black">{activeLoans}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Active Loans</span>
        </div>

        {/* Settled Loans */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span className="text-xl font-black">{settledLoans}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Settled Loans</span>
        </div>

        {/* Defaulted Loans */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-destructive" />
            <span className="text-xl font-black">{defaultedLoans}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Defaulted</span>
        </div>

        {/* Average Size */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary/20">
          <span className="text-lg font-black tracking-tight">{formatLKR(avgLoanSize)}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Avg. Loan Size</span>
        </div>
      </div>

      {/* Popular Loan Sizes */}
      {topLoanSizes.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Popular Loan Packages</h3>
          <div className="flex flex-wrap gap-2">
            {topLoanSizes.map(({ amount, count }) => (
              <div key={amount} className="flex items-center gap-1.5 bg-secondary/40 border border-border px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-foreground">{formatLKR(amount)}</span>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{count} clients</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
