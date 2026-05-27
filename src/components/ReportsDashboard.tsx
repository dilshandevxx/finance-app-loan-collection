"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileText, Printer, Calendar, Table } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Customer, Installment, Loan } from "@/data/mock";

type ReportsDashboardProps = {
  installments: Installment[];
  loans: Loan[];
  customers: Customer[];
};

export function ReportsDashboard({ installments, loans, customers }: ReportsDashboardProps) {
  // Default to a 30-day window around the mock dates to ensure data shows up easily
  const [startDate, setStartDate] = useState("2024-07-01");
  const [endDate, setEndDate] = useState("2024-07-31");

  // Filter installments by selected date range
  const filteredInstallments = installments.filter((inst) => {
    // If no dates selected, show all
    if (!startDate && !endDate) return true;
    
    const instDate = new Date(inst.dueDate);
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date("2100-01-01");
    
    return instDate >= start && instDate <= end;
  });

  // Calculate summaries
  const totalExpected = filteredInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  const totalCollected = filteredInstallments
    .filter(inst => inst.status === "PAID")
    .reduce((sum, inst) => sum + inst.amount, 0);
  
  const totalPending = totalExpected - totalCollected;

  // Generate chart data
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
    if (filteredInstallments.length === 0) {
      alert("No data to export for this period.");
      return;
    }

    // Prepare CSV header
    const headers = ["ID", "Customer Name", "Member ID", "Due Date", "Status", "Amount"];
    
    // Prepare rows
    const rows = filteredInstallments.map(inst => {
      const loan = loans.find(l => l.id === inst.loanId);
      const customer = customers.find(c => c.id === loan?.customerId);
      return [
        inst.id,
        customer?.name || "Unknown",
        customer?.memberId || customer?.id || "N/A",
        inst.dueDate,
        inst.status,
        inst.amount.toFixed(2)
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Loan_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    if (filteredInstallments.length === 0) {
      alert("No data to export for this period.");
      return;
    }

    const headers = ["ID", "Customer Name", "Member ID", "Due Date", "Status", "Amount"];
    const rows = filteredInstallments.map(inst => {
      const loan = loans.find(l => l.id === inst.loanId);
      const customer = customers.find(c => c.id === loan?.customerId);
      return [
        inst.id,
        customer?.name || "Unknown",
        customer?.memberId || customer?.id || "N/A",
        inst.dueDate,
        inst.status,
        inst.amount
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `Loan_Report_${startDate}_to_${endDate}.xlsx`);
  };

  const exportPDF = () => {
    // We rely on CSS @media print rules to hide the UI and format the table cleanly
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      
      {/* Filters Area (Hidden during print) */}
      <section className="print:hidden bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-6">
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 dark:text-white/50 uppercase font-medium tracking-wider">Start Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl pl-4 pr-10 py-3 text-black dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition w-full sm:w-auto"
                style={{ colorScheme: "dark" }}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 dark:text-white/50 uppercase font-medium tracking-wider">End Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl pl-4 pr-10 py-3 text-black dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition w-full sm:w-auto"
                style={{ colorScheme: "dark" }}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button onClick={exportExcel} className="flex-1 sm:flex-none bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 rounded-xl px-2 sm:px-6 h-12 gap-1 sm:gap-2 shadow-sm text-xs sm:text-sm">
            <Table className="w-4 h-4 shrink-0" /> Excel
          </Button>
          <Button onClick={exportCSV} className="flex-1 sm:flex-none bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 border border-green-200 dark:border-green-500/20 rounded-xl px-2 sm:px-6 h-12 gap-1 sm:gap-2 shadow-sm text-xs sm:text-sm">
            <Download className="w-4 h-4 shrink-0" /> CSV
          </Button>
          <Button onClick={exportPDF} className="flex-1 sm:flex-none bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-xl px-2 sm:px-6 h-12 gap-1 sm:gap-2 shadow-sm text-xs sm:text-sm">
            <Printer className="w-4 h-4 shrink-0" /> PDF
          </Button>
        </div>
      </section>

      {/* Printable Report Title (Only visible during print) */}
      <div className="hidden print:block text-black mb-8 text-center border-b border-black/20 pb-4">
        <h1 className="text-3xl font-bold">Loan Collection Report</h1>
        <p className="text-sm mt-2">Period: {startDate || "All Time"} to {endDate || "All Time"}</p>
        <p className="text-xs mt-1 text-black/50" suppressHydrationWarning>Generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Summary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#0a0a0a] print:bg-white print:border-black/20 border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-gray-500 dark:text-white/50 print:text-black/60 text-sm font-medium">Expected Collections</span>
            <div className="text-3xl font-bold mt-2 text-black dark:text-white print:text-black tracking-tight">${totalExpected.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0a0a0a] print:bg-white print:border-black/20 border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-gray-500 dark:text-white/50 print:text-black/60 text-sm font-medium">Actually Collected</span>
            <div className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400 print:text-green-700 tracking-tight">${totalCollected.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#0a0a0a] print:bg-white print:border-black/20 border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-gray-500 dark:text-white/50 print:text-black/60 text-sm font-medium">Pending / Missed</span>
            <div className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400 print:text-red-700 tracking-tight">${totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
      </section>

      {/* Chart Section */}
      <section className="print:hidden">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4 tracking-tight">Collection Trends</h3>
        <Card className="bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-[#222] rounded-3xl overflow-hidden shadow-sm pt-6">
          <div className="h-[300px] w-full px-4 sm:px-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }} 
                    dy={10}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#000', fontWeight: 'bold' }}
                    labelStyle={{ color: '#888', marginBottom: '8px' }}
                    formatter={(value: any) => {
                      const num = Number(value) || 0;
                      return [`$${num.toFixed(2)}`, undefined];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expected" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorExpected)" 
                    name="Expected"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCollected)" 
                    name="Collected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-white/40">
                No data available for this date range
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Detailed Table */}
      <section>
        <h3 className="text-lg font-semibold text-black dark:text-white print:text-black mb-4 tracking-tight">Transaction Details</h3>
        <Card className="bg-white dark:bg-[#0a0a0a] print:bg-white print:border-black/20 print:shadow-none border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm print:text-black whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-[#111] print:bg-black/5 text-gray-500 dark:text-white/50 print:text-black/60 uppercase tracking-wider text-xs font-medium">
                <tr>
                  <th className="p-4 px-6 font-medium">Customer</th>
                  <th className="p-4 font-medium">Member ID</th>
                  <th className="p-4 font-medium">Due Date</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 px-6 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#222] print:divide-black/10">
                {filteredInstallments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 dark:text-white/40 print:text-black/50">
                      No transactions found for the selected period.
                    </td>
                  </tr>
                ) : (
                  filteredInstallments.map(inst => {
                    const loan = loans.find(l => l.id === inst.loanId);
                    const customer = customers.find(c => c.id === loan?.customerId);
                    
                    return (
                      <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-[#111] print:hover:bg-transparent transition-colors text-black dark:text-white print:text-black">
                        <td className="p-4 px-6 font-medium text-sm">{customer?.name || "Unknown"}</td>
                        <td className="p-4 text-gray-500 dark:text-white/60 print:text-black/70 text-xs">{customer?.memberId || customer?.id || "N/A"}</td>
                        <td className="p-4 text-gray-500 dark:text-white/60 print:text-black/70 text-xs">{inst.dueDate}</td>
                        <td className="p-4 text-right font-medium text-sm">${inst.amount.toFixed(2)}</td>
                        <td className="p-4 px-6 text-right">
                          <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                            inst.status === "PAID" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 print:bg-transparent print:text-green-700" :
                            inst.status === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 print:bg-transparent print:text-yellow-700" :
                            "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 print:bg-transparent print:text-red-700"
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
