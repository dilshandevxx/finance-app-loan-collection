"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { formatLKR, normalizePhone } from "@/lib/format";
import { getCompanySettings as getCompanySettingsDB, getVillageSchedule, updateVillageSchedule } from "@/data/db";
import { VillageSchedule } from "@/lib/schedule";

export async function getCompanySettingsAction() {
  return await getCompanySettingsDB();
}

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
  const isOngoingLoan = formData.get("isOngoingLoan") === "true";
  const amountAlreadyPaidStr = formData.get("amountAlreadyPaid") as string;
  const originalStartDate = formData.get("originalStartDate") as string;

  let amountAlreadyPaid = 0;
  if (isOngoingLoan && amountAlreadyPaidStr) {
    amountAlreadyPaid = parseFloat(amountAlreadyPaidStr) || 0;
  }

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
  
  if (amountAlreadyPaid < 0 || amountAlreadyPaid > totalAmountDue) {
    return { error: "Invalid amount already paid. Must be between 0 and total due." };
  }

  // Calculate starting balance for the ledger
  const startingBalance = Math.max(0, totalAmountDue - amountAlreadyPaid);

  // For custom installment, weekly installment is exactly the preferred installment,
  // otherwise it is totalAmountDue / weeks.
  const weeklyInstallment = (isCustom && !isNaN(preferredInstallment) && preferredInstallment > 0)
    ? preferredInstallment
    : totalAmountDue / weeks;

  const startDate = (isOngoingLoan && originalStartDate) ? originalStartDate : new Date().toISOString().split('T')[0];

  const { data: newLoan, error: loanError } = await supabase
    .from("loans")
    .insert({
      customer_id: customerId,
      principal_amount: principalAmount,
      total_amount_due: totalAmountDue,
      remaining_balance: startingBalance,
      weekly_installment: weeklyInstallment,
      start_date: startDate,
      status: startingBalance <= 0 ? "PAID_OFF" : "ACTIVE"
    })
    .select()
    .single();

  if (loanError) {
    console.error("Loan insert error:", loanError);
    return { error: `Failed to create loan: ${loanError.message}` };
  }

  const installments = [];
  const currentDate = new Date(startDate);
  
  let unallocatedPaid = amountAlreadyPaid;
  let totalGenerated = 0;

  for (let i = 0; i < weeks; i++) {
    currentDate.setDate(currentDate.getDate() + 7);
    
    let amount = weeklyInstallment;
    
    // For custom installments on the very last calculated week
    if (isCustom && !isNaN(preferredInstallment) && preferredInstallment > 0 && i === weeks - 1) {
      amount = totalAmountDue - (weeklyInstallment * (weeks - 1));
    }
    amount = Math.round(amount * 100) / 100;
    
    // If the amount is trivially small or less than 0, skip (safety check)
    if (amount <= 0) continue;

    const dueDateStr = currentDate.toISOString().split('T')[0];

    // Distribute unallocated paid amount chronologically
    if (unallocatedPaid >= amount - 0.01) {
      // Fully paid installment
      installments.push({
        loan_id: newLoan.id,
        amount: amount,
        due_date: dueDateStr,
        status: "PAID",
        paid_date: dueDateStr // Record it as paid on its due date historically
      });
      unallocatedPaid -= amount;
      totalGenerated += amount;
    } else if (unallocatedPaid > 0) {
      // Partially paid installment
      // Split into two: one PAID, one PENDING (or MISSED if date is in past, but DB defaults to PENDING)
      const paidPortion = Math.round(unallocatedPaid * 100) / 100;
      const pendingPortion = Math.round((amount - paidPortion) * 100) / 100;

      installments.push({
        loan_id: newLoan.id,
        amount: paidPortion,
        due_date: dueDateStr,
        status: "PAID",
        paid_date: dueDateStr
      });

      installments.push({
        loan_id: newLoan.id,
        amount: pendingPortion,
        due_date: dueDateStr,
        status: "PENDING"
      });
      
      totalGenerated += amount;
      unallocatedPaid = 0;
    } else {
      // Completely unpaid future/missed installment
      installments.push({
        loan_id: newLoan.id,
        amount: amount,
        due_date: dueDateStr,
        status: "PENDING"
      });
      totalGenerated += amount;
    }
  }

  // If there's any weird leftover due to floating point math, add a tiny extra padding (rare)
  if (totalAmountDue - totalGenerated > 0.01) {
     installments.push({
        loan_id: newLoan.id,
        amount: Math.round((totalAmountDue - totalGenerated) * 100) / 100,
        due_date: currentDate.toISOString().split('T')[0],
        status: unallocatedPaid > 0 ? "PAID" : "PENDING",
        paid_date: unallocatedPaid > 0 ? currentDate.toISOString().split('T')[0] : null
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

    // 5. Fetch Company Settings
    const { data: nameData } = await supabase.from("system_settings").select("value").eq("key", "company_name").maybeSingle();
    const { data: phoneData } = await supabase.from("system_settings").select("value").eq("key", "company_phone").maybeSingle();

    return {
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
        previousBalance: currentRemainingBalance + Number(installment.amount),
        weeklyInstallment: Number(loan.weekly_installment),
        totalPaid,
      },
      customer: {
        name: customer.name,
        phone: customer.phone,
        memberId: customer.member_id,
        idNumber: customer.nic_number,
        address: customer.address,
      },
      companyName: nameData?.value || undefined,
      agentPhone: phoneData?.value || undefined,
    };
  } catch (error) {
    console.error("Error in getReceiptDetails:", error);
    return null;
  }
}

