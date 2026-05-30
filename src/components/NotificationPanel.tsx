"use client";

import { useState, useEffect } from "react";
import { Bell, X, Phone, MessageSquare, Calendar, AlertTriangle, ArrowRight, Inbox, Clock } from "lucide-react";
import Link from "next/link";
import { Customer, Loan, Installment } from "@/data/db";
import { formatLKR, phoneToDial } from "@/lib/format";
import { fetchVillageSchedule } from "@/app/actions";
import type { VillageSchedule } from "@/lib/schedule";

type NotificationPanelProps = {
  customers: Customer[];
  loans: Loan[];
  installments: Installment[];
};

export function NotificationPanel({ customers, loans, installments }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Time-zone safe day matching helper
  const isSameDay = (d1Str: string, d2Date: Date) => {
    const d1 = new Date(d1Str);
    return d1.getFullYear() === d2Date.getFullYear() &&
           d1.getMonth() === d2Date.getMonth() &&
           d1.getDate() === d2Date.getDate();
  };

  const isBeforeDay = (d1Str: string, d2Date: Date) => {
    const d1 = new Date(d1Str);
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const date2 = new Date(d2Date.getFullYear(), d2Date.getMonth(), d2Date.getDate());
    return date1 < date2;
  };

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // 1. Missed/Overdue payments
  const overdueList = installments
    .filter(i => i.status === "MISSED" || (i.status === "PENDING" && isBeforeDay(i.dueDate, today)))
    .map(inst => {
      const loan = loans.find(l => l.id === inst.loanId);
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null;
      return { inst, loan, customer };
    })
    .filter(item => item.customer !== null);

  // 2. Today's Tasks will be calculated dynamically below based on schedule

  const [schedule, setSchedule] = useState<VillageSchedule | null>(null);
  const [showTomorrowPlan, setShowTomorrowPlan] = useState(false);

  useEffect(() => {
    fetchVillageSchedule().then(fetchedSchedule => {
      setSchedule(fetchedSchedule);
      
      const timeStr = fetchedSchedule.notificationTime || "16:00";
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      const now = new Date();
      const notifyTime = new Date();
      notifyTime.setHours(hours, minutes, 0, 0);
      
      if (now >= notifyTime) {
        setShowTomorrowPlan(true);
      }
    });
  }, []);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // -- Today Logic --
  const todayDay = days[today.getDay()];
  const todaysVillages = schedule?.[todayDay] || [];
  
  const relevantTodayCustomerIds = new Set(
    customers.filter(c => c.state && todaysVillages.includes(c.state)).map(c => c.id)
  );
  const relevantTodayLoanIds = new Set(
    loans.filter(l => l.status === "ACTIVE" && relevantTodayCustomerIds.has(l.customerId)).map(l => l.id)
  );

  let todayTasks: any[] = [];
  if (schedule) {
    const todayTargetInsts: Installment[] = [];
    for (const loanId of relevantTodayLoanIds) {
      const loanInsts = installments.filter(i => i.loanId === loanId);
      const pending = loanInsts
        .filter(i => i.status === "PENDING")
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
      if (pending.length > 0) {
        todayTargetInsts.push(pending[0]);
      }
    }

    const overdueIds = new Set(overdueList.map(t => t.inst.id));
    
    todayTasks = todayTargetInsts
      .filter(inst => !overdueIds.has(inst.id))
      .map(inst => {
        const loan = loans.find(l => l.id === inst.loanId);
        const customer = loan ? customers.find(c => c.id === loan.customerId) : null;
        return { inst, loan, customer };
      })
      .filter(item => item.customer !== null);
  }

  // -- Tomorrow Logic --
  const tomorrowDay = days[tomorrow.getDay()];
  const tomorrowsVillages = schedule?.[tomorrowDay] || [];

  const relevantTomorrowCustomerIds = new Set(
    customers
      .filter(c => c.state && tomorrowsVillages.includes(c.state))
      .map(c => c.id)
  );

  const relevantTomorrowLoanIds = new Set(
    loans
      .filter(l => l.status === "ACTIVE" && relevantTomorrowCustomerIds.has(l.customerId))
      .map(l => l.id)
  );

  let tomorrowTasks: any[] = [];
  
  if (showTomorrowPlan && schedule) {
    const tomorrowTargetInsts: Installment[] = [];
    for (const loanId of relevantTomorrowLoanIds) {
      const loanInsts = installments.filter(i => i.loanId === loanId);
      const pending = loanInsts
        .filter(i => i.status === "PENDING")
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
      if (pending.length > 0) {
        tomorrowTargetInsts.push(pending[0]);
      }
    }

    const existingIds = new Set([
      ...overdueList.map(t => t.inst.id),
      ...todayTasks.map(t => t.inst.id)
    ]);

    tomorrowTasks = tomorrowTargetInsts
      .filter(inst => !existingIds.has(inst.id))
      .map(inst => {
        const loan = loans.find(l => l.id === inst.loanId);
        const customer = loan ? customers.find(c => c.id === loan.customerId) : null;
        return { inst, loan, customer };
      })
      .filter(item => item.customer !== null);
  }

  const totalCount = overdueList.length + todayTasks.length + tomorrowTasks.length;

  // Prevent background scrolling when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getOverdueDays = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffTime = Math.abs(todayDate.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="relative w-12 h-12 rounded-[1.25rem] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-black/20 group cursor-pointer"
        aria-label="Open notifications"
      >
        <Bell className="w-5.5 h-5.5 text-muted-foreground group-hover:text-white transition-colors duration-300 origin-top group-hover:animate-[bell-ring_0.8s_ease-in-out_infinite]" />
        {totalCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-background animate-pulse shadow-[0_0_8px_var(--vibe-coral)]" />
        )}
      </button>

      {/* Slide-over Panel Portal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Sliding Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md transform transition-all duration-300 ease-out animate-in slide-in-from-right-10 flex flex-col bg-white dark:bg-card shadow-2xl h-full border-l border-gray-100 dark:border-border rounded-l-3xl overflow-hidden">
              
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-border flex items-center justify-between bg-gray-50/50 dark:bg-muted/30">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h2 className="font-extrabold text-lg text-black dark:text-white tracking-tight">Today's Schedule & Tasks</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-secondary hover:bg-gray-200 dark:hover:bg-muted flex items-center justify-center text-gray-500 dark:text-white/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Tasks */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                
                {/* 1. OVERDUE SECTION */}
                {overdueList.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider px-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Missing / Overdue ({overdueList.length})</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {overdueList.map(({ inst, customer }) => (
                        <div key={inst.id} className="p-4 rounded-2xl bg-red-50/40 dark:bg-red-950/10 border border-red-100 dark:border-red-950/20 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-red-200/50 dark:border-red-900/30 overflow-hidden relative shrink-0 bg-red-100/30">
                                <img 
                                  src={customer?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer?.name || "")}`} 
                                  alt={customer?.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-black dark:text-white">{customer?.name}</span>
                                <span className="text-[11px] text-gray-400 dark:text-white/40">ID: {customer?.memberId || customer?.id}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-black text-red-600 dark:text-red-400">{formatLKR(inst.amount)}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold uppercase tracking-wide mt-1">
                                {getOverdueDays(inst.dueDate)}d Overdue
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-red-100/50 dark:border-red-950/20">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due: {new Date(inst.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <a 
                                href={`tel:${customer?.phone}`}
                                className="w-8 h-8 rounded-lg bg-white dark:bg-card border border-red-100 dark:border-red-950/20 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-primary transition-colors"
                                title="Call Customer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a 
                                href={`https://wa.me/${phoneToDial(customer?.phone || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg bg-white dark:bg-card border border-red-100 dark:border-red-950/20 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-primary transition-colors"
                                title="WhatsApp Customer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                              <Link 
                                href={`/customers/${customer?.id}`}
                                onClick={() => setIsOpen(false)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                Collect
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. TODAY'S TASKS SECTION */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider px-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Today's Tasks ({todayTasks.length})</span>
                  </div>
                  
                  {todayTasks.length === 0 ? (
                    <div className="py-6 px-4 rounded-2xl border border-dashed border-gray-100 dark:border-border/50 bg-gray-50/50 dark:bg-card/10 flex flex-col items-center justify-center gap-2">
                      <p className="text-xs text-gray-400 dark:text-white/30 text-center font-medium">No tasks scheduled for today</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {todaysVillages.map((village: string) => {
                        const villageTasks = todayTasks.filter(t => t.customer?.state === village);
                        if (villageTasks.length === 0) return null;
                        
                        return (
                          <div key={village} className="flex flex-col gap-2.5">
                            {/* Village Header */}
                            <div className="flex items-center justify-between px-1">
                              <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                                📍 {village}
                              </span>
                              <span className="text-[11px] text-gray-500 font-bold">{villageTasks.length} collections</span>
                            </div>
                            
                            {/* Village Tasks */}
                            <div className="flex flex-col gap-3">
                              {villageTasks.map(({ inst, customer }) => (
                                <div key={inst.id} className="p-3.5 rounded-2xl bg-gray-50/50 dark:bg-muted/30 border border-gray-100 dark:border-border/50 flex flex-col gap-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full border border-gray-100 dark:border-border overflow-hidden relative shrink-0 bg-gray-100">
                                        <img 
                                          src={customer?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer?.name || "")}`} 
                                          alt={customer?.name} 
                                          className="w-full h-full object-cover" 
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-bold text-sm text-black dark:text-white">{customer?.name}</span>
                                        <span className="text-[11px] text-gray-400 dark:text-white/40">ID: {customer?.memberId || customer?.id}</span>
                                      </div>
                                    </div>
                                    <span className="text-sm font-black text-primary">{formatLKR(inst.amount)}</span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-border/50">
                                    <span className="text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                                      Due Today
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                      <a 
                                        href={`tel:${customer?.phone}`}
                                        className="w-7 h-7 rounded-lg bg-white dark:bg-card border border-gray-200 dark:border-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-primary transition-colors"
                                        title="Call Customer"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                      </a>
                                      <a 
                                        href={`https://wa.me/${phoneToDial(customer?.phone || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 rounded-lg bg-white dark:bg-card border border-gray-200 dark:border-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-primary transition-colors"
                                        title="WhatsApp Customer"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </a>
                                      <Link 
                                        href={`/customers/${customer?.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black flex items-center gap-1 transition-colors"
                                      >
                                        Collect <ArrowRight className="w-3 h-3" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. TOMORROW'S PRE-NOTIFICATION SECTION */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wider px-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tomorrow's Schedule ({tomorrowTasks.length})</span>
                  </div>
                  
                  {tomorrowTasks.length === 0 ? (
                    <div className="py-6 px-4 rounded-2xl border border-dashed border-gray-100 dark:border-border/50 bg-gray-50/50 dark:bg-card/10 flex flex-col items-center justify-center gap-2">
                      <p className="text-xs text-gray-400 dark:text-white/30 text-center font-medium">
                        {showTomorrowPlan ? "No collections needed tomorrow" : "Tomorrow's schedule is not ready yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {/* Advance Warning Informational Banner */}
                      <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-400 font-medium flex items-start gap-2 shadow-sm shadow-indigo-100/20">
                        <span className="text-base leading-none">💡</span> 
                        <span className="pt-0.5"><strong>Pre-collection alert:</strong> Remind these customers today to prepare tomorrow's installment payment!</span>
                      </div>

                      {tomorrowsVillages.map((village: string) => {
                        const villageTasks = tomorrowTasks.filter(t => t.customer?.state === village);
                        if (villageTasks.length === 0) return null;
                        
                        return (
                          <div key={village} className="flex flex-col gap-2.5">
                            {/* Village Header */}
                            <div className="flex items-center justify-between px-1">
                              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                                📍 {village}
                              </span>
                              <span className="text-[11px] text-gray-500 font-bold">{villageTasks.length} reminders</span>
                            </div>

                            {/* Village Tasks */}
                            <div className="flex flex-col gap-3">
                              {villageTasks.map(({ inst, customer }) => (
                                <div key={inst.id} className="p-3.5 rounded-2xl bg-gray-50/30 dark:bg-card/50 border border-gray-100 dark:border-border/40 flex flex-col gap-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full border border-gray-100/50 dark:border-border/30 overflow-hidden relative shrink-0 bg-gray-100/50">
                                        <img 
                                          src={customer?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer?.name || "")}`} 
                                          alt={customer?.name} 
                                          className="w-full h-full object-cover" 
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-bold text-sm text-black dark:text-white">{customer?.name}</span>
                                        <span className="text-[11px] text-gray-400 dark:text-white/40">ID: {customer?.memberId || customer?.id}</span>
                                      </div>
                                    </div>
                                    <span className="text-sm font-black text-indigo-500">{formatLKR(inst.amount)}</span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100/50 dark:border-border/20">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wide">
                                      Tomorrow
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                      <a 
                                        href={`tel:${customer?.phone}`}
                                        className="w-7 h-7 rounded-lg bg-white dark:bg-card border border-gray-200 dark:border-border flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-primary transition-colors"
                                        title="Call Customer"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                      </a>
                                      <a 
                                        href={`https://wa.me/${phoneToDial(customer?.phone || '')}?text=${encodeURIComponent(`Hello ${customer?.name}, this is a gentle reminder that your installment payment of ${formatLKR(inst.amount)} is scheduled for tomorrow. Thank you!`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                                      >
                                        <MessageSquare className="w-3 h-3" />
                                        Remind
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Empty State */}
                {totalCount === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
                    <Inbox className="w-12 h-12 text-gray-300 dark:text-neutral-700" />
                    <p className="text-gray-500 dark:text-white/40 text-sm font-semibold">No pending alerts or tasks!</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
