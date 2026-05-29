"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, Printer, Calendar, Table } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Customer, Installment, Loan } from "@/data/db";
import { formatLKR } from "@/lib/format";

type ReportsDashboardProps = {
  installments: Installment[];
  loans: Loan[];
  customers: Customer[];
  companyName?: string;
  companyLogo?: string;
};

export function ReportsDashboard({ installments, loans, customers, companyName, companyLogo }: ReportsDashboardProps) {
  const [startDate, setStartDate] = useState(() => {
    if (installments.length === 0) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    }
    const sorted = [...installments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const newestDate = sorted[sorted.length - 1].dueDate;
    const newest = new Date(newestDate);
    return `${newest.getFullYear()}-${String(newest.getMonth() + 1).padStart(2, '0')}-01`;
  });

  const [endDate, setEndDate] = useState(() => {
    if (installments.length === 0) {
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }
    const sorted = [...installments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const newestDate = sorted[sorted.length - 1].dueDate;
    const newest = new Date(newestDate);
    const lastDay = new Date(newest.getFullYear(), newest.getMonth() + 1, 0).getDate();
    return `${newest.getFullYear()}-${String(newest.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  });

  const setThisMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setStartDate(`${year}-${month}-01`);
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    setEndDate(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
  };

  const setLast30Days = () => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    const past = new Date();
    past.setDate(now.getDate() - 30);
    const start = past.toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
  };

  const setAllTime = () => {
    if (installments.length === 0) return;
    const sorted = [...installments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setStartDate(sorted[0].dueDate);
    setEndDate(sorted[sorted.length - 1].dueDate);
  };

  const filteredInstallments = installments.filter((inst) => {
    if (!startDate && !endDate) return true;
    
    const instDate = new Date(inst.dueDate);
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date("2100-01-01");
    
    return instDate >= start && instDate <= end;
  });

  const totalExpected = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  const totalCollected = filteredInstallments
    .filter(inst => inst.status === "PAID")
    .reduce((sum, inst) => sum + inst.amount, 0);
  
  const totalPending = totalExpected - totalCollected;

  const chartDataMap = new Map<string, { date: string, expected: number, collected: number }>();
  
  filteredInstallments.forEach(inst => {
    const dateStr = inst.dueDate;
    if (!chartDataMap.has(dateStr)) {
      chartDataMap.set(dateStr, { date: dateStr, expected: 0, collected: 0 });
    }
    const data = chartDataMap.get(dateStr)!;
    data.expected += inst.amount;
    if (inst.status === "PAID") {
      data.collected += inst.amount;
    }
  });

  const chartData = Array.from(chartDataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const exportCSV = () => {
    if (filteredInstallments.length === 0) return alert("No data to export for this period.");
    const uniqueLoanIds = Array.from(new Set(filteredInstallments.map(inst => inst.loanId)));
    
    // Aggregates for report header
    const totalLoansCount = uniqueLoanIds.length;
    const totalExpectedAmount = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const totalCollectedAmount = filteredInstallments
      .filter(inst => inst.status === "PAID")
      .reduce((sum, inst) => sum + inst.amount, 0);
    const totalRemainingAmount = totalExpectedAmount - totalCollectedAmount;
    const collectionRate = totalExpectedAmount > 0 
      ? ((totalCollectedAmount / totalExpectedAmount) * 100).toFixed(1) + "%" 
      : "0%";

    // Standard Report metadata
    const metadata = [
      `"${companyName || "Loan Collection App"}"`,
      `"LOAN COLLECTION LEDGER REPORT"`,
      `"Period: ${startDate} to ${endDate}"`,
      `"Generated: ${new Date().toLocaleDateString()}"`,
      `""`,
      `"SUMMARY METRICS"`,
      `"Total Active Loans,${totalLoansCount}"`,
      `"Total Expected Collections,${formatLKR(totalExpectedAmount).replace(/"/g, '""')}"`,
      `"Total Collected,${formatLKR(totalCollectedAmount).replace(/"/g, '""')}"`,
      `"Total Remaining,${formatLKR(totalRemainingAmount).replace(/"/g, '""')}"`,
      `"Collection Rate,${collectionRate}"`,
      "" // empty spacer row
    ];

    const headers = [
      "Customer Name", 
      "ID / NIC Number", 
      "Company Name", 
      "Member ID", 
      "Phone Number", 
      "Address / Village", 
      "Loan Principal", 
      "Total Repayable",
      "Weekly Installment",
      "Total Installments",
      "Paid Installments",
      "Pending Installments",
      "Missed Installments",
      "Total Collected",
      "Remaining Balance",
      "Loan Start Date", 
      "Loan End Date",
      "Loan Status"
    ];

    const rows = uniqueLoanIds.map(loanId => {
      const loan = loans.find(l => l.id === loanId);
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null;
      
      const loanInsts = installments.filter(i => i.loanId === loanId);
      const sortedLoanInsts = [...loanInsts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      const endDateVal = sortedLoanInsts.length > 0 ? sortedLoanInsts[sortedLoanInsts.length - 1].dueDate : "N/A";
      
      const fullAddress = customer 
        ? [customer.state, customer.address].filter(Boolean).join(" • ")
        : "N/A";

      const totalInstCount = loanInsts.length;
      const paidCount = loanInsts.filter(i => i.status === "PAID").length;
      const pendingCount = loanInsts.filter(i => i.status === "PENDING").length;
      const missedCount = loanInsts.filter(i => i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))).length;
      const totalPaid = loanInsts.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);

      const principalAmount = loan ? loan.principalAmount : 0;
      const totalAmountDue = loan ? loan.totalAmountDue : 0;
      const weeklyInstallment = loan ? loan.weeklyInstallment : 0;
      const remainingBalance = loan ? loan.remainingBalance : 0;
      const status = loan ? loan.status : "N/A";

      return [
        `"${customer?.name || "Unknown"}"`,
        `"${customer?.idNumber || "N/A"}"`,
        `"${customer?.companyName || "N/A"}"`,
        `"${customer?.memberId || "N/A"}"`,
        `"${customer?.phone || "N/A"}"`,
        `"${fullAddress || "N/A"}"`,
        `"${formatLKR(principalAmount).replace(/"/g, '""')}"`,
        `"${formatLKR(totalAmountDue).replace(/"/g, '""')}"`,
        `"${formatLKR(weeklyInstallment).replace(/"/g, '""')}"`,
        `"${totalInstCount}"`,
        `"${paidCount}"`,
        `"${pendingCount}"`,
        `"${missedCount}"`,
        `"${formatLKR(totalPaid).replace(/"/g, '""')}"`,
        `"${formatLKR(remainingBalance).replace(/"/g, '""')}"`,
        `"${loan?.startDate || "N/A"}"`,
        `"${endDateVal}"`,
        `"${status}"`
      ];
    });

    const csvContent = [...metadata, headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Loan_Ledger_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    if (filteredInstallments.length === 0) return alert("No data to export for this period.");
    const uniqueLoanIds = Array.from(new Set(filteredInstallments.map(inst => inst.loanId)));
    
    // Aggregates for report header
    const totalLoansCount = uniqueLoanIds.length;
    const totalExpectedAmount = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const totalCollectedAmount = filteredInstallments
      .filter(inst => inst.status === "PAID")
      .reduce((sum, inst) => sum + inst.amount, 0);
    const totalRemainingAmount = totalExpectedAmount - totalCollectedAmount;
    const collectionRate = totalExpectedAmount > 0 
      ? ((totalCollectedAmount / totalExpectedAmount) * 100).toFixed(1) + "%" 
      : "0%";

    // Standard Report metadata block
    const metadata = [
      [companyName || "Loan Collection App"],
      ["LOAN COLLECTION LEDGER REPORT"],
      [`Period: ${startDate} to ${endDate}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      ["SUMMARY METRICS"],
      ["Total Active Loans", totalLoansCount],
      ["Total Expected Collections", formatLKR(totalExpectedAmount)],
      ["Total Collected", formatLKR(totalCollectedAmount)],
      ["Total Remaining", formatLKR(totalRemainingAmount)],
      ["Collection Rate", collectionRate],
      []
    ];

    const headers = [
      "Customer Name", 
      "ID / NIC Number", 
      "Company Name", 
      "Member ID", 
      "Phone Number", 
      "Address / Village", 
      "Loan Principal", 
      "Total Repayable",
      "Weekly Installment",
      "Total Installments",
      "Paid Installments",
      "Pending Installments",
      "Missed Installments",
      "Total Collected",
      "Remaining Balance",
      "Loan Start Date", 
      "Loan End Date",
      "Loan Status"
    ];

    const rows = uniqueLoanIds.map(loanId => {
      const loan = loans.find(l => l.id === loanId);
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null;
      
      const loanInsts = installments.filter(i => i.loanId === loanId);
      const sortedLoanInsts = [...loanInsts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      const endDateVal = sortedLoanInsts.length > 0 ? sortedLoanInsts[sortedLoanInsts.length - 1].dueDate : "N/A";
      
      const fullAddress = customer 
        ? [customer.state, customer.address].filter(Boolean).join(" • ")
        : "N/A";

      const totalInstCount = loanInsts.length;
      const paidCount = loanInsts.filter(i => i.status === "PAID").length;
      const pendingCount = loanInsts.filter(i => i.status === "PENDING").length;
      const missedCount = loanInsts.filter(i => i.status === "MISSED" || (i.status === "PENDING" && new Date(i.dueDate) < new Date(new Date().toDateString()))).length;
      const totalPaid = loanInsts.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0);

      const principalAmount = loan ? loan.principalAmount : 0;
      const totalAmountDue = loan ? loan.totalAmountDue : 0;
      const weeklyInstallment = loan ? loan.weeklyInstallment : 0;
      const remainingBalance = loan ? loan.remainingBalance : 0;
      const status = loan ? loan.status : "N/A";

      return [
        customer?.name || "Unknown",
        customer?.idNumber || "N/A",
        customer?.companyName || "N/A",
        customer?.memberId || "N/A",
        customer?.phone || "N/A",
        fullAddress || "N/A",
        formatLKR(principalAmount),
        formatLKR(totalAmountDue),
        formatLKR(weeklyInstallment),
        totalInstCount,
        paidCount,
        pendingCount,
        missedCount,
        formatLKR(totalPaid),
        formatLKR(remainingBalance),
        loan?.startDate || "N/A",
        endDateVal,
        status
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([...metadata, headers, ...rows]);
    
    // Set auto-fit columns for gorgeous readable Excel files
    worksheet["!cols"] = [
      { wch: 22 }, // Customer Name
      { wch: 18 }, // ID / NIC Number
      { wch: 22 }, // Company Name
      { wch: 14 }, // Member ID
      { wch: 16 }, // Phone Number
      { wch: 32 }, // Address / Village
      { wch: 16 }, // Loan Principal
      { wch: 16 }, // Total Repayable
      { wch: 18 }, // Weekly Installment
      { wch: 16 }, // Total Installments
      { wch: 16 }, // Paid Installments
      { wch: 18 }, // Pending Installments
      { wch: 18 }, // Missed Installments
      { wch: 16 }, // Total Collected
      { wch: 18 }, // Remaining Balance
      { wch: 16 }, // Loan Start Date
      { wch: 16 }, // Loan End Date
      { wch: 14 }  // Loan Status
    ];

    // Merging company name, title, and range across all columns (A-R is 0 to 17)
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 17 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 17 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 17 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 17 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 17 } }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    XLSX.writeFile(workbook, `Loan_Ledger_${startDate}_to_${endDate}.xlsx`);
  };

  const exportPDF = () => window.print();

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-28">
      
      {/* Header Info */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Portfolio performance & exports</p>
      </div>

      {/* Filters Area */}
      <section className="print:hidden bg-card border border-border rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-5 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[50px] pointer-events-none -z-0" />
        
        <div className="flex flex-col gap-3.5 w-full sm:w-auto relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Start Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-secondary border border-border rounded-2xl pl-4 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition w-full"
                  style={{ colorScheme: "dark" }}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">End Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-secondary border border-border rounded-2xl pl-4 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition w-full"
                  style={{ colorScheme: "dark" }}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <button
              type="button"
              onClick={setThisMonth}
              className="px-3 py-1.5 text-[11px] font-bold bg-secondary hover:bg-border/60 text-foreground rounded-xl border border-border transition-all active:scale-95 cursor-pointer"
            >
              📅 This Month
            </button>
            <button
              type="button"
              onClick={setLast30Days}
              className="px-3 py-1.5 text-[11px] font-bold bg-secondary hover:bg-border/60 text-foreground rounded-xl border border-border transition-all active:scale-95 cursor-pointer"
            >
              📅 Last 30 Days
            </button>
            <button
              type="button"
              onClick={setAllTime}
              className="px-3 py-1.5 text-[11px] font-bold bg-secondary hover:bg-border/60 text-foreground rounded-xl border border-border transition-all active:scale-95 cursor-pointer"
            >
              📅 All Time
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto relative z-10 mt-2 sm:mt-0">
          <Button onClick={exportExcel} className="flex-1 sm:flex-none bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-2xl px-2 sm:px-5 h-12 gap-1.5 shadow-sm text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer">
            <Table className="w-4 h-4 shrink-0" /> Excel
          </Button>
          <Button onClick={exportCSV} className="flex-1 sm:flex-none bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 rounded-2xl px-2 sm:px-5 h-12 gap-1.5 shadow-sm text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer">
            <Download className="w-4 h-4 shrink-0" /> CSV
          </Button>
          <Button onClick={exportPDF} className="flex-1 sm:flex-none bg-secondary text-foreground hover:bg-border/50 border border-border rounded-2xl px-2 sm:px-5 h-12 gap-1.5 shadow-sm text-xs sm:text-sm font-bold active:scale-95 transition-all cursor-pointer">
            <Printer className="w-4 h-4 shrink-0" /> PDF
          </Button>
        </div>
      </section>

      <div className="hidden print:block text-black mb-8 border-b-2 border-black/25 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            {companyName ? (
              <h1 className="text-2xl font-black tracking-tight">{companyName}</h1>
            ) : (
              <h1 className="text-2xl font-black tracking-tight">Loan Collection Report</h1>
            )}
            <p className="text-xs font-bold text-black/60 uppercase tracking-widest mt-1">Loan Collection Ledger Report</p>
            <p className="text-xs text-black/50 mt-1 font-semibold">Period: {startDate || "All Time"} to {endDate || "All Time"}</p>
          </div>
          {companyLogo && (
            <div className="h-16 w-32 relative flex items-center justify-end">
              <img src={companyLogo} alt="Company Logo" className="max-h-16 max-w-full object-contain" />
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-3 text-[10px] text-black/40 font-bold uppercase tracking-wider">
          <span>Official Statement</span>
          <span suppressHydrationWarning>Generated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Summary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-6 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Expected</span>
            <div className="text-3xl font-black mt-1 text-foreground tracking-tight">{formatLKR(totalExpected)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 dark:bg-green-500/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-6 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Collected</span>
            <div className="text-3xl font-black mt-1 text-green-600 dark:text-green-400 tracking-tight">{formatLKR(totalCollected)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-6 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Pending</span>
            <div className="text-3xl font-black mt-1 text-red-500 dark:text-red-400 tracking-tight">{formatLKR(totalPending)}</div>
          </CardContent>
        </Card>
      </section>

      {/* Chart Section */}
      <section className="print:hidden mt-2">
        <h3 className="text-sm font-bold text-foreground mb-3 px-1 uppercase tracking-widest">Collection Trends</h3>
        <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-sm pt-6 pb-2">
          <div className="h-[280px] w-full px-2 sm:px-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-collected)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--chart-collected)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-expected)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--chart-expected)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#888888' }} 
                    dy={10}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#888888' }}
                    tickFormatter={(value) => `Rs. ${Number(value).toLocaleString("en-LK")}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', color: 'var(--foreground)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [formatLKR(Number(value)), undefined]}
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1.5 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expected" 
                    stroke="var(--chart-expected)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorExpected)" 
                    name="Expected"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    stroke="var(--chart-collected)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCollected)" 
                    name="Collected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                No data available for this range
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Detailed Table */}
      <section className="mt-2">
        <h3 className="text-sm font-bold text-foreground print:text-black mb-3 px-1 uppercase tracking-widest">Transactions</h3>
        <Card className="bg-card print:bg-white print:border-black/20 print:shadow-none border-border rounded-[2rem] overflow-hidden shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm print:text-black whitespace-nowrap">
              <thead className="bg-secondary/50 print:bg-black/5 text-muted-foreground print:text-black/60 uppercase tracking-widest text-[10px] font-bold">
                <tr>
                  <th className="p-4 px-6">Customer</th>
                  <th className="p-4">Member ID</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-black/10">
                {filteredInstallments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground print:text-black/50 text-sm">
                      No transactions found for the selected period.
                    </td>
                  </tr>
                ) : (
                  filteredInstallments.map(inst => {
                    const loan = loans.find(l => l.id === inst.loanId);
                    const customer = customers.find(c => c.id === loan?.customerId);
                    
                    return (
                      <tr key={inst.id} className="hover:bg-secondary/30 print:hover:bg-transparent transition-colors text-foreground print:text-black">
                        <td className="p-4 px-6 font-semibold text-sm">{customer?.name || "Unknown"}</td>
                        <td className="p-4 text-muted-foreground print:text-black/70 text-xs font-mono">{customer?.memberId || customer?.id.slice(0,8) || "N/A"}</td>
                        <td className="p-4 text-muted-foreground print:text-black/70 text-xs">{inst.dueDate}</td>
                        <td className="p-4 text-right font-bold text-sm">{formatLKR(inst.amount)}</td>
                        <td className="p-4 px-6 text-right flex justify-end">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inst.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 print:bg-transparent print:text-black" :
                            inst.status === "PENDING" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 print:bg-transparent print:text-yellow-700" :
                            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 print:bg-transparent print:text-red-700"
                          }`}>
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
