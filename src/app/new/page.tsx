import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewLoanForm } from "@/components/NewLoanForm";
import { getCustomers } from "@/data/db";

export const dynamic = 'force-dynamic';

export default async function NewLoan() {
  const customers = await getCustomers();

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-32 md:pb-12 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <header className="w-full flex items-center justify-between bg-gradient-to-br from-neutral-50/60 via-white to-neutral-100/40 dark:from-[#1a1a1c] dark:via-[#141416] dark:to-[#0c0c0d] p-4 rounded-[1.75rem] border border-neutral-200 dark:border-neutral-800/60 shadow-sm relative overflow-hidden mb-2">
        <Link href="/">
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#1f1f21] transition-colors shadow-sm cursor-pointer relative z-10">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-sm font-semibold tracking-tight text-black dark:text-white">New Loan Account</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="max-w-2xl mx-auto w-full">
        <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-4 sm:p-8 flex flex-col gap-6">
            <NewLoanForm customers={customers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
