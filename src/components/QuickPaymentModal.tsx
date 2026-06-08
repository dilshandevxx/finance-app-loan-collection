"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, MessageCircle } from "lucide-react";
import { Customer } from "@/data/db";
import { config } from "@/lib/config";
import { formatLKR, phoneToDial, formatLKPhone } from "@/lib/format";
import { getReceiptDetails, getCompanySettingsAction } from "@/app/actions";

type QuickPaymentModalProps = {
  customer: Customer;
  expectedAmount: number;
  installmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
};

interface ReceiptDetails {
  installment: {
    id: string;
    amount: number;
    dueDate: string;
    paidDate: string | null;
    status: string;
    index: number;
    totalCount: number;
  };
  loan: {
    id: string;
    principalAmount: number;
    totalAmountDue: number;
    remainingBalance: number;
    previousBalance: number;
    weeklyInstallment: number;
    totalPaid: number;
  };
  customer: {
    name: string;
    phone: string;
    memberId: string | null;
    idNumber?: string | null;
    address?: string | null;
  };
  companyName?: string;
}

export function QuickPaymentModal({
  customer,
  expectedAmount,
  installmentId,
  isOpen,
  onClose,
  onConfirm,
}: QuickPaymentModalProps) {
  const [amount, setAmount] = useState<string>(expectedAmount.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptDetails | null>(null);
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [agentCompany, setAgentCompany] = useState("");
  const [agentPhone, setAgentPhone] = useState("");

  useEffect(() => {
    if (isOpen) {
      const handle = requestAnimationFrame(() => {
        setAmount(expectedAmount.toString());
        setIsSuccess(false);
        setIsOfflineSaved(false);
        setIsProcessing(false);
        setReceiptData(null);
        setIsSharingPdf(false);
        
        // Default to localStorage first
        setAgentCompany(localStorage.getItem("agentCompany") || "");
        setAgentPhone(localStorage.getItem("agentPhone") || "");
        
        // Then override with Supabase settings if configured
        getCompanySettingsAction().then(settings => {
          if (settings) {
            if (settings.name) {
              setAgentCompany(settings.name);
              localStorage.setItem("agentCompany", settings.name);
            }
            if (settings.phone) {
              setAgentPhone(settings.phone);
              localStorage.setItem("agentPhone", settings.phone);
            }
          }
        }).catch(console.error);
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [isOpen, expectedAmount]);

  if (!isOpen) return null;

  const handleCompanyChange = (v: string) => { setAgentCompany(v); localStorage.setItem("agentCompany", v); };
  const handlePhoneChange = (v: string) => { setAgentPhone(v); localStorage.setItem("agentPhone", v); };

  const handleConfirm = async () => {
    setIsProcessing(true);
    const finalAmount = parseFloat(amount) || expectedAmount;

    try {
      // Check online status first
      if (typeof window !== 'undefined' && !navigator.onLine) {
        throw new Error("offline");
      }

      await onConfirm(finalAmount);

      // Update local IndexedDB cache instantly
      try {
        const { updateLocalInstallmentPaid } = await import("@/lib/idb");
        await updateLocalInstallmentPaid(installmentId, finalAmount);
        window.dispatchEvent(new CustomEvent("local-cache-updated"));
      } catch (err) {
        console.error("Failed to update IndexedDB in online path:", err);
      }

      setIsSuccess(true);

      // Load detailed receipt details
      try {
        const details = await getReceiptDetails(installmentId);
        if (details) {
          setReceiptData(details);
        }
      } catch (err) {
        console.error("Failed to load receipt details", err);
      }
    } catch (error) {
      // If offline or network error, save to queue
      if (typeof window !== 'undefined' && (!navigator.onLine || (error as Error).message === "offline")) {
        const queue = JSON.parse(localStorage.getItem("offlineSyncQueue") || "[]");
        queue.push({
          type: "markInstallmentPaid",
          installmentId,
          amount: finalAmount,
          timestamp: Date.now()
        });
        localStorage.setItem("offlineSyncQueue", JSON.stringify(queue));

        // Update local IndexedDB cache instantly
        try {
          const { updateLocalInstallmentPaid } = await import("@/lib/idb");
          await updateLocalInstallmentPaid(installmentId, finalAmount);
          window.dispatchEvent(new CustomEvent("local-cache-updated"));
        } catch (err) {
          console.error("Failed to update IndexedDB in offline path:", err);
        }

        window.dispatchEvent(new CustomEvent("offline-queue-updated"));
        setIsOfflineSaved(true);
        setIsSuccess(true);
      } else {
        console.error("Payment failed", error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppShare = () => {
    const finalAmount = parseFloat(amount) || expectedAmount;
    const formattedPhone = phoneToDial(customer.phone);
    const dateStr = new Date().toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const receiptId = `REC-${installmentId.slice(0, 8).toUpperCase()}`;

    let parsedAddressStr = "N/A";
    let nicStr = "N/A";
    if (receiptData) {
      try {
        if (receiptData.customer.address) {
          const parsed = JSON.parse(receiptData.customer.address);
          const parts = [];
          if (parsed.address) parts.push(parsed.address);
          if (parsed.state) parts.push(parsed.state);
          if (parts.length > 0) parsedAddressStr = parts.join(", ");
        }
      } catch (e) {
        parsedAddressStr = receiptData.customer.address || "N/A";
      }
      nicStr = receiptData.customer.idNumber || "N/A";
    }

    let message = "";
    if (receiptData) {
      const instNo = `${receiptData.installment.index} of ${receiptData.installment.totalCount}`;
      const prevBal = receiptData.loan.previousBalance;
      const newBal = receiptData.loan.remainingBalance;
      message = `🧾 *OFFICIAL RECEIPT* 🧾\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🏢 *${agentCompany || receiptData.companyName || config.appName}*\n` +
        (agentPhone ? `📞 *${agentPhone}*\n` : '') +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*Receipt No:* ${receiptId}\n` +
        `*Date:* ${dateStr}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*👤 CUSTOMER*\n` +
        `• Name: ${receiptData.customer.name}\n` +
        `• NIC: ${nicStr}\n` +
        `• ID: ${receiptData.customer.memberId || 'N/A'}\n` +
        `• Phone: ${formatLKPhone(receiptData.customer.phone)}\n` +
        `• Address: ${parsedAddressStr}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*📋 LOAN DETAILS*\n` +
        `• Principal (Given):     ${formatLKR(receiptData.loan.principalAmount)}\n` +
        `• Full Amount (+ Interest): ${formatLKR(receiptData.loan.totalAmountDue)}\n` +
        `• Weekly Installment:    ${formatLKR(receiptData.loan.weeklyInstallment)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*💰 TODAY'S PAYMENT*\n` +
        `• Installment No:  ${instNo}\n` +
        `• Due Amount:      ${formatLKR(receiptData.loan.weeklyInstallment)}\n` +
        `• *Customer Paid:  ${formatLKR(finalAmount)}* ✅\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*📊 BALANCE*\n` +
        `• Previous Balance: ${formatLKR(prevBal)}\n` +
        `• Paid Today:       - ${formatLKR(finalAmount)}\n` +
        `                    ──────────\n` +
        `• *New Balance:     ${formatLKR(newBal)}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• Total Paid So Far: ${formatLKR(receiptData.loan.totalPaid)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Thank you for your payment! 🙏\n`;
    } else {
      message = `🧾 *OFFICIAL RECEIPT* 🧾\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🏢 *${agentCompany || config.appName}*\n` +
        (agentPhone ? `📞 *${agentPhone}*\n` : '') +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*Receipt No:* ${receiptId}\n` +
        `*Date:* ${dateStr}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*👤 CUSTOMER*\n` +
        `• Name: ${customer.name}\n` +
        `• ID: ${customer.memberId || 'N/A'}\n` +
        `• Phone: ${formatLKPhone(customer.phone)}\n\n` +
        `*💰 TODAY'S PAYMENT*\n` +
        `• Customer Paid: *${formatLKR(finalAmount)}* ✅\n` +
        `• Status: PAID${isOfflineSaved ? ' (Pending Sync)' : ''}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Thank you for your payment! 🙏\n`;
    }

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePDFShare = async () => {
    setIsSharingPdf(true);
    try {
      const finalAmount = parseFloat(amount) || expectedAmount;
      const dateStr = new Date().toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      const receiptId = `REC-${installmentId.slice(0, 8).toUpperCase()}`;

      // Extract address safely
      let parsedAddressStr = "N/A";
      let nicStr = receiptData?.customer.idNumber || customer.idNumber || "N/A";
      const rawAddress = receiptData?.customer.address || customer.address;
      
      try {
        if (rawAddress) {
          const parsed = JSON.parse(rawAddress as string);
          const parts = [];
          if (parsed.address) parts.push(parsed.address);
          if (parsed.state) parts.push(parsed.state);
          if (parts.length > 0) parsedAddressStr = parts.join(", ");
        }
      } catch (e) {
        parsedAddressStr = (rawAddress as string) || "N/A";
      }

      // Compile receipt details data
      const pdfData = {
        receiptId,
        dateStr,
        customerName: receiptData?.customer.name || customer.name,
        memberId: receiptData?.customer.memberId || customer.memberId || "N/A",
        idNumber: nicStr,
        address: parsedAddressStr,
        phone: formatLKPhone(receiptData?.customer.phone || customer.phone),
        amountPaid: finalAmount,
        status: isOfflineSaved ? "PAID (OFFLINE)" : "PAID SUCCESSFUL",
        principal: receiptData?.loan.principalAmount || 0,
        totalLoanAmount: receiptData?.loan.totalAmountDue || 0,
        remainingBalance: receiptData?.loan.remainingBalance || 0,
        previousBalance: receiptData?.loan.previousBalance || 0,
        weeklyInstallment: receiptData?.loan.weeklyInstallment || 0,
        totalPaid: receiptData?.loan.totalPaid || finalAmount,
        installmentNo: receiptData
          ? `${receiptData.installment.index} of ${receiptData.installment.totalCount}`
          : "1 (Offline)",
        companyName: agentCompany || receiptData?.companyName || config.appName,
        agentPhone: agentPhone || undefined,
      };

      // Generate PDF
      const { generateReceiptPDF } = await import("@/lib/pdf");
      const doc = generateReceiptPDF(pdfData);

      const fileName = `Receipt-${receiptId}.pdf`;

      // Check Web Share API
      if (typeof window !== "undefined" && navigator.canShare) {
        const pdfBlob = doc.output("blob");
        const file = new File([pdfBlob], fileName, { type: "application/pdf" });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Payment Receipt - ${pdfData.customerName}`,
            text: `Payment Receipt for Rs. ${finalAmount.toLocaleString()}`,
          });
          setIsSharingPdf(false);
          return;
        }
      }

      // Fallback: direct download
      doc.save(fileName);
    } catch (err) {
      console.error("Error generating or sharing PDF:", err);
    } finally {
      setIsSharingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0 sm:pb-4">
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-border transform transition-all translate-y-0 sm:scale-100 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">

        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-border/60">
          <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">
            {isSuccess ? "Payment Recorded" : "Record Payment"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-secondary dark:hover:bg-muted text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isOfflineSaved ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-500' : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'}`}>
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-black tracking-tighter text-black dark:text-white">{formatLKR(parseFloat(amount || expectedAmount.toString()))}</span>
              <span className="text-sm font-medium text-gray-500 dark:text-white/50">Collected from {customer.name}</span>
            </div>

            {isOfflineSaved && (
              <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 p-3 rounded-xl text-sm font-medium w-full">
                Saved offline. Will sync automatically when internet is restored.
              </div>
            )}

            {/* Loan Summary Card - Clear breakdown */}
            {receiptData && (
              <div className="w-full bg-gray-50 dark:bg-muted/50 border border-gray-200 dark:border-border rounded-2xl p-4 text-left space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-white/40">Loan Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/60">Principal (Given)</span>
                    <span className="font-semibold text-black dark:text-white">{formatLKR(receiptData.loan.principalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/60">Full Amount</span>
                    <span className="font-semibold text-black dark:text-white">{formatLKR(receiptData.loan.totalAmountDue)}</span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-border" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/60">Installment</span>
                    <span className="font-medium text-black dark:text-white">{receiptData.installment.index} of {receiptData.installment.totalCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/60">Customer Paid</span>
                    <span className="font-bold text-primary">{formatLKR(parseFloat(amount || expectedAmount.toString()))}</span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-border" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/60">Previous Balance</span>
                    <span className="font-medium text-black dark:text-white">{formatLKR(receiptData.loan.previousBalance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-white/60">Paid Today</span>
                    <span className="font-medium text-primary">- {formatLKR(parseFloat(amount || expectedAmount.toString()))}</span>
                  </div>
                  <div className="flex justify-between text-sm bg-black/5 dark:bg-white/5 -mx-2 px-2 py-2 rounded-xl">
                    <span className="font-bold text-black dark:text-white">Remaining Balance</span>
                    <span className="font-black text-black dark:text-white">{formatLKR(receiptData.loan.remainingBalance)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full mt-1">
              <button
                onClick={handlePDFShare}
                disabled={isSharingPdf}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm border-none cursor-pointer disabled:opacity-75"
              >
                {isSharingPdf ? (
                  <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Share / Download PDF
                  </>
                )}
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm border-none cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" /> Share via WhatsApp
              </button>

              <button
                onClick={onClose}
                className="w-full h-14 bg-gray-100 hover:bg-gray-200 dark:bg-secondary dark:hover:bg-muted text-black dark:text-white rounded-2xl font-bold text-lg transition-all border-none cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 sm:p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border">
                <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-lg font-bold shrink-0">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-black dark:text-white">{customer.name}</span>
                  <span className="text-xs text-gray-500 dark:text-white/50">{formatLKPhone(customer.phone)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount Collected</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-sm font-bold text-black dark:text-white">Rs.</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white dark:bg-card border-2 border-gray-200 focus:border-primary dark:border-border dark:focus:border-primary rounded-2xl pl-12 pr-4 py-4 text-3xl font-bold text-black dark:text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {[expectedAmount, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${amount === preset.toString()
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-white text-black border-gray-200 hover:bg-gray-50 dark:bg-secondary dark:text-white dark:border-border dark:hover:bg-muted"
                      }`}
                  >
                    {preset === expectedAmount ? formatLKR(preset) : `Rs. ${preset.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 pt-0">
              <div className="flex flex-col gap-3 mb-6 bg-gray-50 dark:bg-muted/50 p-4 rounded-2xl border border-gray-100 dark:border-border">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Receipt Details</p>
                <input
                  type="text"
                  placeholder="Company/Agent Name"
                  value={agentCompany}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Agent Phone Number"
                  value={agentPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-primary/20 border-none cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Confirm Payment
                  </>
                )}
              </button>
            </div>
          </>
        )}

        <div className="h-[env(safe-area-inset-bottom)] bg-white dark:bg-card" />
      </div>
    </div>
  );
}
