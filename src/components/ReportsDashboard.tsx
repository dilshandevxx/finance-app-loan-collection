"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, Printer, Calendar, Table } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Customer, Installment, Loan } from "@/data/db";

type ReportsDashboardProps = {
  installments: Installment[];
  loans: Loan[];
  customers: Customer[];
};

export function ReportsDashboard({ installments, loans, customers }: ReportsDashboardProps) {
  const [startDate, setStartDate] = useState("2024-07-01");
  const [endDate, setEndDate] = useState("2024-07-31");

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
        inst.amount.toFixed(2)
      ];
    });
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
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
    if (filteredInstallments.length === 0) return alert("No data to export for this period.");
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c6dbf]/5 rounded-full blur-[50px] pointer-events-none -z-0" />
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Start Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-secondary border border-border rounded-2xl pl-4 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-[#7c6dbf]/50 transition w-full"
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
                className="bg-secondary border border-border rounded-2xl pl-4 pr-10 py-3 text-sm text-foreground focus:outline-none focus:border-[#7c6dbf]/50 transition w-full"
                style={{ colorScheme: "dark" }}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto relative z-10 mt-2 sm:mt-0">
          <Button onClick={exportExcel} className="flex-1 sm:flex-none bg-[#7c6dbf]/10 text-[#7c6dbf] hover:bg-[#7c6dbf]/20 border border-[#7c6dbf]/20 rounded-2xl px-2 sm:px-5 h-12 gap-1.5 shadow-sm text-xs sm:text-sm font-bold active:scale-95 transition-all">
            <Table className="w-4 h-4 shrink-0" /> Excel
          </Button>
          <Button onClick={exportCSV} className="flex-1 sm:flex-none bg-[#6ab4e8]/10 text-[#6ab4e8] hover:bg-[#6ab4e8]/20 border border-[#6ab4e8]/20 rounded-2xl px-2 sm:px-5 h-12 gap-1.5 shadow-sm text-xs sm:text-sm font-bold active:scale-95 transition-all">
            <Download className="w-4 h-4 shrink-0" /> CSV
          </Button>
          <Button onClick={exportPDF} className="flex-1 sm:flex-none bg-secondary text-foreground hover:bg-border/50 border border-border rounded-2xl px-2 sm:px-5 h-12 gap-1.5 shadow-sm text-xs sm:text-sm font-bold active:scale-95 transition-all">
            <Printer className="w-4 h-4 shrink-0" /> PDF
          </Button>
        </div>
      </section>

      <div className="hidden print:block text-black mb-8 text-center border-b border-black/20 pb-4">
        <h1 className="text-3xl font-bold">Loan Collection Report</h1>
        <p className="text-sm mt-2">Period: {startDate || "All Time"} to {endDate || "All Time"}</p>
        <p className="text-xs mt-1 text-black/50" suppressHydrationWarning>Generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Summary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c6dbf]/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-6 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Expected</span>
            <div className="text-3xl font-black mt-1 text-foreground tracking-tight">${totalExpected.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#6ab4e8]/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-6 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Collected</span>
            <div className="text-3xl font-black mt-1 text-[#6ab4e8] tracking-tight">${totalCollected.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e05470]/10 rounded-full blur-[30px] -z-0" />
          <CardContent className="p-6 relative z-10">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Pending</span>
            <div className="text-3xl font-black mt-1 text-[#e05470] tracking-tight">${totalPending.toFixed(2)}</div>
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
                      <stop offset="5%" stopColor="#6ab4e8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6ab4e8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c6dbf" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#7c6dbf" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#6b6899' }} 
                    dy={10}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#6b6899' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1a36', borderRadius: '16px', border: '1px solid #2e2a4a', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', color: '#f0eeff' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    labelStyle={{ color: '#9e99c8', marginBottom: '8px', fontSize: '12px' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, undefined]}
                    cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expected" 
                    stroke="#7c6dbf" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorExpected)" 
                    name="Expected"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    stroke="#6ab4e8" 
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
                        <td className="p-4 text-right font-bold text-sm">${inst.amount.toFixed(2)}</td>
                        <td className="p-4 px-6 text-right flex justify-end">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inst.status === "PAID" ? "bg-[#9dedc8]/10 text-[#9dedc8] border border-[#9dedc8]/20 print:bg-transparent print:text-black" :
                            inst.status === "PENDING" ? "bg-[#e8849a]/10 text-[#e8849a] border border-[#e8849a]/20 print:bg-transparent print:text-yellow-700" :
                            "bg-[#e05470]/10 text-[#e05470] border border-[#e05470]/20 print:bg-transparent print:text-red-700"
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