export async function fetchTomorrowsWork() {
  const supabase = await createClient();
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

export async function editInstallment(installmentId: string, status: string, amount: number, dueDate?: string) {
  const supabase = await createClient();

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Amount must be greater than zero." };
  }

  // 1. Update the installment
  const paidDate = status === "PAID" ? new Date().toISOString() : null;
  const updateData: any = { status, amount, paid_date: paidDate };
  if (dueDate) {
    updateData.due_date = dueDate;
  }

  const { error: updateError } = await supabase
    .from("installments")
    .update(updateData)
    .eq("id", installmentId);

  if (updateError) {
    return { success: false, error: "Failed to update installment: " + updateError.message };
  }

  // 2. Fetch all installments for the loan to recalculate the remaining balance
  const { data: inst } = await supabase
    .from("installments")
    .select("loan_id")
    .eq("id", installmentId)
    .single();

  if (!inst) return { success: false, error: "Installment not found" };

  const { data: allInsts } = await supabase
    .from("installments")
    .select("status, amount")
    .eq("loan_id", inst.loan_id);

  if (allInsts) {
    let totalPaid = 0;
    for (const i of allInsts) {
      if (i.status === "PAID") {
        totalPaid += Number(i.amount);
      }
    }

    const { data: loan } = await supabase
      .from("loans")
      .select("total_amount_due, customer_id, weekly_installment")
      .eq("id", inst.loan_id)
      .single();

    if (loan) {
      const newRemaining = Math.max(0, loan.total_amount_due - totalPaid);
      const newLoanStatus = newRemaining <= 0 ? "PAID_OFF" : "ACTIVE";

      await supabase
        .from("loans")
        .update({ remaining_balance: newRemaining, status: newLoanStatus })
        .eq("id", inst.loan_id);

      // Recalculate pending/missed installments
      const { data: pendingInsts } = await supabase
        .from("installments")
        .select("*")
        .eq("loan_id", inst.loan_id)
        .in("status", ["PENDING", "MISSED"])
        .order("due_date", { ascending: true });

      if (newRemaining <= 0) {
        if (pendingInsts && pendingInsts.length > 0) {
          for (const p of pendingInsts) {
            await supabase.from("installments").delete().eq("id", p.id);
          }
        }
      } else {
        let distributed = 0;
        const weeklyAmount = Number(loan.weekly_installment);
        
        if (pendingInsts && pendingInsts.length > 0) {
          for (let i = 0; i < pendingInsts.length; i++) {
            const leftToDistribute = newRemaining - distributed;
            const targetAmount = Math.min(weeklyAmount, leftToDistribute);

            if (targetAmount <= 0) {
              await supabase.from("installments").delete().eq("id", pendingInsts[i].id);
            } else {
              await supabase
                .from("installments")
                .update({ amount: Math.round(targetAmount * 100) / 100 })
                .eq("id", pendingInsts[i].id);
              distributed += targetAmount;
            }
          }
        }

        if (distributed < newRemaining - 0.01) {
          let lastDate = new Date();
          
          if (pendingInsts && pendingInsts.length > 0) {
            lastDate = new Date(pendingInsts[pendingInsts.length - 1].due_date);
          } else {
            const { data: allOrderedInsts } = await supabase
              .from("installments")
              .select("due_date")
              .eq("loan_id", inst.loan_id)
              .order("due_date", { ascending: true });
              
            if (allOrderedInsts && allOrderedInsts.length > 0) {
              lastDate = new Date(allOrderedInsts[allOrderedInsts.length - 1].due_date);
            }
          }

          while (distributed < newRemaining - 0.01) {
            lastDate.setDate(lastDate.getDate() + 7);
            const leftToDistribute = newRemaining - distributed;
            const targetAmount = Math.min(weeklyAmount, leftToDistribute);

            await supabase.from("installments").insert({
              loan_id: inst.loan_id,
              amount: Math.round(targetAmount * 100) / 100,
              due_date: lastDate.toISOString().split("T")[0],
              status: "PENDING",
            });
            distributed += targetAmount;
          }
        }
      }

      revalidatePath(`/customers/${loan.customer_id}`);
    }
  }

  return { success: true };
}

