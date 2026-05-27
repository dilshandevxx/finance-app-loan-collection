"use server";

import { MOCK_CUSTOMERS, MOCK_LOANS, MOCK_INSTALLMENTS } from "@/data/mock";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createLoan(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const principalStr = formData.get("principal") as string;
  const interestStr = formData.get("interest") as string;
  const weeksStr = formData.get("weeks") as string;

  const principalAmount = parseFloat(principalStr);
  const interest = parseFloat(interestStr);
  const weeks = parseInt(weeksStr);

  if (!name || !phone || isNaN(principalAmount) || isNaN(interest) || isNaN(weeks) || weeks <= 0) {
    throw new Error("Invalid input");
  }

  const customerId = `c${MOCK_CUSTOMERS.length + 1}`;
  MOCK_CUSTOMERS.push({
    id: customerId,
    name,
    phone,
    avatarUrl: `https://i.pravatar.cc/150?u=${customerId}`
  });

  const loanId = `L${MOCK_LOANS.length + 1}`;
  const totalAmountDue = principalAmount * (1 + interest / 100);
  const weeklyInstallment = totalAmountDue / weeks;
  const startDate = new Date().toISOString().split('T')[0];

  MOCK_LOANS.push({
    id: loanId,
    customerId,
    principalAmount,
    totalAmountDue,
    remainingBalance: totalAmountDue,
    weeklyInstallment,
    startDate,
    status: "ACTIVE"
  });

  let currentDate = new Date();
  for (let i = 0; i < weeks; i++) {
    currentDate.setDate(currentDate.getDate() + 7);
    MOCK_INSTALLMENTS.push({
      id: `I${MOCK_INSTALLMENTS.length + 1}`,
      loanId,
      amount: weeklyInstallment,
      dueDate: currentDate.toISOString().split('T')[0],
      status: "PENDING"
    });
  }

  revalidatePath("/");
  redirect("/");
}
