import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { NewLoanForm } from "@/components/NewLoanForm";

export default function NewLoan() {
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between mb-2">
        <Link href="/">
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-white/70 font-medium">New Customer & Loan</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="max-w-2xl mx-auto w-full">
        <Card className="bg-[#121214] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        {/* Abstract background shapes */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <CardContent className="p-8 flex flex-col gap-6">
          
          <NewLoanForm />
          
        </CardContent>
      </Card>
      </div>
      
      <BottomNav />
    </div>
  );
}
