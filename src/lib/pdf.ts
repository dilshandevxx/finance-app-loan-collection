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
};

function fmtRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
}

export function generateReceiptPDF(data: ReceiptPDFData): jsPDF {
  // Create a thermal receipt size PDF (80mm width x 170mm height - taller for more detail)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 175],
  });

  // Margins & dimensions
  const pageWidth = doc.internal.pageSize.getWidth(); // 80
  const cx = pageWidth / 2;
  const lx = 5;  // left margin
  const rx = 75; // right margin
  let y = 0;

  // ── HEADER ─────────────────────────────────────────────
  y = 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(data.companyName.toUpperCase(), cx, y, { align: "center" });

  y = 17;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("OFFICIAL PAYMENT RECEIPT", cx, y, { align: "center" });

  y = 20;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(lx, y, rx, y);

  // ── RECEIPT INFO ───────────────────────────────────────
  y = 25;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", lx, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.receiptId, 25, y);

  y = 29;
  doc.setFont("helvetica", "bold");
  doc.text("Date/Time:", lx, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.dateStr, 25, y);

  y = 33;
  doc.line(lx, y, rx, y);

  // ── CUSTOMER DETAILS ───────────────────────────────────
  y = 38;
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER", lx, y);

  doc.setFont("helvetica", "normal");
  y = 43; doc.text("Name:", lx, y); doc.text(data.customerName, 25, y);
  y = 47; doc.text("NIC:", lx, y); doc.text(data.idNumber, 25, y);
  y = 51; doc.text("ID:", lx, y); doc.text(data.memberId, 25, y);
  y = 55; doc.text("Phone:", lx, y); doc.text(data.phone, 25, y);
  y = 59; doc.text("Address:", lx, y);
  const splitAddress = doc.splitTextToSize(data.address, 50);
  doc.text(splitAddress, 25, y);

  y = 65;
  doc.line(lx, y, rx, y);

  // ── LOAN DETAILS (Clear Section) ───────────────────────
  y = 67;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 230);
  doc.rect(lx, y, 70, 6, "F");
  doc.text("LOAN DETAILS", cx, y + 4.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  y = 77; doc.text("Principal (Given):", lx, y);
  doc.text(fmtRs(data.principal), rx, y, { align: "right" });

  y = 82; doc.text("Full Amount (+ Interest):", lx, y);
  doc.text(fmtRs(data.totalLoanAmount), rx, y, { align: "right" });

  y = 87; doc.text("Weekly Installment:", lx, y);
  doc.text(fmtRs(data.weeklyInstallment), rx, y, { align: "right" });

  y = 91;
  doc.setLineWidth(0.2);
  doc.line(lx, y, rx, y);

  // ── TODAY'S PAYMENT ────────────────────────────────────
  y = 93;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 230);
  doc.rect(lx, y, 70, 6, "F");
  doc.text("TODAY'S PAYMENT", cx, y + 4.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  y = 103; doc.text("Installment No:", lx, y);
  doc.text(data.installmentNo, rx, y, { align: "right" });

  y = 108; doc.text("Due Amount:", lx, y);
  doc.text(fmtRs(data.weeklyInstallment), rx, y, { align: "right" });

  y = 114;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Customer Paid:", lx, y);
  doc.text(fmtRs(data.amountPaid), rx, y, { align: "right" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  y = 119; doc.text("Status:", lx, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94); // Emerald Green
  doc.text(data.status, rx, y, { align: "right" });
  doc.setTextColor(0, 0, 0);

  y = 123;
  doc.setLineWidth(0.2);
  doc.line(lx, y, rx, y);

  // ── BALANCE (Clear calculation) ────────────────────────
  y = 125;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 230, 230);
  doc.rect(lx, y, 70, 6, "F");
  doc.text("BALANCE", cx, y + 4.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  y = 135; doc.text("Previous Balance:", lx, y);
  doc.text(fmtRs(data.previousBalance), rx, y, { align: "right" });

  y = 140; doc.text("Paid Today:", lx, y);
  doc.text(`- ${fmtRs(data.amountPaid)}`, rx, y, { align: "right" });

  y = 144;
  doc.setLineWidth(0.3);
  doc.line(35, y, rx, y);

  y = 149;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("New Balance:", lx, y);
  doc.text(fmtRs(data.remainingBalance), rx, y, { align: "right" });

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  y = 155; doc.text("Total Paid So Far:", lx, y);
  doc.text(fmtRs(data.totalPaid), rx, y, { align: "right" });

  y = 159;
  doc.setLineWidth(0.3);
  doc.line(lx, y, rx, y);

  // ── FOOTER ─────────────────────────────────────────────
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  y = 163;
  doc.text("Thank you for your payment!", cx, y, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(100, 100, 100);
  y = 167;
  doc.text("This is an official computer-generated receipt.", cx, y, { align: "center" });

  // Border Outer Frame
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(2, 2, 76, 172);

  return doc;
}
