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
  const settledLoansCount = loans.filter(l => l.status === "PAID").length;

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
        <div className={`grid grid-cols-2 gap-3 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
          
          <div className="bg-white/5 border border-white/5 rounded-[1.25rem] p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Projected Profit</span>
            </div>
            <span className="text-lg font-black text-white">Rs. {Math.floor(totalInterest).toLocaleString("en-LK")}</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-[1.25rem] p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#34d399]">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Popular Loan</span>
            </div>
            <span className="text-lg font-black text-white">Rs. {Number(popularLoanAmount).toLocaleString("en-LK")}</span>
          </div>

          {bestCustomer && (
            <div className="bg-white/5 border border-white/5 rounded-[1.25rem] p-4 flex flex-col gap-2 col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#f472b6]">
                  <Star className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Top Client Volume</span>
                </div>
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 border border-white/20">
                   <img src={bestCustomer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(bestCustomer.name)}`} alt="Top Client" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                 <span className="text-sm font-bold text-white truncate max-w-[150px]">{bestCustomer.name}</span>
                 <span className="text-sm font-black text-[#f472b6]">Rs. {Math.floor(customerScores[bestCustomer.id]).toLocaleString("en-LK")}</span>
              </div>
            </div>
          )}

          <div className="bg-white/5 border border-white/5 rounded-[1.25rem] p-4 flex flex-col gap-2 col-span-2 flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-white/60">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wide">Successfully Settled Loans</span>
            </div>
            <span className="text-lg font-black text-white">{settledLoansCount}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
