"use client";

import { useState } from "react";
import { Loan, Customer } from "@/data/db";
import { ChevronDown, TrendingUp, Star, Target, CheckCircle2 } from "lucide-react";

interface BigPortfolioHeaderProps {
  loans: Loan[];
  customers?: Customer[];
}

export function BigPortfolioHeader({ loans, customers }: BigPortfolioHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeLoans = loans.filter(l => l.status === "ACTIVE");
  const totalCapital = activeLoans.reduce((sum, l) => sum + l.principalAmount, 0);
  const expectedReturn = activeLoans.reduce((sum, l) => sum + l.totalAmountDue, 0);
  const activeClients = Array.from(new Set(activeLoans.map(l => l.customerId))).length;

  // Advanced Stats
  const totalInterest = expectedReturn - totalCapital;
  
  // Popular Loan Amount
  const amountCounts = loans.reduce((acc, l) => {
    acc[l.principalAmount] = (acc[l.principalAmount] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const popularLoanAmount = Object.entries(amountCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Best Customer (Highest Volume)
  const customerScores = loans.reduce((acc, l) => {
    acc[l.customerId] = (acc[l.customerId] || 0) + l.principalAmount;
    return acc;
  }, {} as Record<string, number>);
  const bestCustomerId = Object.entries(customerScores).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bestCustomer = customers?.find(c => c.id === bestCustomerId);

  // Settled Loans Count
  const settledLoansCount = loans.filter(l => l.status === "PAID_OFF").length;

  return (
    <div className="w-full relative rounded-[2rem] overflow-hidden bg-[#0a0514] border border-white/10 shadow-2xl mb-2 transition-all duration-500">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Portfolio</h1>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm backdrop-blur-sm">
            Overview
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Total Capital</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-white/40">Rs.</span>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
                {Math.floor(totalCapital).toLocaleString("en-LK")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Expected Return</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-white/40">Rs.</span>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">
                {Math.floor(expectedReturn).toLocaleString("en-LK")}
              </span>
            </div>
          </div>
        </div>
        
        <div className="pt-5 border-t border-white/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Clients</span>
              <span className="text-lg font-bold text-white">{activeClients}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Loans</span>
              <span className="text-lg font-bold text-white">{activeLoans.length}</span>
            </div>
            <div className="flex flex-col text-right items-end">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-colors active:scale-95"
              >
                Analytics <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
        </div>

        {/* Expandable Advanced Analytics */}
        <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
          
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory -mx-6 px-6 sm:-mx-8 sm:px-8">
            
            {/* 1. Projected Profit */}
            <div className="group relative flex flex-col justify-between w-[160px] min-h-[170px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 snap-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 leading-tight">Projected<br/>Profit</span>
              </div>
              <div className="relative flex flex-col">
                <span className="text-[10px] font-bold text-primary mb-0.5">Rs.</span>
                <span className="text-xl font-black text-white tracking-tighter leading-none">{Math.floor(totalInterest).toLocaleString("en-LK")}</span>
              </div>
            </div>

            {/* 2. Popular Loan */}
            <div className="group relative flex flex-col justify-between w-[160px] min-h-[170px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 snap-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#34d399]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#34d399]/20 flex items-center justify-center text-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 leading-tight">Popular<br/>Loan</span>
              </div>
              <div className="relative flex flex-col">
                <span className="text-[10px] font-bold text-[#34d399] mb-0.5">Rs.</span>
                <span className="text-xl font-black text-white tracking-tighter leading-none">{Number(popularLoanAmount).toLocaleString("en-LK")}</span>
              </div>
            </div>

            {/* 3. Avg Loan Size */}
            <div className="group relative flex flex-col justify-between w-[160px] min-h-[170px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 snap-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 leading-tight">Avg Loan<br/>Size</span>
              </div>
              <div className="relative flex flex-col">
                <span className="text-[10px] font-bold text-blue-400 mb-0.5">Rs.</span>
                <span className="text-xl font-black text-white tracking-tighter leading-none">{activeLoans.length > 0 ? Math.floor(totalCapital / activeLoans.length).toLocaleString("en-LK") : 0}</span>
              </div>
            </div>

            {/* 4. Top Client Volume */}
            {bestCustomer && (
              <div className="group relative flex flex-col justify-between w-[220px] min-h-[170px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 snap-center shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f472b6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f472b6]/20 flex items-center justify-center text-[#f472b6] shadow-[0_0_15px_rgba(244,114,182,0.3)]">
                      <Star className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 leading-tight">Top Client<br/>Volume</span>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white font-black text-sm ring-2 ring-white/10 shadow-lg">
                    {bestCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="relative flex flex-col mt-auto">
                  <span className="text-[13px] font-extrabold text-white truncate mb-1">{bestCustomer.name}</span>
                  <div className="flex items-baseline gap-1">
                     <span className="text-[10px] font-bold text-[#f472b6]">Rs.</span>
                     <span className="text-xl font-black text-[#f472b6] tracking-tighter leading-none">{Math.floor(customerScores[bestCustomer.id]).toLocaleString("en-LK")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Settled Loans */}
            <div className="group relative flex flex-col justify-between w-[160px] min-h-[170px] shrink-0 p-5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 snap-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 leading-tight">Total<br/>Settled</span>
              </div>
              <div className="relative mt-auto">
                <span className="text-4xl font-black text-white tracking-tighter leading-none">{settledLoansCount}</span>
              </div>
            </div>
            
            {/* Spacing element to prevent right-edge cutoff */}
            <div className="shrink-0 w-2 sm:w-4" aria-hidden="true" />

          </div>
        </div>

      </div>
    </div>
  );
}
