"use client";

import { useState } from "react";
import { X, CheckCircle2, DollarSign } from "lucide-react";
import { Customer } from "@/data/mock";

type QuickPaymentModalProps = {
  customer: Customer;
  expectedAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
};

export function QuickPaymentModal({
  customer,
  expectedAmount,
  isOpen,
  onClose,
  onConfirm,
}: QuickPaymentModalProps) {
  const [amount, setAmount] = useState<string>(expectedAmount.toString());
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm(parseFloat(amount) || expectedAmount);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0 sm:pb-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#222] transform transition-all translate-y-0 sm:scale-100 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-[#1a1a1a]">
          <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">Record Payment</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#222]">
            <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-lg font-bold shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-black dark:text-white">{customer.name}</span>
              <span className="text-xs text-gray-500 dark:text-white/50">{customer.phone}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount Collected</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="h-6 w-6 text-black dark:text-white" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white dark:bg-[#0a0a0a] border-2 border-gray-200 focus:border-black dark:border-[#333] dark:focus:border-white rounded-2xl pl-12 pr-4 py-4 text-3xl font-bold text-black dark:text-white focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {[expectedAmount, 50, 100].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                  amount === preset.toString()
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-white text-black border-gray-200 hover:bg-gray-50 dark:bg-[#111] dark:text-white dark:border-[#333] dark:hover:bg-[#222]"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 sm:p-6 pt-0">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-black/90 dark:hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Confirm Payment
              </>
            )}
          </button>
        </div>
        
        {/* iOS bottom safe area padding */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white dark:bg-[#0a0a0a]" />
      </div>
    </div>
  );
}
