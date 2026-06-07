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
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          
          <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory -mx-6 px-6 sm:-mx-8 sm:px-8">
            
            {/* 1. Projected Profit */}
            <div className="flex flex-col justify-between w-[150px] shrink-0 p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 transition-colors snap-start">
              <div className="flex flex-col gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Projected Profit</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">Rs. {Math.floor(totalInterest).toLocaleString("en-LK")}</span>
            </div>

            {/* 2. Popular Loan */}
            <div className="flex flex-col justify-between w-[150px] shrink-0 p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 transition-colors snap-start">
              <div className="flex flex-col gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#34d399]/20 flex items-center justify-center text-[#34d399]">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Popular Loan</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">Rs. {Number(popularLoanAmount).toLocaleString("en-LK")}</span>
            </div>

            {/* 3. Avg Loan Size */}
            <div className="flex flex-col justify-between w-[150px] shrink-0 p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 transition-colors snap-start">
              <div className="flex flex-col gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Avg Loan Size</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">Rs. {activeLoans.length > 0 ? Math.floor(totalCapital / activeLoans.length).toLocaleString("en-LK") : 0}</span>
            </div>

            {/* 4. Top Client Volume */}
            {bestCustomer && (
              <div className="flex flex-col justify-between w-[200px] shrink-0 p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 transition-colors snap-start">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#f472b6]/20 flex items-center justify-center text-[#f472b6]">
                      <Star className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Top Client</span>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white font-black text-xs ring-2 ring-white/5">
                    {bestCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-white truncate">{bestCustomer.name}</span>
                  <span className="text-lg font-black text-[#f472b6] tracking-tight">Rs. {Math.floor(customerScores[bestCustomer.id]).toLocaleString("en-LK")}</span>
                </div>
              </div>
            )}

            {/* 5. Settled Loans */}
            <div className="flex flex-col justify-between w-[150px] shrink-0 p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 transition-colors snap-start">
              <div className="flex flex-col gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Total Settled</span>
              </div>
              <span className="text-3xl font-black text-white tracking-tight">{settledLoansCount}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
