"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export async function createLoan(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const memberId = formData.get("memberId") as string;
  const principalStr = formData.get("principal") as string;
  const interestStr = formData.get("interest") as string;
  const weeksStr = formData.get("weeks") as string;
  const gender = formData.get("gender") as string || "male";
  const stateVal = formData.get("state") as string || "";
  const addressVal = formData.get("address") as string || "";
  const avatarDataUrl = formData.get("avatarDataUrl") as string || "";
  const companyNameVal = formData.get("companyName") as string || "";
  const idNumberVal = formData.get("idNumber") as string || "";

  const principalAmount = parseFloat(principalStr);
  const interest = parseFloat(interestStr);
  const weeks = parseInt(weeksStr);

  const existingCustomerId = formData.get("existingCustomerId") as string | null;

  if (isNaN(principalAmount) || principalAmount <= 0) {
    return { error: "Please enter a valid principal amount greater than 0." };
  }
  if (isNaN(interest) || interest < 0) {
    return { error: "Please enter a valid interest rate." };
  }
  if (isNaN(weeks) || weeks <= 0) {
    return { error: "Please enter a valid loan duration (weeks)." };
  }

  let customerId = existingCustomerId || null;

  if (!customerId) {
    if (!name || !phone) {
      return { error: "Name and phone number are required for a new customer." };
    }
    
    const avatarUrl = avatarDataUrl || (gender === "female"
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}&top=bigHair,bob,bun,curly,curvy,dreads01,dreads02,frida,froAndBand,frizzle,miaWallace,longButNotTooLong,straight01,straight02,straightAndStrand&facialHairProbability=0`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}&top=dreads,fro,shavedSides,shaggy,shaggyMullet,shortCurly,shortFlat,shortRound,shortWaved,sides,theCaesar,theCaesarAndSidePart&facialHairProbability=40`);

    let serializedAddress = null;
    if (stateVal.trim() || addressVal.trim() || companyNameVal.trim() || idNumberVal.trim()) {
      serializedAddress = JSON.stringify({
        state: stateVal.trim(),
        address: addressVal.trim(),
        companyName: companyNameVal.trim(),
        idNumber: idNumberVal.trim()
      });
    }

    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        member_id: memberId?.trim() || null,
        avatar_url: avatarUrl,
        address: serializedAddress
      })
      .select()
      .single();
      
    if (customerError) {
      console.error("Customer insert error:", customerError);
      return { error: `Failed to create customer: ${customerError.message}` };
    }
    customerId = newCustomer.id;
  }

  const totalAmountDue = principalAmount * (1 + interest / 100);
  const weeklyInstallment = totalAmountDue / weeks;
  const startDate = new Date().toISOString().split('T')[0];

  const { data: newLoan, error: loanError } = await supabase
    .from("loans")
    .insert({
      customer_id: customerId,
      principal_amount: principalAmount,
      total_amount_due: totalAmountDue,
      remaining_balance: totalAmountDue,
      weekly_installment: weeklyInstallment,
      start_date: startDate,
      status: "ACTIVE"
    })
    .select()
    .single();

  if (loanError) {
    console.error("Loan insert error:", loanError);
    return { error: `Failed to create loan: ${loanError.message}` };
  }

  const installments = [];
  const currentDate = new Date();
  for (let i = 0; i < weeks; i++) {
    currentDate.setDate(currentDate.getDate() + 7);
    installments.push({
      loan_id: newLoan.id,
      amount: weeklyInstallment,
      due_date: currentDate.toISOString().split('T')[0],
      status: "PENDING"
    });
  }

  const { error: installmentsError } = await supabase
    .from("installments")
    .insert(installments);

  if (installmentsError) {
    console.error("Installments insert error:", installmentsError);
    return { error: `Loan created but installments failed: ${installmentsError.message}` };
  }

  revalidatePath("/");
  redirect("/");
}

export async function markInstallmentPaid(installmentId: string) {
  // Get installment
  const { data: installment, error: instError } = await supabase
    .from("installments")
    .select("*")
    .eq("id", installmentId)
    .single();

  if (instError || !installment) return { error: "Installment not found" };

  // Update installment
  await supabase
    .from("installments")
    .update({ 
      status: "PAID", 
      paid_date: new Date().toISOString().split('T')[0] 
    })
    .eq("id", installmentId);

  // Update loan balance
  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", installment.loan_id)
    .single();

  if (loan) {
    const newBalance = Math.max(0, loan.remaining_balance - installment.amount);
    await supabase
      .from("loans")
      .update({
        remaining_balance: newBalance,
        status: newBalance <= 0 ? "PAID_OFF" : loan.status
      })
      .eq("id", loan.id);
  }

  revalidatePath("/");
  revalidatePath("/customers/[id]", "page");
  revalidatePath("/reports");
  
  return { success: true };
}

