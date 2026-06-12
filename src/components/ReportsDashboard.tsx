"use client";

import { useState } from "react";
import { Download, Printer, Calendar, Table } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Customer, Installment, Loan } from "@/data/db";
import { formatLKR } from "@/lib/format";
import { PortfolioSummaryCard } from "@/components/PortfolioSummaryCard";

type ReportsDashboardProps = {
  installments: Installment[];
  loans: Loan[];
  customers: Customer[];
  companyName?: string;
  companyLogo?: string;
  companyPhone?: string;
};

function formatPaidDate(paidDateStr?: string): string {
  if (!paidDateStr) return "PAID";
  try {
    const d = new Date(paidDateStr);
    if (isNaN(d.getTime())) return "PAID";
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    const hasTime = paidDateStr.includes('T') || paidDateStr.includes(':') || paidDateStr.includes(' ');
    if (hasTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `PAID (${month}/${day} ${hours}:${minutes})`;
    } else {
      return `PAID (${month}/${day})`;
    }
  } catch (e) {
    return "PAID";
  }
}

export function ReportsDashboard({ installments, loans, customers, companyName, companyLogo, companyPhone }: ReportsDashboardProps) {
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

  const filteredLoans = loans.filter((loan) => {
    if (!startDate && !endDate) return true;
    const loanDate = new Date(loan.startDate);
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date("2100-01-01");
    return loanDate >= start && loanDate <= end;
  });

  const loanSizeDistribution = (() => {
    const map = new Map<number, { count: number, active: number }>();
    filteredLoans.forEach(loan => {
      const p = loan.principalAmount;
      if (!map.has(p)) map.set(p, { count: 0, active: 0 });
      const stats = map.get(p)!;
      stats.count += 1;
      if (loan.status === "ACTIVE") stats.active += 1;
    });
    return Array.from(map.entries())
      .map(([principal, stats]) => ({
        principal,
        count: stats.count,
        active: stats.active,
        totalCapital: principal * stats.count
      }))
      .sort((a, b) => b.principal - a.principal);
  })();

  const villageBreakdown = (() => {
    const map = new Map<string, {
      village: string;
      customers: Customer[];
    }>();

    customers.forEach(c => {
      const village = c.state?.trim() || "Unassigned";
      if (!map.has(village)) {
        map.set(village, { village, customers: [] });
      }
      map.get(village)!.customers.push(c);
    });

    const list = Array.from(map.values()).map(({ village, customers: vCustomers }) => {
      const customerIds = new Set(vCustomers.map(c => c.id));
      const vLoans = loans.filter(l => customerIds.has(l.customerId));
      const activeLoans = vLoans.filter(l => l.status === "ACTIVE");
      const activeLoansCount = activeLoans.length;

      const vLoanIds = new Set(vLoans.map(l => l.id));
      const vInstallments = installments.filter(inst => vLoanIds.has(inst.loanId));

      const totalExpected = vInstallments.reduce((sum, inst) => sum + inst.amount, 0);
      const totalCollected = vInstallments
        .filter(inst => inst.status === "PAID")
        .reduce((sum, inst) => sum + inst.amount, 0);

      const outstandingBalance = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);

      return {
        village,
        totalClients: vCustomers.length,
        activeLoansCount,
        totalExpected,
        totalCollected,
        outstandingBalance,
      };
    });

    return list.sort((a, b) => {
      if (a.village === "Unassigned") return 1;
      if (b.village === "Unassigned") return -1;
      return a.village.localeCompare(b.village);
    });
  })();

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

    // Find the maximum installment count of the exported loans to dynamically size headers
    const maxInstallments = uniqueLoanIds.reduce((max, loanId) => {
      const count = installments.filter(i => i.loanId === loanId).length;
      return Math.max(max, count);
    }, 0);

    // Standard Report metadata
    const metadata = [
      `"${companyName || "Loan Collection App"}"`,
      companyPhone ? `"${companyPhone}"` : `""`,
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
      "Address / Area",
      "Loan Principal",
      "Interest Rate",
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
      "Loan Status",
      ...Array.from({ length: maxInstallments }, (_, idx) => `Installment ${idx + 1}`)
    ];

    const rows = uniqueLoanIds.map(loanId => {
      const loan = loans.find(l => l.id === loanId);
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null;

      const loanInsts = installments.filter(i => i.loanId === loanId);
      const sortedLoanInsts = [...loanInsts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      let endDateVal = sortedLoanInsts.length > 0 ? sortedLoanInsts[sortedLoanInsts.length - 1].dueDate : "N/A";
      if (loan?.status === "PAID_OFF") {
        const paidDates = sortedLoanInsts.filter(i => i.paidDate).map(i => new Date(i.paidDate as string).getTime());
        if (paidDates.length > 0) {
          endDateVal = new Date(Math.max(...paidDates)).toISOString().split('T')[0];
        }
      }

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

      const interestRate = principalAmount > 0
        ? Math.round(((totalAmountDue / principalAmount) - 1) * 100)
        : 0;

      const installmentStatusList = Array.from({ length: maxInstallments }, (_, idx) => {
        if (idx < sortedLoanInsts.length) {
          const inst = sortedLoanInsts[idx];
          const isOverdue = inst.status === "PENDING" && new Date(inst.dueDate) < new Date(new Date().toDateString());
          if (inst.status === "PAID") {
            return formatPaidDate(inst.paidDate);
          }
          return isOverdue ? "OVERDUE" : inst.status;
        }
        return "";
      });

      return [
        `"${customer?.name || "Unknown"}"`,
        `"${customer?.idNumber || "N/A"}"`,
        `"${customer?.companyName || "N/A"}"`,
        `"${customer?.memberId || "N/A"}"`,
        `"${customer?.phone || "N/A"}"`,
        `"${fullAddress || "N/A"}"`,
        `"${formatLKR(principalAmount).replace(/"/g, '""')}"`,
        `"${interestRate}%"`,
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
        `"${status}"`,
        ...installmentStatusList.map(st => st ? `"${st}"` : `""`)
      ];
    });

    // Area Breakdown section appended at the end of the CSV
    const villageSection = [
      "",
      "\"VILLAGE BREAKDOWN\"",
      "\"Village\",\"Total Clients\",\"Active Loans\",\"Total Expected\",\"Total Collected\",\"Collection Rate\",\"Outstanding Balance\"",
      ...villageBreakdown.map(v => {
        const vRate = v.totalExpected > 0 ? ((v.totalCollected / v.totalExpected) * 100).toFixed(1) + "%" : "0%";
        return [
          `"${v.village}"`,
          `"${v.totalClients}"`,
          `"${v.activeLoansCount}"`,
          `"${formatLKR(v.totalExpected).replace(/"/g, '""')}"`,
          `"${formatLKR(v.totalCollected).replace(/"/g, '""')}"`,
          `"${vRate}"`,
          `"${formatLKR(v.outstandingBalance).replace(/"/g, '""')}"`,
        ].join(",");
      }),
    ];

    const csvContent = [...metadata, headers.join(","), ...rows.map(row => row.join(",")), ...villageSection].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Loan_Ledger_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = async () => {
    if (filteredInstallments.length === 0) return alert("No data to export for this period.");

    // Dynamically import xlsx only when needed
    const XLSX = await import("xlsx");

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

    // Find the maximum installment count of the exported loans to dynamically size headers
    const maxInstallments = uniqueLoanIds.reduce((max, loanId) => {
      const count = installments.filter(i => i.loanId === loanId).length;
      return Math.max(max, count);
    }, 0);

    const totalCols = 19 + maxInstallments;

    // Standard Report metadata block
    const metadata = [
      [companyName || "Loan Collection App"],
      ...(companyPhone ? [[companyPhone]] : []),
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
      "Address / Area",
      "Loan Principal",
      "Interest Rate",
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
      "Loan Status",
      ...Array.from({ length: maxInstallments }, (_, idx) => `Installment ${idx + 1}`)
    ];

    const rows = uniqueLoanIds.map(loanId => {
      const loan = loans.find(l => l.id === loanId);
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null;

      const loanInsts = installments.filter(i => i.loanId === loanId);
      const sortedLoanInsts = [...loanInsts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      let endDateVal = sortedLoanInsts.length > 0 ? sortedLoanInsts[sortedLoanInsts.length - 1].dueDate : "N/A";
      if (loan?.status === "PAID_OFF") {
        const paidDates = sortedLoanInsts.filter(i => i.paidDate).map(i => new Date(i.paidDate as string).getTime());
        if (paidDates.length > 0) {
          endDateVal = new Date(Math.max(...paidDates)).toISOString().split('T')[0];
        }
      }

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

      const interestRate = principalAmount > 0
        ? Math.round(((totalAmountDue / principalAmount) - 1) * 100)
        : 0;

      const installmentStatusList = Array.from({ length: maxInstallments }, (_, idx) => {
        if (idx < sortedLoanInsts.length) {
          const inst = sortedLoanInsts[idx];
          const isOverdue = inst.status === "PENDING" && new Date(inst.dueDate) < new Date(new Date().toDateString());
          if (inst.status === "PAID") {
            return formatPaidDate(inst.paidDate);
          }
          return isOverdue ? "OVERDUE" : inst.status;
        }
        return "";
      });

      return [
        customer?.name || "Unknown",
        customer?.idNumber || "N/A",
        customer?.companyName || "N/A",
        customer?.memberId || "N/A",
        customer?.phone || "N/A",
        fullAddress || "N/A",
        formatLKR(principalAmount),
        `${interestRate}%`,
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
        status,
        ...installmentStatusList
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([...metadata, headers, ...rows]);

    // Set auto-fit columns for gorgeous readable Excel files
    const baseCols = [
      { wch: 22 }, // Customer Name
      { wch: 18 }, // ID / NIC Number
      { wch: 22 }, // Company Name
      { wch: 14 }, // Member ID
      { wch: 16 }, // Phone Number
      { wch: 32 }, // Address / Area
      { wch: 16 }, // Loan Principal
      { wch: 14 }, // Interest Rate
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

    const instCols = Array.from({ length: maxInstallments }, () => ({ wch: 18 }));
    worksheet["!cols"] = [...baseCols, ...instCols];

    // Merging company name, title, and range across all columns
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: totalCols - 1 } }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");

    // ── Village Summary Sheet ──────────────────────────────────
    const villageSummaryData = [
      [companyName || "Loan Collection App"],
      ["AREA BREAKDOWN SUMMARY"],
      [`Period: ${startDate} to ${endDate}`],
      [],
      ["Area", "Total Clients", "Active Loans", "Total Expected", "Total Collected", "Collection Rate", "Outstanding Balance"],
      ...villageBreakdown.map(v => {
        const vRate = v.totalExpected > 0 ? ((v.totalCollected / v.totalExpected) * 100).toFixed(1) + "%" : "0%";
        return [v.village, v.totalClients, v.activeLoansCount, formatLKR(v.totalExpected), formatLKR(v.totalCollected), vRate, formatLKR(v.outstandingBalance)];
      }),
      // Grand total row
      (() => {
        const ge = villageBreakdown.reduce((s, v) => s + v.totalExpected, 0);
        const gc = villageBreakdown.reduce((s, v) => s + v.totalCollected, 0);
        const go = villageBreakdown.reduce((s, v) => s + v.outstandingBalance, 0);
        const gr = ge > 0 ? ((gc / ge) * 100).toFixed(1) + "%" : "0%";
        return ["TOTAL", villageBreakdown.reduce((s, v) => s + v.totalClients, 0), villageBreakdown.reduce((s, v) => s + v.activeLoansCount, 0), formatLKR(ge), formatLKR(gc), gr, formatLKR(go)];
      })(),
    ];
    const villageSheet = XLSX.utils.aoa_to_sheet(villageSummaryData);
    villageSheet["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 22 }];
    villageSheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    ];
    XLSX.utils.book_append_sheet(workbook, villageSheet, "Village Summary");

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
            {companyPhone && (
              <p className="text-sm font-semibold text-black/80 mt-0.5">{companyPhone}</p>
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

      {/* Portfolio Summary Card */}
      <section className="print:hidden">
        <PortfolioSummaryCard loans={filteredLoans} />
      </section>

      {/* Summary Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-5 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Expected</span>
            <div className="text-2xl font-black mt-1 text-foreground tracking-tight">{formatLKR(totalExpected)}</div>
            <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block">total due</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 dark:bg-green-500/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-5 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Collected</span>
            <div className="text-2xl font-black mt-1 text-green-600 dark:text-green-400 tracking-tight">{formatLKR(totalCollected)}</div>
            <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block">amount received</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-5 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Pending</span>
            <div className="text-2xl font-black mt-1 text-red-500 dark:text-red-400 tracking-tight">{formatLKR(totalPending)}</div>
            <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block">outstanding</span>
          </CardContent>
        </Card>
        {/* Collection Rate Card */}
        {(() => {
          const rate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
          const rateColor = rate >= 80 ? "text-emerald-600 dark:text-emerald-400" : rate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-500 dark:text-red-400";
          const glowColor = rate >= 80 ? "bg-emerald-500/10" : rate >= 50 ? "bg-amber-500/10" : "bg-red-500/10";
          return (
            <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
              <div className={`absolute top-0 right-0 w-32 h-32 ${glowColor} rounded-full blur-[30px] -z-0`} />
              <CardContent className="p-5 relative z-10">
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Collection Rate</span>
                <div className={`text-2xl font-black mt-1 tracking-tight ${rateColor}`}>{rate}%</div>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block">of target collected</span>
              </CardContent>
            </Card>
          );
        })()}
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
                      <stop offset="5%" stopColor="var(--chart-collected)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-collected)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-expected)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--chart-expected)" stopOpacity={0} />
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
                    formatter={(value: string | number | readonly (string | number)[] | undefined) => [formatLKR(Number(Array.isArray(value) ? value[0] : value || 0)), undefined]}
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

      {/* Loan Size Distribution */}
      <section className="mt-2">
        <h3 className="text-sm font-bold text-foreground print:text-black mb-3 px-1 uppercase tracking-widest">Loan Size Distribution</h3>
        <Card className="bg-card print:bg-white print:border-black/20 print:shadow-none border-border rounded-[2rem] overflow-hidden shadow-sm mb-6">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm print:text-black whitespace-nowrap">
              <thead className="bg-secondary/50 print:bg-black/5 text-muted-foreground print:text-black/60 uppercase tracking-widest text-[10px] font-bold">
                <tr>
                  <th className="p-4 px-6">Principal Amount</th>
                  <th className="p-4 text-center">Total Count</th>
                  <th className="p-4 text-center">Active Count</th>
                  <th className="p-4 text-right px-6">Total Capital Allocated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-black/10">
                {loanSizeDistribution.map((item) => (
                  <tr key={item.principal} className="hover:bg-secondary/30 print:hover:bg-transparent transition-colors text-foreground print:text-black">
                    <td className="p-4 px-6 font-bold text-sm text-primary">{formatLKR(item.principal)}</td>
                    <td className="p-4 text-center text-xs font-semibold">{item.count} loans</td>
                    <td className="p-4 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.active} active</td>
                    <td className="p-4 px-6 text-right font-black text-sm">{formatLKR(item.totalCapital)}</td>
                  </tr>
                ))}
                {loanSizeDistribution.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground print:text-black/50 text-sm">
                      No loans found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* Area Breakdown */}
      <section className="mt-2">
        <h3 className="text-sm font-bold text-foreground print:text-black mb-3 px-1 uppercase tracking-widest">Area Breakdown</h3>
        <Card className="bg-card print:bg-white print:border-black/20 print:shadow-none border-border rounded-[2rem] overflow-hidden shadow-sm mb-6">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm print:text-black whitespace-nowrap">
              <thead className="bg-secondary/50 print:bg-black/5 text-muted-foreground print:text-black/60 uppercase tracking-widest text-[10px] font-bold">
                <tr>
                  <th className="p-4 px-6">Area</th>
                  <th className="p-4 text-center">Total Clients</th>
                  <th className="p-4 text-center">Active Loans</th>
                  <th className="p-4 text-right">Total Expected</th>
                  <th className="p-4 text-right">Total Collected</th>
                  <th className="p-4 text-right">Collection Rate</th>
                  <th className="p-4 px-6 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-black/10">
                {villageBreakdown.map((item) => {
                  const vRate = item.totalExpected > 0 ? Math.round((item.totalCollected / item.totalExpected) * 100) : 0;
                  const vRateColor = vRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : vRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-500 dark:text-red-400";
                  return (
                    <tr key={item.village} className="hover:bg-secondary/30 print:hover:bg-transparent transition-colors text-foreground print:text-black">
                      <td className="p-4 px-6 font-semibold text-sm">{item.village}</td>
                      <td className="p-4 text-center text-xs font-semibold">{item.totalClients}</td>
                      <td className="p-4 text-center text-xs font-semibold">{item.activeLoansCount}</td>
                      <td className="p-4 text-right font-bold text-sm">{formatLKR(item.totalExpected)}</td>
                      <td className="p-4 text-right font-bold text-sm text-green-600 dark:text-green-400">{formatLKR(item.totalCollected)}</td>
                      <td className={`p-4 text-right font-black text-sm ${vRateColor}`}>{vRate}%</td>
                      <td className="p-4 px-6 text-right font-bold text-sm text-red-500 dark:text-red-400">{formatLKR(item.outstandingBalance)}</td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Village totals footer */}
              {villageBreakdown.length > 1 && (() => {
                const grandExpected = villageBreakdown.reduce((s, v) => s + v.totalExpected, 0);
                const grandCollected = villageBreakdown.reduce((s, v) => s + v.totalCollected, 0);
                const grandOutstanding = villageBreakdown.reduce((s, v) => s + v.outstandingBalance, 0);
                const grandRate = grandExpected > 0 ? Math.round((grandCollected / grandExpected) * 100) : 0;
                const grandRateColor = grandRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : grandRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-500 dark:text-red-400";
                return (
                  <tfoot className="bg-secondary/40 border-t-2 border-border print:border-black/20">
                    <tr className="text-foreground print:text-black font-black">
                      <td className="p-4 px-6 text-xs uppercase tracking-wider font-black">All Areas</td>
                      <td className="p-4 text-center text-xs">{villageBreakdown.reduce((s, v) => s + v.totalClients, 0)}</td>
                      <td className="p-4 text-center text-xs">{villageBreakdown.reduce((s, v) => s + v.activeLoansCount, 0)}</td>
                      <td className="p-4 text-right text-sm">{formatLKR(grandExpected)}</td>
                      <td className="p-4 text-right text-sm text-green-600 dark:text-green-400">{formatLKR(grandCollected)}</td>
                      <td className={`p-4 text-right text-sm ${grandRateColor}`}>{grandRate}%</td>
                      <td className="p-4 px-6 text-right text-sm text-red-500 dark:text-red-400">{formatLKR(grandOutstanding)}</td>
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </CardContent>
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
                        <td className="p-4 text-muted-foreground print:text-black/70 text-xs font-mono">{customer?.memberId || customer?.id.slice(0, 8) || "N/A"}</td>
                        <td className="p-4 text-muted-foreground print:text-black/70 text-xs">{inst.dueDate}</td>
                        <td className="p-4 text-right font-bold text-sm">{formatLKR(inst.amount)}</td>
                        <td className="p-4 px-6 text-right flex justify-end">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inst.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 print:bg-transparent print:text-black" :
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
