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
  doc.text("OFFICIAL PAYMENT RECEIPT", cx, 17, { align: "center" });

  // Divider Line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
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

  doc.text(`ID (NIC):`, 5, 47);
  doc.text(data.idNumber, 25, 47);

  doc.text(`User ID:`, 5, 51);
  doc.text(data.memberId, 25, 51);

  doc.text(`Phone:`, 5, 55);
  doc.text(data.phone, 25, 55);

  doc.text(`Address:`, 5, 59);
  const splitAddress = doc.splitTextToSize(data.address, 50);
  doc.text(splitAddress, 25, 59);

  // Divider Line
  doc.line(5, 65, 75, 65);

  // Payment Summary
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(5, 67, 70, 6, "F");
  doc.text("PAYMENT DETAILS", 40, 71.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.text("Installment No:", 5, 77);
  doc.text(data.installmentNo, 75, 77, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Amount Paid:", 5, 83);
  doc.text(`Rs. ${data.amountPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 75, 83, { align: "right" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Status:", 5, 89);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94); // Emerald Green
  doc.text(data.status, 75, 89, { align: "right" });
  doc.setTextColor(0, 0, 0); // Reset color

  // Loan Progress Balance
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(5, 93, 70, 6, "F");
  doc.text("LOAN ACCOUNT SUMMARY", 40, 97.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.text("Loan Principal:", 5, 104);
  doc.text(`Rs. ${data.principal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 75, 104, { align: "right" });

  doc.text("Full Amount:", 5, 109);
  doc.text(`Rs. ${data.totalLoanAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 75, 109, { align: "right" });

  doc.text("Total Paid to Date:", 5, 114);
  doc.text(`Rs. ${data.totalPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 75, 114, { align: "right" });

  doc.text("Customer Paid Amount:", 5, 119);
  doc.text(`Rs. ${data.amountPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 75, 119, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("Remaining Balance:", 5, 125);
  doc.setFontSize(10);
  doc.text(`Rs. ${data.remainingBalance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, 75, 125, { align: "right" });

  // Divider Line
  doc.setFontSize(7.5);
  doc.setLineWidth(0.3);
  doc.line(5, 130, 75, 130);

  // Footer
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your business!", cx, 134, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(100, 100, 100);
  doc.text("This is an official computer-generated receipt.", cx, 137, { align: "center" });

  // Border Outer Frame
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(2, 2, 76, 138);

  return doc;
}
