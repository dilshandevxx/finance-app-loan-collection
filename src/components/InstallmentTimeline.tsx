"use client";

import { useState, useTransition } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, Edit2, Loader2, Save, X } from "lucide-react";
import { formatLKR } from "@/lib/format";
import { Installment, Loan } from "@/data/db";
import { editInstallment } from "@/app/actions";

type InstallmentTimelineProps = {
  installments: Installment[];
  loan: Loan;
};

export function InstallmentTimeline({ installments, loan }: InstallmentTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPaidExpanded, setIsPaidExpanded] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<string>("PENDING");
  const [editAmount, setEditAmount] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const paidInstallments = installments.map((inst, i) => ({ inst, i })).filter(({ inst }) => inst.status === "PAID");
  const pendingInstallments = installments.map((inst, i) => ({ inst, i })).filter(({ inst }) => inst.status !== "PAID");

  const startEditing = (inst: Installment) => {
    setEditingId(inst.id);
    setEditStatus(inst.status);
    setEditAmount(inst.amount.toString());
    setEditDueDate(inst.dueDate.split('T')[0]);
    setErrorMsg("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setErrorMsg("");
  };

  const handleSave = async (instId: string) => {
    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Amount must be a valid number greater than zero.");
      return;
    }

    setErrorMsg("");
    startTransition(async () => {
      const res = await editInstallment(instId, editStatus, parsedAmount, editDueDate);
      if (res.success) {
        setEditingId(null);
      } else {
        setErrorMsg(res.error || "Failed to update installment.");
      }
    });
  };

  const renderEditForm = (inst: Installment, i: number) => {
    return (
      <div key={inst.id} className="flex flex-col p-5 bg-card border border-border/50 shadow-sm rounded-2xl relative mb-3 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <span className="font-extrabold text-foreground tracking-tight">Edit Week {i + 1}</span>
            <span className="text-xs text-muted-foreground font-semibold">Adjust payment details</span>
          </div>
          <button onClick={cancelEditing} className="w-8 h-8 rounded-full bg-secondary/80 text-muted-foreground flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {errorMsg && (
          <div className="mb-5 text-xs font-bold text-destructive flex items-center gap-2 bg-destructive/10 p-3 rounded-xl border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold appearance-none"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="MISSED">Missed</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount (Rs.)</label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Date</label>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="w-full bg-secondary/30 border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold"
            />
          </div>
        </div>

        <button
          onClick={() => handleSave(inst.id)}
          disabled={isPending}
          className="mt-6 w-full bg-foreground text-background font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col relative py-2">
      {/* Continuous Timeline Line */}
      <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-border/60 dark:bg-border/40 rounded-full" />

      {paidInstallments.length > 0 && (
        <div className="flex flex-col mb-4">
          <button 
            onClick={() => setIsPaidExpanded(!isPaidExpanded)}
            className="relative z-10 flex items-center justify-between mx-4 px-5 py-3.5 bg-secondary/40 hover:bg-secondary/70 border border-border/50 rounded-2xl transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-black text-[13px] text-foreground tracking-tight">{paidInstallments.length} Paid Installments</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">View History</span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isPaidExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isPaidExpanded && (
            <div className="flex flex-col mt-4 animate-in slide-in-from-top-4 fade-in duration-300">
              {paidInstallments.map(({ inst, i }) => (
                editingId === inst.id ? renderEditForm(inst, i) : (
                  <div key={inst.id} className="relative flex items-center justify-between py-3.5 pr-4 group/row hover:bg-secondary/20 rounded-2xl transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Timeline Dot */}
                      <div className="ml-5 relative z-10 w-6 h-6 flex items-center justify-center bg-white dark:bg-card rounded-full border-[3px] border-emerald-500 shadow-sm shrink-0">
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[14px] text-foreground tracking-tight leading-none mb-1">Week {i + 1}</span>
                        <span className="text-[11px] font-medium text-muted-foreground leading-none">{new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end text-right">
                        <span className="font-black text-[14px] text-foreground tracking-tight leading-none mb-1">
                          {formatLKR(inst.amount)}
                        </span>
                        {inst.paidDate && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                            Paid {new Date(inst.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => startEditing(inst)}
                        className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95 opacity-80 shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col">
        {pendingInstallments.map(({ inst, i }) => {
          if (editingId === inst.id) return renderEditForm(inst, i);
          
          const isOverdue = inst.status === "MISSED" || (inst.status === "PENDING" && new Date(inst.dueDate) < new Date());
          
          // Determine if this is the "Next" installment
          const globalIndex = installments.findIndex(x => x.id === inst.id);
          const firstPendingGlobalIndex = installments.findIndex(x => x.status === "PENDING");
          const isNext = !isOverdue && inst.status === "PENDING" && globalIndex === firstPendingGlobalIndex;
          
          return (
            <div key={inst.id} className={`relative flex items-center justify-between py-4 pr-4 group/row hover:bg-secondary/20 rounded-2xl transition-colors ${isNext ? 'bg-primary/5 hover:bg-primary/10' : ''}`}>
              <div className="flex items-center gap-4">
                {/* Timeline Dot */}
                <div className={`ml-5 relative z-10 w-6 h-6 flex items-center justify-center rounded-full border-[3px] shadow-sm bg-white dark:bg-card shrink-0 ${
                  isOverdue ? 'border-destructive' : isNext ? 'border-primary' : 'border-border/60'
                }`}>
                  {isOverdue && <AlertCircle className="w-4 h-4 text-destructive absolute -top-[2px] -right-[12px]" />}
                </div>
                
                <div className="flex flex-col">
                  <span className={`font-extrabold text-[14px] tracking-tight leading-none mb-1 flex items-center gap-2 ${
                    isOverdue ? 'text-destructive' : isNext ? 'text-primary' : 'text-foreground'
                  }`}>
                    Week {globalIndex + 1} 
                    {isNext && <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Next</span>}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground leading-none">
                    {new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end text-right">
                  <span className={`font-black text-[14px] tracking-tight leading-none mb-1 ${
                    isOverdue ? 'text-destructive' : 'text-foreground'
                  }`}>
                    {formatLKR(inst.amount)}
                  </span>
                  {inst.status === "MISSED" && (
                    <span className="text-[10px] font-bold text-destructive uppercase tracking-widest leading-none">Missed</span>
                  )}
                </div>
                <button
                  onClick={() => startEditing(inst)}
                  className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95 opacity-80 shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
