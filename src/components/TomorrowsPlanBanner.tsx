"use client";

import { useEffect, useState } from "react";
import { fetchVillageSchedule } from "@/app/actions";
import { Customer, Installment, Loan } from "@/data/db";
import type { VillageSchedule } from "@/lib/schedule";
import { formatLKR } from "@/lib/format";
import { CalendarDays, MapPin } from "lucide-react";

interface Props {
  installments: Installment[];
  customers: Customer[];
  loans: Loan[];
}

export function TomorrowsPlanBanner({ installments, customers, loans }: Props) {
  const [schedule, setSchedule] = useState<VillageSchedule | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    fetchVillageSchedule().then(fetchedSchedule => {
      setSchedule(fetchedSchedule);
      
      // Parse notification time (default 16:00)
      const timeStr = fetchedSchedule.notificationTime || "16:00";
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      const now = new Date();
      const notifyTime = new Date();
      notifyTime.setHours(hours, minutes, 0, 0);
      
      // Show banner if current time is past the configured notification time
      if (now >= notifyTime) {
        setShowBanner(true);
      }
    });
  }, []);

  if (!showBanner || !schedule) return null;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDay = days[tomorrowDate.getDay()];

  const tomorrowsVillages = schedule[tomorrowDay] || [];

  if (tomorrowsVillages.length === 0) return null; // Nothing scheduled

  // Calculate stats for these villages
  // Find customers in these villages
  const relevantCustomerIds = new Set(
    customers
      .filter(c => c.state && tomorrowsVillages.includes(c.state))
      .map(c => c.id)
  );

  // Find active loans for these customers
  const relevantLoanIds = new Set(
    loans
      .filter(l => l.status === "ACTIVE" && relevantCustomerIds.has(l.customerId))
      .map(l => l.id)
  );

  // Find pending/missed installments for these loans
  // OR installments specifically due tomorrow
  const targetInstallments = installments.filter(i => {
    if (!relevantLoanIds.has(i.loanId)) return false;
    
    // Include if it's missed, OR if it's pending and due on or before tomorrow
    if (i.status === "MISSED") return true;
    if (i.status === "PENDING") {
      const dueDate = new Date(i.dueDate);
      dueDate.setHours(0,0,0,0);
      const tomorrowMidnight = new Date(tomorrowDate);
      tomorrowMidnight.setHours(0,0,0,0);
      return dueDate.getTime() <= tomorrowMidnight.getTime();
    }
    return false;
  });

  if (targetInstallments.length === 0) return null;

  // Group by customer to count unique clients
  const uniqueClients = new Set(
    targetInstallments.map(i => {
      const loan = loans.find(l => l.id === i.loanId);
      return loan?.customerId;
    })
  );

  const totalAmount = targetInstallments.reduce((sum, inst) => sum + inst.amount, 0);

  return (
    <div className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[1.5rem] p-5 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 mb-2">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex gap-4 items-start md:items-center">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20">
          <CalendarDays className="w-6 h-6 text-white" />
        </div>
        
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">
            Tomorrow's Schedule
          </div>
          <h3 className="text-xl font-bold leading-tight flex flex-wrap items-center gap-2">
            {tomorrowsVillages.map((v, i) => (
              <span key={v} className="flex items-center gap-1">
                {i > 0 && <span className="text-white/50 px-1">•</span>}
                <MapPin className="w-4 h-4 text-indigo-300" />
                {v}
              </span>
            ))}
          </h3>
          <p className="text-indigo-100 text-sm mt-1.5 font-medium max-w-xl leading-relaxed">
            You are scheduled to visit {tomorrowsVillages.length} route{tomorrowsVillages.length > 1 ? 's' : ''}. 
            There {uniqueClients.size === 1 ? 'is' : 'are'} <strong className="text-white bg-white/20 px-1.5 py-0.5 rounded-md">{uniqueClients.size} client{uniqueClients.size > 1 ? 's' : ''}</strong> with pending or overdue collections totaling <strong className="text-white bg-white/20 px-1.5 py-0.5 rounded-md">{formatLKR(totalAmount)}</strong>.
          </p>
        </div>
      </div>
      
      <div className="relative z-10 shrink-0 self-start md:self-center bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-center">
        <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Expected</div>
        <div className="text-lg font-black tracking-tight">{formatLKR(totalAmount)}</div>
      </div>
    </div>
  );
}
