"use client";

import { useState, useTransition } from "react";
import { Plus, Calendar, DollarSign, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Customer, Loan, CustomerNote } from "@/data/db";
import { addCustomerNote, postponeInstallments, restructureWeeklyInstallment } from "@/app/actions";

type CustomerOperationsProps = {
  customer: Customer;
  loan: Loan;
  notes: CustomerNote[];
};

export function CustomerOperations({ customer, loan, notes }: CustomerOperationsProps) {
  const [noteText, setNoteText] = useState("");
  const [isPendingNote, startTransitionNote] = useTransition();
  
  const [isRestructureOpen, setIsRestructureOpen] = useState(false);
  const [holidayWeeks, setHolidayWeeks] = useState(1);
  const [newWeeklyAmount, setNewWeeklyAmount] = useState(loan.weeklyInstallment.toString());
  const [isPendingRestructure, startTransitionRestructure] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    startTransitionNote(async () => {
      const res = await addCustomerNote(customer.id, noteText.trim());
      if (res.success) {
        setNoteText("");
      }
    });
  };

  const handleApplyHoliday = () => {
    setErrorMsg("");
    startTransitionRestructure(async () => {
      const res = await postponeInstallments(loan.id, holidayWeeks);
      if (res.success) {
        setIsRestructureOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to apply payment holiday");
      }
    });
  };

  const handleRestructurePayment = () => {
    setErrorMsg("");
    const parsedAmount = parseFloat(newWeeklyAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid payment amount");
      return;
    }
    
    startTransitionRestructure(async () => {
      const res = await restructureWeeklyInstallment(loan.id, parsedAmount);
      if (res.success) {
        setIsRestructureOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to restructure installment amount");
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Restructure & Holiday Action Bar */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight">Loan Operations</h3>
          <button
            onClick={() => setIsRestructureOpen(true)}
            className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            Restructure or Pause Loan
          </button>
        </div>
      </section>

      {/* Activity Timeline & Notes */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white tracking-tight">Activity Log & Agent Notes</h3>
        
        {/* Notes form */}
        <form onSubmit={handleAddNote} className="mb-6 flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={isPendingNote}
            placeholder="Add note (e.g. promised payment Friday, client out of town...)"
            className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition"
          />
          <Button
            type="submit"
            disabled={isPendingNote}
            className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-xl px-5 font-bold h-11 shrink-0"
          >
            {isPendingNote ? "Saving..." : <Plus className="w-5 h-5" />}
          </Button>
        </form>

        <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
            {notes.length === 0 ? (
              <div className="py-6 text-center text-gray-500 dark:text-white/40 text-sm">
                No activity logs or agent notes yet for this customer.
              </div>
            ) : (
              <div className="relative pl-6 border-l border-gray-150 dark:border-[#222] flex flex-col gap-6 my-2">
                {notes.map((note) => {
                  const isSystem = note.note.startsWith("Payment Holiday") || note.note.startsWith("Restructured Loan") || note.note.startsWith("Payment of");
                  return (
                    <div key={note.id} className="relative flex flex-col gap-1">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${isSystem ? 'bg-emerald-500 border-white dark:border-[#0a0a0a]' : 'bg-gray-400 border-white dark:border-[#0a0a0a]'}`} />
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-white/40">
                        <span className="font-semibold tracking-wide uppercase flex items-center gap-1.5">
                          {isSystem ? "System Log" : "Agent Note"}
                        </span>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-black dark:text-white break-words mt-0.5">
                        {note.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Restructuring & Pause Dialog */}
      {isRestructureOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0 sm:pb-4">
          <div 
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsRestructureOpen(false)}
          />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#222] transform transition-all animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-[#1a1a1a]">
              <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Loan Restructure & Pause Settings
              </h3>
              <button 
                onClick={() => setIsRestructureOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-gray-500 dark:text-gray-400 transition-colors"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="m-4 sm:m-6 mb-0 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-4 sm:p-6 flex flex-col gap-8">
              
              {/* Option A: Payment Holiday (Pause) */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Calendar className="w-5 h-5" />
                  <h4 className="font-bold text-sm uppercase tracking-wide">Request Payment Holiday</h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/40">
                  Shift the due dates of all future pending installments forward by Sri Lankan weekly increments. This pauses collection reports without penalizing the client.
                </p>
                <div className="flex gap-3 mt-1.5">
                  <select
                    value={holidayWeeks}
                    onChange={(e) => setHolidayWeeks(Number(e.target.value))}
                    className="flex-1 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/40"
                  >
                    <option value={1}>1 Week Pause</option>
                    <option value={2}>2 Weeks Pause</option>
                    <option value={3}>3 Weeks Pause</option>
                    <option value={4}>4 Weeks Pause (1 Month)</option>
                  </select>
                  <Button
                    onClick={handleApplyHoliday}
                    disabled={isPendingRestructure}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm px-6 h-11 shrink-0 transition-all active:scale-[0.98]"
                  >
                    {isPendingRestructure ? "Applying..." : "Apply Pause"}
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-[#1a1a1a]" />

              {/* Option B: Restructure Payment Amount */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                  <h4 className="font-bold text-sm uppercase tracking-wide">Restructure Weekly Installment</h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-white/40">
                  Adjust the weekly collection amount for all remaining installments. Note: This will not change the overall remaining principal balance, just the installment sizes.
                </p>
                <div className="flex gap-3 mt-1.5">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-3 text-gray-400 dark:text-white/40 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newWeeklyAmount}
                      onChange={(e) => setNewWeeklyAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl pl-8 pr-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/40"
                    />
                  </div>
                  <Button
                    onClick={handleRestructurePayment}
                    disabled={isPendingRestructure}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm px-6 h-11 shrink-0 transition-all active:scale-[0.98]"
                  >
                    {isPendingRestructure ? "Updating..." : "Restructure Amount"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-[#1a1a1a]">
                <button
                  onClick={() => setIsRestructureOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#111] dark:hover:bg-[#222] text-black dark:text-white transition-all"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
