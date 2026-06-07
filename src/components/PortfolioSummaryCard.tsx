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
    <div className="w-full relative rounded-[2rem] overflow-hidden bg-[#0a0514] border border-white/10 shadow-2xl transition-all duration-500 h-full flex flex-col justify-between p-6 sm:p-8">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 flex flex-col gap-6 h-full">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Portfolio Summary</h2>
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm backdrop-blur-sm">
            {totalLoans} Total Records
          </div>
        </div>

        {/* Main Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Capital */}
          <div className="group relative flex flex-col justify-between min-h-[140px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2 mb-2 text-white/50 text-[11px] font-bold uppercase tracking-wider">
              <Landmark className="w-4 h-4 text-white/60" /> Total Capital
            </div>
            <span className="relative text-2xl sm:text-3xl font-black tracking-tighter text-white" title={formatLKR(totalCapital)}>
              {formatLKR(totalCapital)}
            </span>
          </div>

          {/* Expected Interest */}
          <div className="group relative flex flex-col justify-between min-h-[140px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2 mb-2 text-white/50 text-[11px] font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Expected Interest
            </div>
            <div className="relative flex flex-col">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white" title={formatLKR(totalInterest)}>
                {formatLKR(totalInterest)}
              </span>
              <span className="text-[11px] text-emerald-400 font-bold mt-1">~{roi}% ROI</span>
            </div>
          </div>

          {/* Total Collected */}
          <div className="group relative flex flex-col justify-between min-h-[140px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2 mb-2 text-white/50 text-[11px] font-bold uppercase tracking-wider">
              <ArrowDownToLine className="w-4 h-4 text-primary" /> Collected
            </div>
            <span className="relative text-2xl sm:text-3xl font-black tracking-tighter text-white" title={formatLKR(totalCollected)}>
              {formatLKR(totalCollected)}
            </span>
          </div>

          {/* Outstanding Balance */}
          <div className="group relative flex flex-col justify-between min-h-[140px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2 mb-2 text-white/50 text-[11px] font-bold uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-orange-400" /> Outstanding
            </div>
            <span className="relative text-2xl sm:text-3xl font-black tracking-tighter text-white" title={formatLKR(outstandingBalance)}>
              {formatLKR(outstandingBalance)}
            </span>
          </div>
        </div>

        {/* Secondary Metrics / Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 mt-auto">
          
          {/* Active Loans */}
          <div className="flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xl font-black text-white">{activeLoans}</span>
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Loans</span>
          </div>

          {/* Settled Loans */}
          <div className="flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-black text-white">{settledLoans}</span>
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Settled Loans</span>
          </div>

          {/* Defaulted Loans */}
          <div className="flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-xl font-black text-white">{defaultedLoans}</span>
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Defaulted</span>
          </div>

          {/* Average Size */}
          <div className="flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-xl font-black text-white mb-1 tracking-tight">{formatLKR(avgLoanSize)}</span>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Avg. Loan Size</span>
          </div>
        </div>

        {/* Popular Loan Sizes */}
        {topLoanSizes.length > 0 && (
          <div className="pt-5 border-t border-white/10">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Popular Packages</h3>
            <div className="flex flex-wrap gap-2">
              {topLoanSizes.map(({ amount, count }) => (
                <div key={amount} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/[0.08] transition-colors">
                  <span className="text-xs font-bold text-white">{formatLKR(amount)}</span>
                  <span className="text-[10px] font-black text-primary bg-primary/20 px-2 py-0.5 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
