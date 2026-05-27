import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";

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
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Customer Information</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. John Doe" 
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Phone Number</label>
              <input 
                type="tel" 
                placeholder="e.g. 555-0199" 
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              />
            </div>
          </div>

          <div className="w-full h-px bg-white/5 my-2" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Loan Details</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Principal Amount ($)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Interest (%)</label>
                <input 
                  type="number" 
                  placeholder="10" 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Weeks</label>
                <input 
                  type="number" 
                  placeholder="10" 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 flex justify-between items-center mt-2">
            <div className="flex flex-col">
              <span className="text-sm text-white/60">Calculated Installment</span>
              <span className="text-2xl font-bold text-white">$0.00 <span className="text-sm text-white/40 font-normal">/ week</span></span>
            </div>
          </div>

          <Button className="w-full bg-white text-black hover:bg-white/90 rounded-full h-14 text-lg font-semibold mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Create Loan Account
          </Button>
          
        </CardContent>
      </Card>
      </div>
      
      <BottomNav />
    </div>
  );
}
