"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, DollarSign, MessageCircle } from "lucide-react";
import { Customer } from "@/data/mock";

type QuickPaymentModalProps = {
  customer: Customer;
  expectedAmount: number;
  installmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
};

export function QuickPaymentModal({
  customer,
  expectedAmount,
  installmentId,
  isOpen,
  onClose,
  onConfirm,
}: QuickPaymentModalProps) {
  const [amount, setAmount] = useState<string>(expectedAmount.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(expectedAmount.toString());
      setIsSuccess(false);
      setIsOfflineSaved(false);
      setIsProcessing(false);
    }
  }, [isOpen, expectedAmount]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    const finalAmount = parseFloat(amount) || expectedAmount;
    
    try {
      // Check online status first
      if (typeof window !== 'undefined' && !navigator.onLine) {
        throw new Error("offline");
      }
      
      await onConfirm(finalAmount);
      setIsSuccess(true);
    } catch (error) {
      // If offline or network error, save to queue
      if (typeof window !== 'undefined' && (!navigator.onLine || (error as Error).message === "offline")) {
        const queue = JSON.parse(localStorage.getItem("offlineSyncQueue") || "[]");
        queue.push({
          type: "markInstallmentPaid",
          installmentId,
          amount: finalAmount,
          timestamp: Date.now()
        });
        localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));
        setIsOfflineSaved(true);
        setIsSuccess(true);
      } else {
        console.error("Payment failed", error);
        // Show generic error or toast (omitted for brevity)
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppShare = () => {
    const finalAmount = parseFloat(amount) || expectedAmount;
    const phone = customer.phone.replace(/[^0-9]/g, '');
    const message = `Receipt: Payment of $${finalAmount.toFixed(2)} received on ${new Date().toLocaleDateString()}. Thank you! - LoanTrack Pro`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0 sm:pb-4">
      <div 
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#222] transform transition-all translate-y-0 sm:scale-100 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-[#1a1a1a]">
          <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">
            {isSuccess ? "Payment Recorded" : "Record Payment"}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {isSuccess ? (
          <div className="p-6 flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 ${isOfflineSaved ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-500' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500'}`}>
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-bold tracking-tighter text-black dark:text-white">${parseFloat(amount || expectedAmount.toString()).toFixed(2)}</span>
              <span className="text-sm font-medium text-gray-500 dark:text-white/50">Collected from {customer.name}</span>
            </div>

            {isOfflineSaved && (
              <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 p-3 rounded-xl text-sm font-medium w-full">
                Saved offline. Will sync automatically when internet is restored.
              </div>
            )}

            <div className="flex flex-col gap-3 w-full mt-2">
              <button
                onClick={handleWhatsAppShare}
                className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              >
                <MessageCircle className="w-5 h-5" /> Share Receipt
              </button>
              <button
                onClick={onClose}
                className="w-full h-14 bg-gray-100 hover:bg-gray-200 dark:bg-[#111] dark:hover:bg-[#222] text-black dark:text-white rounded-2xl font-bold text-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
        
        <div className="h-[env(safe-area-inset-bottom)] bg-white dark:bg-[#0a0a0a]" />
      </div>
    </div>
  );
}
