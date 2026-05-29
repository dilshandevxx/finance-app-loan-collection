import { supabase } from "@/lib/supabase";

// Database Raw Types (as stored in Postgres)
export type DBCustomer = {
  id: string;
  member_id?: string;
  name: string;
  phone: string;
  avatar_url?: string;
  address?: string;
  created_at: string;
};

export type DBLoan = {
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

export type DBInstallment = {
  id: string;
  loan_id: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: "PENDING" | "PAID" | "MISSED";
  created_at: string;
};

// Frontend CamelCase Types (used in client components)
export type Customer = {
  id: string;
  memberId?: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
  state?: string;
  createdAt: string;
};

export type Loan = {
  id: string;
  customerId: string;
  principalAmount: number;
  totalAmountDue: number;
  remainingBalance: number;
  weeklyInstallment: number;
  startDate: string;
  status: "ACTIVE" | "PAID_OFF" | "DEFAULTED";
  createdAt: string;
};

export type Installment = {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "PENDING" | "PAID" | "MISSED";
  createdAt: string;
};

export type CustomerNote = {
  id: string;
  customerId: string;
  note: string;
  createdAt: string;
};

function parseAddressField(rawAddress: string | undefined | null) {
  let address = "";
  let state = "";
  if (rawAddress) {
    if (rawAddress.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(rawAddress);
        address = parsed.address || "";
        state = parsed.state || "";
      } catch {
        address = rawAddress;
      }
    } else {
      address = rawAddress;
    }
  }
  return { address, state };
}

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) console.error("Error fetching customers:", error);
  
  return (data || []).map(row => {
    const { address, state } = parseAddressField(row.address);
    return {
      id: row.id,
      memberId: row.member_id,
      name: row.name,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      address,
      state,
      createdAt: row.created_at
    };
  });
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error(`Error fetching customer by id ${id}:`, error);
    return null;
  }
  if (!data) return null;
  
  const { address, state } = parseAddressField(data.address);
  return {
    id: data.id,
    memberId: data.member_id,
    name: data.name,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    address,
    state,
    createdAt: data.created_at
  };
}

export async function getLoans(): Promise<Loan[]> {
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

export async function getLoansByCustomerId(customerId: string): Promise<Loan[]> {
  const { data, error } = await supabase.from("loans").select("*").eq("customer_id", customerId).order("created_at", { ascending: false });
  if (error) {
    console.error(`Error fetching loans for customer ${customerId}:`, error);
    return [];
  }
  
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

export async function getInstallments(): Promise<Installment[]> {
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

export async function getInstallmentsByLoanId(loanId: string): Promise<Installment[]> {
  const { data, error } = await supabase.from("installments").select("*").eq("loan_id", loanId).order("due_date", { ascending: true });
  if (error) {
    console.error(`Error fetching installments for loan ${loanId}:`, error);
    return [];
  }
  
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

export async function getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching notes for customer ${customerId}:`, error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    customerId: row.customer_id,
    note: row.note,
    createdAt: row.created_at
  }));
}


