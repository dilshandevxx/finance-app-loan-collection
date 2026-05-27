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

  const principalAmount = parseFloat(principalStr);
  const interest = parseFloat(interestStr);
  const weeks = parseInt(weeksStr);

  const existingCustomerId = formData.get("existingCustomerId") as string | null;

  if (isNaN(principalAmount) || isNaN(interest) || isNaN(weeks) || weeks <= 0) {
    throw new Error("Invalid loan input");
  }

  let customerId = existingCustomerId;

  if (!customerId) {
    if (!name || !phone) throw new Error("Name and phone required for new customer");
    
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name,
        phone,
        member_id: memberId || null,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
      })
      .select()
      .single();
      
    if (customerError) throw new Error(customerError.message);
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

  if (loanError) throw new Error(loanError.message);

  const installments = [];
  let currentDate = new Date();
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

  if (installmentsError) throw new Error(installmentsError.message);

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
