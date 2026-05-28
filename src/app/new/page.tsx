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
      <header className="w-full flex items-center justify-between mb-2">
        <Link href="/">
          <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-[#111] transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-gray-600 dark:text-white/70 font-semibold tracking-tight text-sm sm:text-base">New Loan Account</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="max-w-2xl mx-auto w-full">
        <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-4 sm:p-8 flex flex-col gap-6">
            <NewLoanForm customers={customers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
