"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { formatLKR, normalizePhone } from "@/lib/format";

export async function createLoan(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const phoneRaw = formData.get("phone") as string;
  const phone = normalizePhone(phoneRaw);
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
  const weeksRaw = parseInt(weeksStr);

  const existingCustomerId = formData.get("existingCustomerId") as string | null;

  if (isNaN(principalAmount) || principalAmount <= 0) {
    return { error: "Please enter a valid principal amount greater than 0." };
  }

  const isCustom = formData.get("isCustom") === "true";
  const preferredInstallmentStr = formData.get("preferredInstallment") as string;
  const preferredInstallment = parseFloat(preferredInstallmentStr);

  let weeks = weeksRaw;
  let interest = 40;

  if (isCustom && !isNaN(preferredInstallment) && preferredInstallment > 0) {
    const stdWeeks = 14;
    const stdInterest = principalAmount * 0.40;
    const stdTotal = principalAmount + stdInterest;

    // Step 1: Base weeks needed to pay standard total at preferred installment
    const weeksBase = Math.ceil(stdTotal / preferredInstallment);

    if (weeksBase > stdWeeks) {
      // Step 2: Extra weeks
      const weeksExtra = weeksBase - stdWeeks;

      // Step 3: Weekly profit of standard option, rounded to nearest 100 LKR
      const pHigh = Math.round((stdInterest / stdWeeks) / 100) * 100;

      // Step 4: Calculate full profit (standard interest + extra weeks * standard weekly profit)
      const interestAmt = stdInterest + (weeksExtra * pHigh);

      // Step 5: Interest rate is calculated
      interest = (interestAmt / principalAmount) * 100;

      // Step 6: Finally calculate weeks count needed to pay full amount
      weeks = Math.ceil((principalAmount + interestAmt) / preferredInstallment);
    } else {
      weeks = stdWeeks;
      interest = 40;
    }
  } else {
    weeks = 14;
    interest = 40;
  }

  if (isNaN(weeks) || weeks < 14) {
    return { error: "Please enter a valid loan duration of at least 14 weeks." };
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
        phone: phone,
        member_id: memberId?.trim() || null,
        avatar_url: avatarUrl,
        address: serializedAddress,
        company_name: companyNameVal.trim() || null,
        nic_number: idNumberVal.trim() || null,
        street_address: addressVal.trim() || null,
        village: stateVal.trim() || null
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
  
  // For custom installment, weekly installment is exactly the preferred installment,
  // otherwise it is totalAmountDue / weeks.
  const weeklyInstallment = (isCustom && !isNaN(preferredInstallment) && preferredInstallment > 0)
    ? preferredInstallment
    : totalAmountDue / weeks;

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
    
    let amount = weeklyInstallment;
    if (isCustom && !isNaN(preferredInstallment) && preferredInstallment > 0 && i === weeks - 1) {
      // The last installment settles the remaining balance
      amount = totalAmountDue - (weeklyInstallment * (weeks - 1));
      // Round to 2 decimal places to be safe with floats
      amount = Math.round(amount * 100) / 100;
    }

    installments.push({
      loan_id: newLoan.id,
      amount: amount,
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
  revalidatePath("/customers");
  return { success: true, customerId: newLoan.customer_id };
}

export async function getReceiptDetails(installmentId: string) {
  const supabase = await createClient();
  try {
    // 1. Fetch installment
    const { data: installment, error: instError } = await supabase
      .from("installments")
      .select("*")
      .eq("id", installmentId)
      .single();

    if (instError || !installment) {
      console.error("Error fetching installment for receipt:", instError);
      return null;
    }

    // 2. Fetch loan
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("*")
      .eq("id", installment.loan_id)
      .single();

    if (loanError || !loan) {
      console.error("Error fetching loan for receipt:", loanError);
      return null;
    }

    // 3. Fetch customer
    const { data: customer, error: custError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", loan.customer_id)
      .single();

    if (custError || !customer) {
      console.error("Error fetching customer for receipt:", custError);
      return null;
    }

    // 4. Fetch all installments of the loan to calculate progress
    const { data: allInstallments, error: allInstError } = await supabase
      .from("installments")
      .select("*")
      .eq("loan_id", loan.id)
      .order("due_date", { ascending: true });

    if (allInstError || !allInstallments) {
      console.error("Error fetching all installments for receipt:", allInstError);
      return null;
    }

    // Calculate installment index (1-based)
    const instIndex = allInstallments.findIndex(i => i.id === installmentId) + 1;
    const totalInstallmentsCount = allInstallments.length;

    // Calculate total amount paid so far
    const totalPaid = allInstallments
      .filter(i => i.status === "PAID")
      .reduce((sum, i) => sum + Number(i.amount), 0);

    // The current remaining_balance in DB is AFTER payment deduction.
    // Compute the previous balance (before this payment) for receipt clarity.
    const currentRemainingBalance = Number(loan.remaining_balance);
    const thisInstallmentPaid = Number(installment.amount);
    const previousBalance = currentRemainingBalance + thisInstallmentPaid;

    const { getUserProfile } = await import("./auth-actions");
    const profile = await getUserProfile();
    const companyName = profile?.companyName || "Loan Track";

    return {
      companyName,
      installment: {
        id: installment.id,
        amount: Number(installment.amount),
        dueDate: installment.due_date,
        paidDate: installment.paid_date,
        status: installment.status,
        index: instIndex,
        totalCount: totalInstallmentsCount,
      },
      loan: {
        id: loan.id,
        principalAmount: Number(loan.principal_amount),
        totalAmountDue: Number(loan.total_amount_due),
        remainingBalance: currentRemainingBalance,
        previousBalance,
        weeklyInstallment: Number(loan.weekly_installment),
        totalPaid,
      },
      customer: {
        name: customer.name,
        phone: customer.phone,
        memberId: customer.member_id,
        idNumber: customer.id_number,
        address: customer.address,
      }
    };
  } catch (err) {
    console.error("Error in getReceiptDetails action:", err);
    return null;
  }
}

export async function markInstallmentPaid(installmentId: string, customAmount?: number) {
  const supabase = await createClient();
  
  // Get installment
  const { data: installment, error: instError } = await supabase
    .from("installments")
    .select("*")
    .eq("id", installmentId)
    .single();

  if (instError || !installment) return { error: "Installment not found" };

  const amountPaid = customAmount !== undefined ? customAmount : Number(installment.amount);

  // Update loan balance first to ensure atomicity logically
  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", installment.loan_id)
    .single();

  if (!loan) return { error: "Loan not found" };

  const newBalance = Math.max(0, loan.remaining_balance - amountPaid);
  await supabase
    .from("loans")
    .update({
      remaining_balance: newBalance,
      status: newBalance <= 0 ? "PAID_OFF" : loan.status
    })
    .eq("id", loan.id);

  // Update installment
  await supabase
    .from("installments")
    .update({
      amount: amountPaid,
      status: "PAID",
      paid_date: new Date().toISOString()
    })
    .eq("id", installmentId);

  // Adjust schedule if loan not fully paid off
  if (newBalance <= 0) {
    // Paid off - delete any remaining pending installments
    await supabase.from("installments").delete().eq("loan_id", loan.id).in("status", ["PENDING", "MISSED"]);
  } else {
    // Reconcile pending installments
    const { data: allRemaining } = await supabase
      .from("installments")
      .select("*")
      .eq("loan_id", loan.id)
      .in("status", ["PENDING", "MISSED"])
      .order("due_date", { ascending: true });

    const missed = allRemaining?.filter(i => i.status === "MISSED") || [];
    const pending = allRemaining?.filter(i => i.status === "PENDING") || [];

    const missedSum = missed.reduce((sum, i) => sum + Number(i.amount), 0);
    let amountToSchedule = Number(newBalance) - missedSum;
    amountToSchedule = Math.round(amountToSchedule * 100) / 100;
    
    const weeklyAmount = Number(loan.weekly_installment);
    if (weeklyAmount <= 0) {
      return { error: "Weekly installment must be greater than zero." };
    }

    const pendingUpdates = [];
    const pendingDeletes = [];
    const pendingInserts = [];

    for (const inst of pending) {
      if (amountToSchedule <= 0) {
        pendingDeletes.push(inst.id);
      } else {
        const instAmount = amountToSchedule >= weeklyAmount ? weeklyAmount : amountToSchedule;
        pendingUpdates.push({ id: inst.id, amount: instAmount });
        amountToSchedule -= instAmount;
        amountToSchedule = Math.round(amountToSchedule * 100) / 100;
      }
    }

    for (const update of pendingUpdates) {
      await supabase.from("installments").update({ amount: update.amount }).eq("id", update.id);
    }

    if (pendingDeletes.length > 0) {
      await supabase.from("installments").delete().in("id", pendingDeletes);
    }

    if (amountToSchedule > 0) {
      let lastDate = new Date(installment.due_date);
      if (pending.length > 0) {
        lastDate = new Date(pending[pending.length - 1].due_date);
      } else {
         const { data: latest } = await supabase
            .from("installments")
            .select("due_date")
            .eq("loan_id", loan.id)
            .order("due_date", { ascending: false })
            .limit(1);
         if (latest && latest.length > 0) {
           lastDate = new Date(latest[0].due_date);
         }
      }

      while (amountToSchedule > 0) {
        lastDate.setDate(lastDate.getDate() + 7);
        const instAmount = amountToSchedule >= weeklyAmount ? weeklyAmount : amountToSchedule;
        pendingInserts.push({
          loan_id: loan.id,
          amount: instAmount,
          due_date: lastDate.toISOString().split("T")[0],
          status: "PENDING"
        });
        amountToSchedule -= instAmount;
        amountToSchedule = Math.round(amountToSchedule * 100) / 100;
      }

      if (pendingInserts.length > 0) {
        await supabase.from("installments").insert(pendingInserts);
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/customers/[id]", "page");
  revalidatePath("/reports");

  return { success: true };
}

export async function addCustomerNote(customerId: string, note: string) {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  
  if (isNaN(newAmount) || newAmount <= 0) {
    return { success: false, error: "Weekly installment amount must be greater than zero." };
  }

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
      note: `Restructured Loan: Adjusted weekly installment amount to ${formatLKR(newAmount)}.`
    });
    revalidatePath(`/customers/${loan.customer_id}`);
  }

  revalidatePath("/");
  revalidatePath("/customers");
  return { success: true };
}

export async function clearAllData() {
  const supabase = await createClient();
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
  } catch (err) {
    const error = err as Error;
    console.error("Error in clearAllData action:", error);
    return { success: false, error: error?.message || "Failed to clear database tables" };
  }
}

import { getSystemVillages, addSystemVillage, removeSystemVillage, getCompanySettings, updateCompanySettings, getVillageSchedule, updateVillageSchedule } from "@/data/db";
import type { VillageSchedule } from "@/lib/schedule";

export async function fetchSystemVillages() {
  const supabase = await createClient();
  return await getSystemVillages();
}

export async function createSystemVillage(villageName: string) {
  const supabase = await createClient();
  const res = await addSystemVillage(villageName);
  revalidatePath("/settings");
  revalidatePath("/new");
  revalidatePath("/villages");
  return res;
}

export async function deleteSystemVillage(villageName: string) {
  const supabase = await createClient();
  const res = await removeSystemVillage(villageName);
  revalidatePath("/settings");
  revalidatePath("/new");
  revalidatePath("/villages");
  revalidatePath("/customers");
  return res;
}

export async function fetchCompanySettings() {
  const supabase = await createClient();
  return await getCompanySettings();
}

export async function saveCompanySettings(name: string, logo: string) {
  const supabase = await createClient();
  const res = await updateCompanySettings(name, logo);
  revalidatePath("/settings");
  revalidatePath("/reports");
  return res;
}

export async function fetchTomorrowsWork() {
  const supabase = await createClient();

  // Calculate tomorrow's date in local YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("installments")
    .select(`
      id,
      amount,
      due_date,
      status,
      loans (
        id,
        weekly_installment,
        remaining_balance,
        customers (
          id,
          name,
          phone,
          address,
          village
        )
      )
    `)
    .eq("due_date", tomorrowStr)
    .in("status", ["PENDING", "MISSED"])
    .order("due_date", { ascending: true });

  if (error) {
    console.error("fetchTomorrowsWork error:", error);
    return { success: false, error: error.message, groups: [] };
  }

  // Group by village (extracted from customer address JSON field "state")
  const villageMap: Record<string, {
    village: string;
    customers: { id: string; name: string; phone: string; amount: number; status: string }[]
  }> = {};

  for (const inst of data || []) {
    const loan = Array.isArray(inst.loans) ? inst.loans[0] : inst.loans;
    const customer = loan ? (Array.isArray(loan.customers) ? loan.customers[0] : loan.customers) : null;
    if (!customer) continue;

    let village = customer.village || "Unknown Village";
    if (!customer.village && customer.address) {
      try {
        const addr = typeof customer.address === "string" ? JSON.parse(customer.address) : customer.address;
        if (addr?.state) village = addr.state;
      } catch { }
    }

    if (!villageMap[village]) {
      villageMap[village] = { village, customers: [] };
    }
    villageMap[village].customers.push({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || "",
      amount: Number(inst.amount),
      status: inst.status,
    });
  }

  const groups = Object.values(villageMap).sort((a, b) =>
    a.village.localeCompare(b.village)
  );

  return { success: true, tomorrowDate: tomorrowStr, groups };
}

export async function fetchVillageSchedule() {
  return await getVillageSchedule();
}

export async function saveVillageSchedule(schedule: VillageSchedule) {
  const res = await updateVillageSchedule(schedule);
  revalidatePath("/villages");
  revalidatePath("/");
  return res;
}
