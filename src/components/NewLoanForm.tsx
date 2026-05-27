"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createLoan } from "@/app/actions";

export function NewLoanForm() {
  const [principal, setPrincipal] = useState<number>(0);
  const [interest, setInterest] = useState<number>(10);
  const [weeks, setWeeks] = useState<number>(10);

  const calculateInstallment = () => {
    if (weeks <= 0) return 0;
    const totalDue = principal * (1 + interest / 100);
    return totalDue / weeks;
  };

  const installmentAmount = calculateInstallment();

  return (
    <form action={createLoan} className="flex flex-col gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label htmlFor="name" className="text-sm font-medium text-white/70">Full Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              required
              placeholder="e.g. John Doe" 
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
            />
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label htmlFor="memberId" className="text-sm font-medium text-white/70">Member ID / Account #</label>
            <input 
              type="text" 
              id="memberId"
              name="memberId"
              placeholder="e.g. M-1004" 
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-white/70">Phone Number</label>
          <input 
            type="tel" 
            id="phone"
            name="phone"
            required
            placeholder="e.g. 555-0199" 
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
          />
        </div>
      </div>

      <div className="w-full h-px bg-white/5 my-2" />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Loan Details</h3>
        <div className="space-y-2">
          <label htmlFor="principal" className="text-sm font-medium text-white/70">Principal Amount ($)</label>
          <input 
            type="number" 
            id="principal"
            name="principal"
            required
            min="0"
            step="0.01"
            value={principal || ""}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
            placeholder="0.00" 
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="interest" className="text-sm font-medium text-white/70">Interest (%)</label>
            <input 
              type="number" 
              id="interest"
              name="interest"
              required
              min="0"
              step="0.1"
              value={interest || ""}
              onChange={(e) => setInterest(parseFloat(e.target.value) || 0)}
              placeholder="10" 
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="weeks" className="text-sm font-medium text-white/50">Weeks</label>
            <input 
              type="number" 
              id="weeks"
              name="weeks"
              required
              min="1"
              value={weeks || ""}
              onChange={(e) => setWeeks(parseInt(e.target.value) || 0)}
              placeholder="10" 
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-5 flex justify-between items-center mt-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white/50">Calculated Installment</span>
          <span className="text-2xl font-bold text-white tracking-tight">${installmentAmount.toFixed(2)} <span className="text-sm text-white/40 font-medium">/ week</span></span>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent z-50">
        <div className="bg-[#111] p-2 rounded-2xl border border-[#222] shadow-2xl backdrop-blur-xl">
          <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 rounded-xl h-14 text-base font-semibold shadow-sm">
            Create Loan Account
          </Button>
        </div>
      </div>

      <Button type="submit" className="hidden md:flex w-full bg-white text-black hover:bg-white/90 rounded-xl h-14 text-lg font-semibold mt-4 shadow-sm">
        Create Loan Account
      </Button>
    </form>
  );
}