export async function addCustomerNote(customerId: string, note: string) {
  const { data, error } = await supabase
    .from("customer_notes")
    .insert({
      customer_id: customerId,
      note: note
    });

  if (error) {
    console.error("Error adding customer note:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function postponeInstallments(loanId: string, weeksToShift: number) {
  // Get all unpaid installments (PENDING or MISSED)
  const { data: installments, error: instError } = await supabase
    .from("installments")
    .select("*")
    .eq("loan_id", loanId)
    .in("status", ["PENDING", "MISSED"]);

  if (instError || !installments) {
    return { success: false, error: "No pending installments found" };
  }

  // Shift each due_date forward by weeksToShift * 7 days
  const shiftDays = weeksToShift * 7;
  for (const inst of installments) {
    const originalDate = new Date(inst.due_date);
    originalDate.setDate(originalDate.getDate() + shiftDays);
    const newDueDate = originalDate.toISOString().split("T")[0];

    await supabase
      .from("installments")
      .update({ due_date: newDueDate })
      .eq("id", inst.id);
  }

  // Find loan to log customer note
  const { data: loan } = await supabase
    .from("loans")
    .select("customer_id")
    .eq("id", loanId)
    .single();

  if (loan) {
    await supabase.from("customer_notes").insert({
      customer_id: loan.customer_id,
      note: `Payment Holiday: Postponed all remaining installments by ${weeksToShift} week(s).`
    });
    revalidatePath(`/customers/${loan.customer_id}`);
  }

  revalidatePath("/");
  revalidatePath("/customers");
  return { success: true };
}

export async function restructureWeeklyInstallment(loanId: string, newAmount: number) {
  // Update loan weekly installment amount
  const { error: loanError } = await supabase
    .from("loans")
    .update({ weekly_installment: newAmount })
    .eq("id", loanId);

  if (loanError) {
    return { success: false, error: `Failed to update loan: ${loanError.message}` };
  }

  // Update amount for all pending/missed installments
  const { error: instError } = await supabase
    .from("installments")
    .update({ amount: newAmount })
    .eq("loan_id", loanId)
    .in("status", ["PENDING", "MISSED"]);

  if (instError) {
    return { success: false, error: `Failed to update installments: ${instError.message}` };
  }

  // Find loan to log note
  const { data: loan } = await supabase
    .from("loans")
    .select("customer_id")
    .eq("id", loanId)
    .single();

  if (loan) {
    await supabase.from("customer_notes").insert({
      customer_id: loan.customer_id,
      note: `Restructured Loan: Adjusted weekly installment amount to $${newAmount.toFixed(2)}.`
    });
    revalidatePath(`/customers/${loan.customer_id}`);
  }

  revalidatePath("/");
  revalidatePath("/customers");
  return { success: true };
}

export async function clearAllData() {
  try {
    // 1. Delete customer notes
    const { error: notesErr } = await supabase.from("customer_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (notesErr) console.error("Error deleting customer_notes:", notesErr);

    // 2. Delete installments
    const { error: instErr } = await supabase.from("installments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (instErr) console.error("Error deleting installments:", instErr);

    // 3. Delete loans
    const { error: loansErr } = await supabase.from("loans").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (loansErr) console.error("Error deleting loans:", loansErr);

    // 4. Delete customers
    const { error: custErr } = await supabase.from("customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (custErr) console.error("Error deleting customers:", custErr);

    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath("/reports");
    
    return { success: true };
  } catch (err: any) {
    console.error("Error in clearAllData action:", err);
    return { success: false, error: err?.message || "Failed to clear database tables" };
  }
}

import { getSystemVillages, addSystemVillage } from "@/data/db";

export async function fetchSystemVillages() {
  return await getSystemVillages();
}

export async function createSystemVillage(villageName: string) {
  const res = await addSystemVillage(villageName);
  revalidatePath("/settings");
  revalidatePath("/new");
  return res;
}

