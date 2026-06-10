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
    <div className="flex flex-col relative px-2">
      <div className="absolute left-10 top-8 bottom-8 w-px bg-border" />

      {paidInstallments.length > 0 && (
        <details className="group">
          <summary className="flex items-center justify-between p-4 relative hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors rounded-xl list-none cursor-pointer mt-2 z-10">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card rounded-full shadow-sm border border-border/50">
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">Past Paid Installments</span>
                <span className="text-xs text-muted-foreground">{paidInstallments.length} weeks successfully paid</span>
              </div>
            </div>
          </summary>
          <div className="flex flex-col opacity-90">
            {paidInstallments.map(({ inst, i }) => (
              editingId === inst.id ? renderEditForm(inst, i) : (
                <div key={inst.id} className="flex flex-wrap sm:flex-nowrap items-center justify-between p-4 relative hover:bg-secondary/30 transition-colors rounded-2xl group/row gap-3">
                  <div className="flex items-center gap-4 relative z-10 shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card rounded-full border border-border shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[15px] text-foreground tracking-tight">Week {i + 1}</span>
                      <span className="text-xs font-medium text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-16 sm:ml-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex flex-col sm:items-end">
                      <span className="font-black text-[15px] text-foreground tracking-tight">
                        {formatLKR(inst.amount)}
                      </span>
                      {inst.paidDate && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Paid {new Date(inst.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                    <button
                      onClick={() => startEditing(inst)}
                      className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95 shrink-0"
                      title="Edit Installment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        </details>
      )}

      {pendingInstallments.map(({ inst, i }) => {
        if (editingId === inst.id) return renderEditForm(inst, i);
        
        const isOverdue = inst.status === "MISSED" || (inst.status === "PENDING" && new Date(inst.dueDate) < new Date());
        return (
          <div key={inst.id} className={`flex flex-wrap sm:flex-nowrap items-center justify-between p-4 relative hover:bg-secondary/30 transition-colors rounded-2xl group/row gap-3 ${i === installments.length - 1 ? 'mb-2' : ''}`}>
            <div className="flex items-center gap-4 relative z-10 shrink-0">
              <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card rounded-full border border-border shadow-sm">
                {isOverdue ? (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-border" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`font-extrabold text-[15px] tracking-tight ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>Week {i + 1}</span>
                <span className="text-xs font-medium text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-16 sm:ml-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex flex-col sm:items-end">
                <span className={`font-black text-[15px] tracking-tight ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                  {formatLKR(inst.amount)}
                </span>
                {inst.status === "MISSED" && (
                  <span className="text-[11px] font-bold text-destructive uppercase tracking-widest">Missed</span>
                )}
              </div>
              <button
                onClick={() => startEditing(inst)}
                className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95 shrink-0"
                title="Edit Installment"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
