import { supabase } from "@/lib/supabase";

export type Customer = {
  id: string;
  member_id?: string;
  name: string;
  phone: string;
  avatar_url?: string;
  address?: string;
  created_at: string;
};

export type Loan = {
  id: string;
  customer_id: string;
  principal_amount: number;
  total_amount_due: number;
  remaining_balance: number;
  weekly_installment: number;
  start_date: string;
  status: "ACTIVE" | "PAID_OFF" | "DEFAULTED";
  created_at: string;
};

export type Installment = {
  id: string;
  loan_id: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: "PENDING" | "PAID" | "MISSED";
  created_at: string;
};

export async function getCustomers() {
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) console.error("Error fetching customers:", error);
  
  return (data || []).map(row => ({
    id: row.id,
    memberId: row.member_id,
    name: row.name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    address: row.address,
    createdAt: row.created_at
  }));
}

export async function getLoans() {
  const { data, error } = await supabase.from("loans").select("*").order("created_at", { ascending: false });
  if (error) console.error("Error fetching loans:", error);
  
  return (data || []).map(row => ({
    id: row.id,
    customerId: row.customer_id,
    principalAmount: Number(row.principal_amount),
    totalAmountDue: Number(row.total_amount_due),
    remainingBalance: Number(row.remaining_balance),
    weeklyInstallment: Number(row.weekly_installment),
    startDate: row.start_date,
    status: row.status,
    createdAt: row.created_at
  }));
}

export async function getInstallments() {
  const { data, error } = await supabase.from("installments").select("*").order("due_date", { ascending: true });
  if (error) console.error("Error fetching installments:", error);
  
  return (data || []).map(row => ({
    id: row.id,
    loanId: row.loan_id,
    amount: Number(row.amount),
    dueDate: row.due_date,
    paidDate: row.paid_date,
    status: row.status,
    createdAt: row.created_at
  }));
}
