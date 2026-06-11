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
      {/* Segmented Control Tab Navigation */}
      <div className="w-full bg-card/60 backdrop-blur-xl border border-border/40 p-1.5 rounded-[1.25rem] sm:rounded-[1.75rem] flex items-center shadow-sm">
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
              className={`flex-1 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-bold transition-all ${
                isActive 
                  ? "bg-background shadow-sm text-foreground scale-100" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 scale-[0.98]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "overview" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              <Card className="col-span-2 bg-card/60 backdrop-blur-md border-border/40 rounded-3xl shadow-sm overflow-hidden relative">
                <CardContent className="p-5 sm:p-6 flex justify-between items-center relative z-10">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Status</span>
                    <span className={`font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 uppercase tracking-widest w-fit ${
                      loan.status === "PAID_OFF" 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : loan.status === "DEFAULTED"
                        ? "text-destructive-foreground bg-destructive/10 border border-destructive/20"
                        : "text-primary bg-primary/10 border border-primary/20"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        loan.status === "PAID_OFF" ? "bg-emerald-500" : loan.status === "DEFAULTED" ? "bg-destructive" : "bg-primary"
                      }`} />
                      {loan.status === "PAID_OFF" ? "Fully Paid" : loan.status === "DEFAULTED" ? "Defaulted" : "Active"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Start Date</span>
                    <span className="font-bold text-foreground text-sm">{new Date(loan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 backdrop-blur-md border-border/40 rounded-3xl shadow-sm">
                <CardContent className="p-5 flex flex-col">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Given Amount</span>
                  <span className="font-black text-xl text-foreground tracking-tight">{formatLKR(loan.principalAmount)}</span>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 backdrop-blur-md border-border/40 rounded-3xl shadow-sm">
                <CardContent className="p-5 flex flex-col">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">With Interest</span>
                  <span className="font-black text-xl text-foreground tracking-tight">{formatLKR(loan.totalAmountDue)}</span>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 backdrop-blur-md border-border/40 rounded-3xl shadow-sm">
                <CardContent className="p-5 flex flex-col">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Weekly</span>
                  <span className="font-black text-xl text-foreground tracking-tight">{formatLKR(loan.weeklyInstallment)}</span>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 backdrop-blur-md border-border/40 rounded-3xl shadow-sm">
                <CardContent className="p-5 flex flex-col">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2">Total Paid</span>
                  <span className="font-black text-xl text-primary tracking-tight">{formatLKR(loan.totalAmountDue - loan.remainingBalance)}</span>
                </CardContent>
              </Card>

              {nextInstallment && (
                <Card className="col-span-2 bg-primary/5 dark:bg-primary/10 border-primary/20 rounded-3xl shadow-sm overflow-hidden">
                  <CardContent className="p-5 sm:p-6 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">Next Payment Due</span>
                      <span className="text-sm font-bold text-muted-foreground">{new Date(nextInstallment.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span className="font-black text-2xl text-primary tracking-tight">{formatLKR(nextInstallment.amount)}</span>
                  </CardContent>
                </Card>
              )}

            </div>
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
