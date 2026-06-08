import { jsPDF } from "jspdf";

export type ReceiptPDFData = {
  receiptId: string;
  dateStr: string;
  customerName: string;
  memberId: string;
  idNumber: string;
  address: string;
  phone: string;
  amountPaid: number;
  status: string;
  principal: number;
  totalLoanAmount: number;
  remainingBalance: number;
  previousBalance: number;
  weeklyInstallment: number;
  totalPaid: number;
  installmentNo: string;
  companyName: string;
  agentPhone?: string;
};

function fmtRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export function generateReceiptPDF(data: ReceiptPDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const cx = pageWidth / 2;
  const lx = 5;
  const rx = 75;
  let y = 0;

  y = 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(data.companyName.toUpperCase(), cx, y, { align: "center" });

  if (data.agentPhone) {
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Phone: ${data.agentPhone}`, cx, y, { align: "center" });
  }

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("OFFICIAL PAYMENT RECEIPT", cx, y, { align: "center" });

  y += 3;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(lx, y, rx, y);

  y += 5;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", lx, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.receiptId, 25, y);

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Date/Time:", lx, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.dateStr, 25, y);

  y += 4;
  doc.line(lx, y, rx, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER", lx, y);

  doc.setFont("helvetica", "normal");
  y += 5; doc.text("Name:", lx, y); doc.text(data.customerName, 25, y);
  y += 4; doc.text("NIC:", lx, y); doc.text(data.idNumber, 25, y);
  y += 4; doc.text("ID:", lx, y); doc.text(data.memberId, 25, y);
  y += 4; doc.text("Phone:", lx, y); doc.text(data.phone, 25, y);
  y += 4; doc.text("Address:", lx, y);
  const splitAddress = doc.splitTextToSize(data.address, 50);
  doc.text(splitAddress, 25, y);

  y += splitAddress.length * 3 + 2;
  doc.line(lx, y, rx, y);

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 230);
  doc.rect(lx, y, 70, 6, "F");
  doc.text("LOAN DETAILS", cx, y + 4.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  y += 10; doc.text("Principal (Given):", lx, y);
  doc.text(fmtRs(data.principal), rx, y, { align: "right" });

  y += 5; doc.text("Full Amount:", lx, y);
  doc.text(fmtRs(data.totalLoanAmount), rx, y, { align: "right" });

  y += 5; doc.text("Installment:", lx, y);
  doc.text(fmtRs(data.weeklyInstallment), rx, y, { align: "right" });

  y += 4;
  doc.setLineWidth(0.2);
  doc.line(lx, y, rx, y);

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 230);
  doc.rect(lx, y, 70, 6, "F");
  doc.text("TODAY'S PAYMENT", cx, y + 4.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  y += 10; doc.text("Installment No:", lx, y);
  doc.text(data.installmentNo, rx, y, { align: "right" });

  y += 5; doc.text("Due Amount:", lx, y);
  doc.text(fmtRs(data.weeklyInstallment), rx, y, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Customer Paid:", lx, y);
  doc.text(fmtRs(data.amountPaid), rx, y, { align: "right" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  y += 5; doc.text("Status:", lx, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94);
  doc.text(data.status, rx, y, { align: "right" });
  doc.setTextColor(0, 0, 0);

  y += 4;
  doc.setLineWidth(0.2);
  doc.line(lx, y, rx, y);

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 230);
  doc.rect(lx, y, 70, 6, "F");
  doc.text("BALANCE", cx, y + 4.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  y += 10; doc.text("Previous Balance:", lx, y);
  doc.text(fmtRs(data.previousBalance), rx, y, { align: "right" });

  y += 5; doc.text("Paid Today:", lx, y);
  doc.text(`- ${fmtRs(data.amountPaid)}`, rx, y, { align: "right" });

  y += 4;
  doc.setLineWidth(0.3);
  doc.line(35, y, rx, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("New Balance:", lx, y);
  doc.text(fmtRs(data.remainingBalance), rx, y, { align: "right" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  y += 6; doc.text("Total Paid So Far:", lx, y);
  doc.text(fmtRs(data.totalPaid), rx, y, { align: "right" });

  y += 4;
  doc.setLineWidth(0.3);
  doc.line(lx, y, rx, y);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  y += 5;
  doc.text("Thank you for your payment!", cx, y, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(100, 100, 100);
  y += 4;
  doc.text("This is an official computer-generated receipt.", cx, y, { align: "center" });

  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(2, 2, 76, y + 4);

  return doc;
}