export async function markInstallmentPaid(installmentId: string, amount: number) {
  return await editInstallment(installmentId, "PAID", amount);
}

export async function addCustomerNote(customerId: string, note: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_notes")
    .insert({
      customer_id: customerId,
      note: note,
    });

  if (error) {
    console.error("Error adding customer note:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function postponeInstallments(loanId: string, weeks: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Fetch all pending/missed installments for this loan
  const { data: pendingInsts, error: fetchError } = await supabase
    .from("installments")
    .select("*")
    .eq("loan_id", loanId)
    .in("status", ["PENDING", "MISSED"])
    .order("due_date", { ascending: true });

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!pendingInsts || pendingInsts.length === 0) {
    return { success: false, error: "No pending installments to postpone." };
  }

  // Shift each installment's due_date forward by `weeks` weeks
  for (const inst of pendingInsts) {
    const currentDue = new Date(inst.due_date);
    currentDue.setDate(currentDue.getDate() + weeks * 7);
    const newDueDate = currentDue.toISOString().split("T")[0];

    const { error: updateError } = await supabase
      .from("installments")
      .update({ due_date: newDueDate, status: "PENDING" })
      .eq("id", inst.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  }

  // Log the action as a customer note
  const { data: loan } = await supabase
    .from("loans")
    .select("customer_id")
    .eq("id", loanId)
    .single();

  if (loan) {
    await supabase.from("customer_notes").insert({
      customer_id: loan.customer_id,
      note: `Payment Holiday applied: ${weeks} week(s) pause on all pending installments.`,
    });
    revalidatePath(`/customers/${loan.customer_id}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function restructureWeeklyInstallment(loanId: string, newAmount: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  if (isNaN(newAmount) || newAmount <= 0) {
    return { success: false, error: "New installment amount must be greater than zero." };
  }

  // Fetch the loan
  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .single();

  if (loanError || !loan) {
    return { success: false, error: "Loan not found." };
  }

  // Update the loan's weekly_installment
  const { error: updateLoanError } = await supabase
    .from("loans")
    .update({ weekly_installment: newAmount })
    .eq("id", loanId);

  if (updateLoanError) {
    return { success: false, error: updateLoanError.message };
  }

  // Fetch all pending installments and update their amounts
  const { data: pendingInsts, error: fetchError } = await supabase
    .from("installments")
    .select("*")
    .eq("loan_id", loanId)
    .in("status", ["PENDING", "MISSED"])
    .order("due_date", { ascending: true });

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (pendingInsts && pendingInsts.length > 0) {
    // Distribute remaining balance across installments with new amount
    const remainingBalance = Number(loan.remaining_balance);
    let distributed = 0;

    for (let i = 0; i < pendingInsts.length; i++) {
      const left = remainingBalance - distributed;
      const amount = Math.min(newAmount, left);

      if (amount <= 0) {
        // Delete excess installments
        await supabase.from("installments").delete().eq("id", pendingInsts[i].id);
      } else {
        await supabase
          .from("installments")
          .update({ amount: Math.round(amount * 100) / 100 })
          .eq("id", pendingInsts[i].id);
        distributed += amount;
      }
    }

    // If remaining balance not fully covered, add new installments
    if (distributed < remainingBalance) {
      const lastInst = pendingInsts[pendingInsts.length - 1];
      let lastDate = new Date(lastInst.due_date);

      while (distributed < remainingBalance) {
        lastDate.setDate(lastDate.getDate() + 7);
        const left = remainingBalance - distributed;
        const amount = Math.min(newAmount, left);

        await supabase.from("installments").insert({
          loan_id: loanId,
          amount: Math.round(amount * 100) / 100,
          due_date: lastDate.toISOString().split("T")[0],
          status: "PENDING",
        });
        distributed += amount;
      }
    }
  }

  // Log the action as a customer note
  await supabase.from("customer_notes").insert({
    customer_id: loan.customer_id,
    note: `Restructured Loan: Weekly installment changed to Rs. ${newAmount.toLocaleString()}.`,
  });

  revalidatePath(`/customers/${loan.customer_id}`);
  revalidatePath("/");
  return { success: true };
}

export async function clearAllData() {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function fetchSystemVillages() {
  const supabase = await createClient();
  const { data } = await supabase.from("system_settings").select("value").eq("key", "system_villages").maybeSingle();
  if (data?.value) {
    try {
      return JSON.parse(data.value) as string[];
    } catch {
      return [];
    }
  }
  return [];
}

export async function createSystemVillage(villageName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const villages = await fetchSystemVillages();
    if (!villages.includes(villageName)) {
      villages.push(villageName);
      const supabase = await createClient();
      const { error } = await supabase.from("system_settings").upsert({
        key: "system_villages",
        value: JSON.stringify(villages),
        updated_at: new Date().toISOString()
      });
      if (error) return { success: false, error: error.message };
      revalidatePath("/villages");
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error occurred" };
  }
}

export async function deleteSystemVillage(villageName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const villages = await fetchSystemVillages();
    if (villages.includes(villageName)) {
      const updatedVillages = villages.filter(v => v !== villageName);
      const supabase = await createClient();
      const { error } = await supabase.from("system_settings").upsert({
        key: "system_villages",
        value: JSON.stringify(updatedVillages),
        updated_at: new Date().toISOString()
      });
      if (error) return { success: false, error: error.message };
      revalidatePath("/villages");
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error occurred" };
  }
}

export async function fetchCompanySettings() {
  const { getCompanySettings } = await import("@/data/db");
  return await getCompanySettings();
}

export async function saveCompanySettings(name: string, logo: string, phone: string = "") {
  const { updateCompanySettings, getCompanySettings } = await import("@/data/db");
  const currentSettings = await getCompanySettings();
  const finalPhone = phone || currentSettings.phone || "";
  const res = await updateCompanySettings(name, logo, finalPhone);
  revalidatePath("/settings");
  revalidatePath("/");
  return res;
}

export async function editCustomer(customerId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const phoneRaw = formData.get("phone") as string;
  const phone = normalizePhone(phoneRaw);
  const memberId = formData.get("memberId") as string;
  const stateVal = formData.get("state") as string || "";
  const addressVal = formData.get("address") as string || "";
  const companyNameVal = formData.get("companyName") as string || "";
  const idNumberVal = formData.get("idNumber") as string || "";

  if (!name || !phone) {
    return { error: "Name and phone number are required." };
  }

  let serializedAddress = null;
  if (stateVal.trim() || addressVal.trim() || companyNameVal.trim() || idNumberVal.trim()) {
    serializedAddress = JSON.stringify({
      state: stateVal.trim(),
      address: addressVal.trim(),
      companyName: companyNameVal.trim(),
      idNumber: idNumberVal.trim()
    });
  }

  const { error: customerError } = await supabase
    .from("customers")
    .update({
      name: name.trim(),
      phone: phone,
      member_id: memberId?.trim() || null,
      address: serializedAddress,
      company_name: companyNameVal.trim() || null,
      nic_number: idNumberVal.trim() || null,
      street_address: addressVal.trim() || null,
      village: stateVal.trim() || null
    })
    .eq("id", customerId);

  if (customerError) {
    console.error("Customer update error:", customerError);
    return { error: `Failed to update customer: ${customerError.message}` };
  }

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
  revalidatePath("/");
  
  return { success: true };
}
