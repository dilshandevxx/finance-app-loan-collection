"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createLoan } from "@/app/actions";
import { MOCK_CUSTOMERS } from "@/data/mock";
import { User, Hash, Phone, DollarSign, Percent, CalendarDays, CheckCircle2 } from "lucide-react";

export function NewLoanForm() {
  const [isExisting, setIsExisting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
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
    <form action={createLoan} className="flex flex-col gap-8">
      
      {/* Segmented Control for Customer Type */}
      <div className="bg-gray-100/80 dark:bg-[#111] p-1.5 rounded-2xl flex items-center relative overflow-hidden">
        <div 
          className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#222] rounded-xl shadow-sm transition-all duration-300 ease-out" 
          style={{ left: isExisting ? 'calc(50% + 3px)' : '6px' }}
        />
        <button
          type="button"
          onClick={() => setIsExisting(false)}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors relative z-10 ${!isExisting ? 'text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          New Customer
        </button>
        <button
          type="button"
          onClick={() => setIsExisting(true)}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors relative z-10 ${isExisting ? 'text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Existing Customer
        </button>
      </div>

      <div className="space-y-5">
        <h3 className="text-lg font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
          Customer Information
        </h3>

        {isExisting ? (
          <div className="space-y-2">
            <label htmlFor="existingCustomerId" className="text-sm font-medium text-gray-700 dark:text-white/70">Select Customer</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 dark:text-white/40" />
              </div>
              <select
                id="existingCustomerId"
                name="existingCustomerId"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20 transition shadow-sm dark:shadow-none appearance-none font-medium"
                required
              >
                <option value="" disabled>Select a customer...</option>
                {MOCK_CUSTOMERS.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (ID: {c.memberId || c.id})</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-white/70">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-white/40" />
                </div>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. John Doe" 
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition shadow-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label htmlFor="memberId" className="text-sm font-medium text-gray-700 dark:text-white/70">Member ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400 dark:text-white/40" />
                </div>
                <input 
                  type="text" 
                  id="memberId"
                  name="memberId"
                  placeholder="e.g. M-1004" 
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition shadow-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-white/70">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 dark:text-white/40" />
                </div>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone"
                  required
                  placeholder="e.g. 555-0199" 
                  className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition shadow-sm font-medium"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full h-px bg-gray-100 dark:bg-[#222]" />

      <div className="space-y-5">
        <h3 className="text-lg font-bold text-black dark:text-white tracking-tight flex items-center gap-2">
          Loan Details
        </h3>
        
        <div className="space-y-2">
          <label htmlFor="principal" className="text-sm font-medium text-gray-700 dark:text-white/70">Principal Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-black dark:text-white" />
            </div>
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
              className="w-full bg-white dark:bg-[#0a0a0a] border-2 border-gray-200 dark:border-[#222] focus:border-black dark:focus:border-white rounded-2xl pl-11 pr-4 py-4 text-2xl font-bold text-black dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none transition-colors shadow-sm"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="interest" className="text-sm font-medium text-gray-700 dark:text-white/70">Interest Rate</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Percent className="h-5 w-5 text-gray-400 dark:text-white/40" />
              </div>
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
                className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition shadow-sm font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="weeks" className="text-sm font-medium text-gray-700 dark:text-white/70">Duration</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CalendarDays className="h-5 w-5 text-gray-400 dark:text-white/40" />
              </div>
              <input 
                type="number" 
                id="weeks"
                name="weeks"
                required
                min="1"
                value={weeks || ""}
                onChange={(e) => setWeeks(parseInt(e.target.value) || 0)}
                placeholder="10" 
                className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-2xl pl-11 pr-4 py-3.5 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition shadow-sm font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculated Installment Summary */}
      <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 flex justify-between items-center mt-2 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Calculated Installment</span>
          <span className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-300 tracking-tight">
            ${installmentAmount.toFixed(2)} <span className="text-base text-emerald-600 dark:text-emerald-500 font-medium">/ week</span>
          </span>
        </div>
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Mobile Sticky Action */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white dark:from-black dark:via-black to-transparent z-50">
        <div className="bg-white dark:bg-[#111] p-2 rounded-2xl border border-gray-200 dark:border-[#222] shadow-2xl backdrop-blur-xl">
          <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-xl h-14 text-base font-semibold shadow-sm transition-all active:scale-[0.98]">
            Create Loan Account
          </Button>
        </div>
      </div>

      {/* Desktop Action */}
      <Button type="submit" className="hidden md:flex w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-2xl h-14 text-lg font-semibold mt-4 shadow-sm transition-all active:scale-[0.98]">
        Create Loan Account
      </Button>
    </form>
  );
}
