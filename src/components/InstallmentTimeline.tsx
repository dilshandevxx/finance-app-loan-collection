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
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const paidInstallments = installments.map((inst, i) => ({ inst, i })).filter(({ inst }) => inst.status === "PAID");
  const pendingInstallments = installments.map((inst, i) => ({ inst, i })).filter(({ inst }) => inst.status !== "PAID");

  const startEditing = (inst: Installment) => {
    setEditingId(inst.id);
    setEditStatus(inst.status);
    setEditAmount(inst.amount.toString());
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
      const res = await editInstallment(instId, editStatus, parsedAmount);
      if (res.success) {
        setEditingId(null);
      } else {
        setErrorMsg(res.error || "Failed to update installment.");
      }
    });
  };

  const renderEditForm = (inst: Installment, i: number) => {
    return (
      <div key={inst.id} className="flex flex-col p-4 bg-primary/5 border border-primary/20 rounded-xl relative mb-2 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-sm text-foreground">Edit Week {i + 1}</span>
          <button onClick={cancelEditing} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {errorMsg && (
          <div className="mb-4 text-xs font-bold text-red-500 flex items-center gap-1 bg-red-500/10 p-2 rounded-lg">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="bg-card border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary font-bold"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="MISSED">MISSED</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount (Rs.)</label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="bg-card border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary font-bold"
            />
          </div>
        </div>

        <button
          onClick={() => handleSave(inst.id)}
          disabled={isPending}
          className="mt-5 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col relative">
      <div className="absolute left-[39px] top-8 bottom-8 w-px bg-gray-200 dark:bg-border" />

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
                <div key={inst.id} className="flex items-center justify-between p-4 relative hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors rounded-xl group/row">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground">Week {i + 1}</span>
                      <span className="text-xs text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-sm text-foreground">
                        {formatLKR(inst.amount)}
                      </span>
                      {inst.paidDate && (
                        <span className="text-xs text-muted-foreground">Paid {new Date(inst.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                    <button
                      onClick={() => startEditing(inst)}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors"
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
          <div key={inst.id} className={`flex items-center justify-between p-4 relative hover:bg-gray-50 dark:hover:bg-secondary/50 transition-colors rounded-xl group/row ${i === installments.length - 1 ? 'mb-2' : ''}`}>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-card rounded-full">
                {isOverdue ? (
                  <AlertCircle className="w-6 h-6 text-destructive-foreground" />
                ) : (
                  <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-border bg-white dark:bg-card" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`font-medium text-sm ${isOverdue ? 'text-destructive-foreground' : 'text-foreground'}`}>Week {i + 1}</span>
                <span className="text-xs text-muted-foreground">{new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className={`font-medium text-sm ${isOverdue ? 'text-destructive-foreground' : 'text-foreground'}`}>
                  {formatLKR(inst.amount)}
                </span>
                {inst.status === "MISSED" && (
                  <span className="text-xs font-bold text-destructive-foreground">MISSED</span>
                )}
              </div>
              <button
                onClick={() => startEditing(inst)}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground/50 hover:text-foreground transition-colors"
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
