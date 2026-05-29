/**
 * Shared formatting utilities for Sri Lanka locale
 */

// ── Currency ──────────────────────────────────────────────────────────
// Format a number as Sri Lankan Rupees: Rs. 1,250.00
export function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Short format without decimals for large display numbers: Rs. 1,250
export function formatLKRShort(amount: number): string {
  return `Rs. ${Math.floor(amount).toLocaleString("en-LK")}`;
}

// Decimal part only e.g. ".50" → "50"
export function formatLKRDecimal(amount: number): string {
  return (amount % 1).toFixed(2).substring(2);
}

// ── Phone ─────────────────────────────────────────────────────────────
// Format a raw phone string to Sri Lanka format: 071 234 5678
export function formatLKPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Handle +94 international prefix → convert to local 0XX
  const local = digits.startsWith("94") ? "0" + digits.slice(2) : digits;
  if (local.length === 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone; // return as-is if format is unexpected
}

// Strip to digits-only for tel:/wa.me links
export function phoneToDial(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Convert local 0XX to +94 for international dialling
  if (digits.startsWith("0") && digits.length === 10) {
    return "94" + digits.slice(1);
  }
  return digits;
}
