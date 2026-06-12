"use client";

import { useState, useTransition } from "react";
import { Phone, MessageSquare, MessageCircle, Banknote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickPaymentModal } from "@/components/QuickPaymentModal";
import { markInstallmentPaid } from "@/app/actions";
import { Customer, Loan, Installment } from "@/data/db";
import { phoneToDial } from "@/lib/format";

export function CustomerContactActions({ customer }: { customer: Customer }) {
  const phone = customer.phone.replace(/[^0-9]/g, '');

  return (
    <div className="flex items-center gap-3 mt-4 w-full justify-center">
      <a href={`tel:${phone}`} className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
        <Phone className="w-5 h-5" />
      </a>
      <a href={`sms:${phone}`} className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors">
        <MessageSquare className="w-5 h-5" />
      </a>
      <a href={`https://wa.me/${phoneToDial(customer.phone)}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors">
        <MessageCircle className="w-5 h-5" />
      </a>
    </div>
  );
}

type CustomerPaymentActionsProps = {
  customer: Customer;
  loan: Loan;
  nextInstallment?: Installment;
  nextInstallmentIndex?: number;
  isFloating?: boolean;
};

export function CustomerPaymentActions({ customer, loan, nextInstallment, nextInstallmentIndex, isFloating }: CustomerPaymentActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmPayment = (amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!nextInstallment) return resolve();

      startTransition(async () => {
        try {
          if (!navigator.onLine) {
            const queueStr = localStorage.getItem("offlineSyncQueue");
            const queue = queueStr ? JSON.parse(queueStr) : [];
            queue.push({
              type: "markInstallmentPaid",
              installmentId: nextInstallment.id,
              amount: amount,
              timestamp: Date.now()
            });
            localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));
            resolve();
          } else {
            await markInstallmentPaid(nextInstallment.id, amount);
            resolve();
          }
        } catch (err) {
          const error = err as Error;
          if (error?.message?.includes("fetch") || error?.message?.includes("network")) {
            const queueStr = localStorage.getItem("offlineSyncQueue");
            const queue = queueStr ? JSON.parse(queueStr) : [];
            queue.push({
              type: "markInstallmentPaid",
              installmentId: nextInstallment.id,
              amount: amount,
              timestamp: Date.now()
            });
            localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));
            resolve();
          } else {
            reject(err);
          }
        }
      });
    });
  };

  return (
    <>
      <div className={`flex gap-3 ${isFloating ? 'w-auto' : 'w-full'}`}>
        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={!nextInstallment || isPending}
          className={`relative overflow-hidden group shadow-[0_8px_30px_rgb(16,185,129,0.3)] disabled:opacity-50 transition-all duration-300 active:scale-[0.98] border-none p-0 ${
            isFloating 
              ? 'rounded-full h-12 sm:h-14 px-5 sm:px-6 shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:-translate-y-0.5'
              : 'w-full rounded-xl h-12'
          }`}
        >
          {/* Vibrant Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 group-hover:from-emerald-400 group-hover:via-teal-400 group-hover:to-emerald-500 transition-colors duration-500" />
          
          {/* Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 left-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </div>

          {/* Button Content */}
          <div className="relative flex items-center justify-center gap-2.5 w-full h-full text-white px-2">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-extrabold text-[12px] sm:text-[14px] tracking-widest uppercase text-white/90">Processing...</span>
              </>
            ) : (
              <>
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 group-hover:scale-110 transition-transform duration-300 drop-shadow-md text-white" />
                <span className="font-extrabold text-[12px] sm:text-[14px] tracking-widest uppercase drop-shadow-md text-white">Pay</span>
              </>
            )}
          </div>
        </Button>
      </div>

      {nextInstallment && (
        <QuickPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customer={customer}
          expectedAmount={nextInstallment.amount}
          installmentId={nextInstallment.id}
          installmentIndex={nextInstallmentIndex}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
}
