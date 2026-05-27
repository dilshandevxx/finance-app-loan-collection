import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { NewLoanForm } from "@/components/NewLoanForm";

export default function NewLoan() {
  return (
    <div className="flex flex-col gap-8 pb-32 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-2">
        <Link href="/">
          <button className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-[#222] flex items-center justify-center text-white hover:bg-[#111] transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-white/70 font-medium tracking-tight">New Loan Account</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="max-w-2xl mx-auto w-full">
        <Card className="bg-[#0a0a0a] border-[#222] rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-6 md:p-8 flex flex-col gap-6">
            <NewLoanForm />
          </CardContent>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
}
