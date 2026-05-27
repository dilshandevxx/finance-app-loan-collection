"use client";

import { useState, useTransition } from "react";
import { Phone, MessageSquare, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickPaymentModal } from "@/components/QuickPaymentModal";
import { markInstallmentPaid } from "@/app/actions";
import { Customer, Loan, Installment } from "@/data/mock";

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
      <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors">
        <MessageCircle className="w-5 h-5" />
      </a>
    </div>
  );
}

type CustomerPaymentActionsProps = {
  customer: Customer;
  loan: Loan;
  nextInstallment?: Installment;
};

export function CustomerPaymentActions({ customer, loan, nextInstallment }: CustomerPaymentActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmPayment = (amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!nextInstallment) return resolve();
      
      startTransition(async () => {
        try {
          await markInstallmentPaid(nextInstallment.id);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  return (
    <>
      <div className="flex gap-3 w-full">
        <Button 
          onClick={() => setIsModalOpen(true)}
          disabled={!nextInstallment || isPending}
          className="flex-1 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-xl font-medium h-12 md:h-14 shadow-sm disabled:opacity-50"
        >
          {isPending ? "Processing..." : "Mark Paid"}
        </Button>
        <Button variant="outline" className="flex-1 border-gray-200 dark:border-[#222] bg-white dark:bg-[#0a0a0a] md:bg-transparent rounded-xl hover:bg-gray-50 dark:hover:bg-[#111] md:dark:hover:bg-[#222] text-black dark:text-white h-12 md:h-14 shadow-sm md:shadow-none">
          Edit
        </Button>
      </div>

      {nextInstallment && (
        <QuickPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customer={customer}
          expectedAmount={nextInstallment.amount}
          installmentId={nextInstallment.id}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
}
