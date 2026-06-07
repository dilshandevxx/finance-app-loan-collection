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
      <div className="flex bg-secondary/50 p-1.5 rounded-2xl w-full border border-border/50 shadow-sm overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === "timeline"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
            activeTab === "notes"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          Settings & Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "overview" && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-semibold mb-4 text-foreground tracking-tight">Loan Details</h3>
            <Card className="bg-white dark:bg-card border-gray-200 dark:border-border rounded-2xl shadow-sm">
              <CardContent className="p-6">
                {/* Structure matching original page.tsx */}
                <div className="flex flex-col gap-3 pb-4 border-b border-gray-100 dark:border-border/50">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Principal (Given)</span>
                      <span className="text-xs text-muted-foreground/70">Amount customer received</span>
                    </div>
                    <span className="font-bold text-lg text-foreground">{formatLKR(loan.principalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Full Amount</span>
                      <span className="text-xs text-muted-foreground/70">Principal + Interest</span>
                    </div>
                    <span className="font-bold text-lg text-foreground">{formatLKR(loan.totalAmountDue)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-4 border-b border-gray-100 dark:border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Weekly Installment</span>
                    <span className="font-semibold text-foreground">{formatLKR(loan.weeklyInstallment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Installments</span>
                    <span className="font-semibold text-foreground">{paidCount} of {installments.length} paid</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-4 border-b border-gray-100 dark:border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Total Paid So Far</span>
                    <span className="font-semibold text-primary">{formatLKR(loan.totalAmountDue - loan.remainingBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-muted/50 -mx-2 px-3 py-2.5 rounded-xl">
                    <span className="font-bold text-foreground text-sm">Remaining Balance</span>
                    <span className="font-black text-lg text-foreground">{formatLKR(loan.remainingBalance)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Start Date</span>
                    <span className="font-medium text-foreground text-sm">{new Date(loan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Status</span>
                    <span className={`font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 uppercase tracking-wide ${
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
                    <div className="flex justify-between items-center mt-1 bg-primary/5 dark:bg-primary/10 -mx-2 px-3 py-2.5 rounded-xl border border-primary/10">
                      <div className="flex flex-col">
                        <span className="text-primary text-xs font-bold uppercase tracking-wide">Next Payment Due</span>
                        <span className="text-xs text-muted-foreground">{new Date(nextInstallment.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className="font-bold text-primary">{formatLKR(nextInstallment.amount)}</span>
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
