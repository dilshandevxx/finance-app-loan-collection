"use client";

import React, { useEffect, useState } from "react";
import { X, Phone, User, Calendar, AlertCircle } from "lucide-react";
import { Customer, Loan, Installment } from "@/data/db";
import { formatLKR, phoneToDial } from "@/lib/format";
import Link from "next/link";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  loans: Loan[];
  installments: Installment[];
}

export function SidePanel({ isOpen, onClose, customer, loans, installments }: SidePanelProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !customer) return null;

  const customerLoans = loans.filter(l => l.customerId === customer.id);
  const activeLoan = customerLoans.find(l => l.status === "ACTIVE") || customerLoans[0];
  
  const customerInstallments = activeLoan 
    ? installments.filter(i => i.loanId === activeLoan.id)
    : [];
    
  const pending = customerInstallments.filter(i => i.status === "PENDING" || i.status === "MISSED");
  const overdueAmount = pending
    .filter(i => i.status === "MISSED" || new Date(i.dueDate) < new Date(new Date().toDateString()))
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[400px] max-w-full bg-card border-l border-border z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black tracking-widest text-lg shadow-sm border border-primary/20">
              {customer.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground leading-tight tracking-tight">{customer.name}</h2>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{customer.state || "Unknown Area"}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Actions */}
          <div className="flex gap-3">
            {customer.phone && (
              <a href={`tel:${phoneToDial(customer.phone)}`} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 py-3 rounded-xl font-bold transition-colors">
                <Phone className="w-4 h-4" />
                Call
              </a>
            )}
            <Link href={`/customers/${customer.id}`} className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-white/10 text-foreground border border-white/5 py-3 rounded-xl font-bold transition-colors">
              <User className="w-4 h-4" />
              Full Profile
            </Link>
          </div>

          {/* Overview */}
          <div className="bg-secondary/50 rounded-2xl p-5 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Account Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</p>
                {overdueAmount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/20 text-destructive text-xs font-black tracking-widest uppercase border border-destructive/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Overdue
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-black tracking-widest uppercase border border-primary/20">
                    Active
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Overdue Amount</p>
                <p className={`text-lg font-black ${overdueAmount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {formatLKR(overdueAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Active Loan Details */}
          {activeLoan && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Active Loan</h3>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Amount</span>
                  <span className="text-sm font-black text-foreground">{formatLKR(activeLoan.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Type</span>
                  <span className="text-xs font-bold bg-secondary px-2 py-1 rounded-md text-foreground">{activeLoan.scheduleType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Start Date</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {new Date(activeLoan.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
