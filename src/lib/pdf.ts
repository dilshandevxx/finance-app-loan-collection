import { jsPDF } from "jspdf";

export type ReceiptPDFData = {
  receiptId: string;
  dateStr: string;
  customerName: string;
  memberId: string;
  phone: string;
  amountPaid: number;
  status: string;
  principal: number;
  remainingBalance: number;
  totalPaid: number;
  installmentNo: string;
  companyName: string;
};

export function generateReceiptPDF(data: ReceiptPDFData): jsPDF {
  // Create a thermal receipt size PDF (80mm width x 140mm height)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 140],
  });

  // Margins & dimensions
  const pageWidth = doc.internal.pageSize.getWidth(); // should be 80
  const cx = pageWidth / 2;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(data.companyName.toUpperCase(), cx, 12, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("DAILY LOAN COLLECTION RECEIPT", cx, 17, { align: "center" });

  // Divider Line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(5, 20, 75, 20);

  // Metadata
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Receipt No:", 5, 25);
  doc.setFont("helvetica", "normal");
  doc.text(data.receiptId, 25, 25);

  doc.setFont("helvetica", "bold");
  doc.text("Date/Time:", 5, 29);
  doc.setFont("helvetica", "normal");
  doc.text(data.dateStr, 25, 29);

  // Divider Line
  doc.line(5, 33, 75, 33);

  // Client Details
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT DETAILS", 5, 38);

  doc.setFont("helvetica", "normal");
  doc.text(`Name:`, 5, 43);
  doc.text(data.customerName, 25, 43);

  doc.text(`Member ID:`, 5, 47);
  doc.text(data.memberId, 25, 47);

  doc.text(`Phone:`, 5, 51);
  doc.text(data.phone, 25, 51);

  // Divider Line
  doc.line(5, 55, 75, 55);

  // Payment Summary
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT SUMMARY", 5, 60);

  doc.setFont("helvetica", "normal");
  doc.text("Installment:", 5, 65);
  doc.text(data.installmentNo, 35, 65);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Amount Paid:", 5, 71);
  doc.text(`Rs. ${data.amountPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 35, 71);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Status:", 5, 77);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94); // Emerald Green
  doc.text(data.status, 35, 77);
  doc.setTextColor(0, 0, 0); // Reset color

  // Divider Line
  doc.line(5, 81, 75, 81);

  // Loan Progress Balance
  doc.setFont("helvetica", "bold");
  doc.text("LOAN BALANCE ACCOUNT", 5, 86);

  doc.setFont("helvetica", "normal");
  doc.text("Principal:", 5, 91);
  doc.text(`Rs. ${data.principal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 35, 91);

  doc.text("Total Paid:", 5, 95);
  doc.text(`Rs. ${data.totalPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 35, 95);

  doc.setFont("helvetica", "bold");
  doc.text("Remaining:", 5, 100);
  doc.text(`Rs. ${data.remainingBalance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 35, 100);

  // Divider Line
  doc.line(5, 105, 75, 105);

  // Footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text("Thank you for your payment!", cx, 112, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.text("This is an official computer-generated receipt.", cx, 116, { align: "center" });

  // Border Outer Frame
  doc.setDrawColor(200, 200, 200);
  doc.rect(2, 2, 76, 136);

  return doc;
}
