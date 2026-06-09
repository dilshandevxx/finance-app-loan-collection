"use client";

import { useState } from "react";
import { Loan, Installment, Customer, CustomerNote } from "@/data/db";
import { InstallmentTimeline } from "@/components/InstallmentTimeline";
import { CustomerOperations } from "@/components/CustomerOperations";
import { Card, CardContent } from "@/components/ui/card";
import { formatLKR } from "@/lib/format";

type CustomerTabsProps = {
  loan: Loan;
  installments: Installment[];
  customer: Customer;
  notes: CustomerNote[];
  paidCount: number;
  nextInstallment: Installment | undefined;
};

export function CustomerTabs({
  loan,
  installments,
  customer,
  notes,
  paidCount,
  nextInstallment,
}: CustomerTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "notes">("overview");

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Tab Navigation */}
      <div className="w-full -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2.5 min-w-max">
          {[
            { id: "overview", label: "Overview" },
            { id: "timeline", label: "Timeline" },
            { id: "notes", label: "Settings & Notes" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                  isActive 
                    ? "bg-foreground text-background shadow-md" 
                    : "bg-card text-muted-foreground border border-border/50 hover:bg-secondary/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "overview" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-semibold mb-4 text-foreground tracking-tight">Loan Details</h3>
            <Card className="bg-card/80 backdrop-blur-md border border-border/40 rounded-3xl shadow-sm">
              <CardContent className="p-6">
                {/* Structure matching original page.tsx */}
                <div className="flex flex-col gap-3 pb-5 border-b border-border/30">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Principal</span>
                      <span className="text-xs text-muted-foreground/70 font-semibold mt-0.5">Given amount</span>
                    </div>
                    <span className="font-bold text-lg text-foreground">{formatLKR(loan.principalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Full Amount</span>
                      <span className="text-xs text-muted-foreground/70 font-semibold mt-0.5">With Interest</span>
                    </div>
                    <span className="font-bold text-lg text-foreground">{formatLKR(loan.totalAmountDue)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-5 border-b border-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Weekly Installment</span>
                    <span className="font-bold text-foreground">{formatLKR(loan.weeklyInstallment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Installments</span>
                    <span className="font-bold text-foreground">{paidCount} of {installments.length} paid</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-5 border-b border-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Total Paid So Far</span>
                    <span className="font-bold text-primary">{formatLKR(loan.totalAmountDue - loan.remainingBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-secondary/50 -mx-3 px-4 py-3 rounded-2xl border border-border/40 mt-1">
                    <span className="font-black text-foreground text-xs uppercase tracking-widest">Remaining Balance</span>
                    <span className="font-black text-xl text-foreground">{formatLKR(loan.remainingBalance)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Start Date</span>
                    <span className="font-bold text-foreground text-sm">{new Date(loan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Status</span>
                    <span className={`font-black px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1.5 uppercase tracking-widest shadow-sm ${
                      loan.status === "PAID_OFF" 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : loan.status === "DEFAULTED"
                        ? "text-destructive-foreground bg-destructive/10 border border-destructive/20"
                        : "text-primary bg-primary/10 border border-primary/20"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        loan.status === "PAID_OFF" ? "bg-emerald-500" : loan.status === "DEFAULTED" ? "bg-destructive" : "bg-primary"
                      }`} />
                      {loan.status === "PAID_OFF" ? "Fully Paid" : loan.status === "DEFAULTED" ? "Defaulted" : "Active"}
                    </span>
                  </div>
                  {nextInstallment && (
                    <div className="flex justify-between items-center mt-2 bg-primary/5 dark:bg-primary/10 -mx-3 px-4 py-3 rounded-2xl border border-primary/10 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-primary text-[10px] font-black uppercase tracking-widest">Next Payment Due</span>
                        <span className="text-xs text-muted-foreground font-bold mt-0.5">{new Date(nextInstallment.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className="font-black text-primary text-lg">{formatLKR(nextInstallment.amount)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {activeTab === "timeline" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-semibold mb-4 text-foreground tracking-tight">Timeline</h3>
            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl overflow-hidden shadow-sm p-2">
              <CardContent className="p-0 relative">
                <InstallmentTimeline installments={installments} loan={loan} />
              </CardContent>
            </Card>
          </section>
        )}

        {activeTab === "notes" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <CustomerOperations customer={customer} loan={loan} notes={notes} />
          </section>
        )}
      </div>
    </div>
  );
}
