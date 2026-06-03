import { createClient } from "@/utils/supabase/server";

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
  companyName?: string;
  idNumber?: string;
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
  let companyName = "";
  let idNumber = "";
  if (rawAddress) {
    if (rawAddress.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(rawAddress);
        address = parsed.address || "";
        state = parsed.state || "";
        companyName = parsed.companyName || "";
        idNumber = parsed.idNumber || "";
      } catch {
        address = rawAddress;
      }
    } else {
      address = rawAddress;
    }
  }
  return { address, state, companyName, idNumber };
}

function mapRowToCustomer(row: any): Customer {
  let streetAddress = row.street_address || "";
  let village = row.village || "";
  let companyName = row.company_name || "";
  let nicNumber = row.nic_number || "";

  if (!streetAddress && !village && !companyName && !nicNumber && row.address && row.address.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(row.address);
      streetAddress = parsed.address || "";
      village = parsed.state || "";
      companyName = parsed.companyName || "";
      nicNumber = parsed.idNumber || "";
    } catch {
      streetAddress = row.address;
    }
  } else if (!streetAddress && row.address && !row.address.trim().startsWith("{")) {
    streetAddress = row.address;
  }

  return {
    id: row.id,
    memberId: row.member_id,
    name: row.name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    address: streetAddress,
    state: village,
    companyName: companyName,
    idNumber: nicNumber,
    createdAt: row.created_at
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) console.error("Error fetching customers:", error);

  return (data || []).map(mapRowToCustomer);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error(`Error fetching customer by id ${id}:`, error);
    return null;
  }
  if (!data) return null;

  return mapRowToCustomer(data);
}

export async function getLoans(): Promise<Loan[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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

export async function getPendingInstallments(): Promise<Installment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("installments")
    .select("*")
    .in("status", ["PENDING", "MISSED"])
    .order("due_date", { ascending: true });
  if (error) console.error("Error fetching pending installments:", error);

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

export async function getDashboardInstallments(): Promise<Installment[]> {
  const supabase = await createClient();

  // We need all PENDING and MISSED, plus any PAID today.
  // Supabase OR query: status=in.(PENDING,MISSED) or (status=eq.PAID and paid_date=gte.TODAY)
  // To keep it simple and safe across timezones, we fetch all PENDING/MISSED, 
  // and fetch PAID installments separately for today, then combine them, OR we do an OR query.

  const todayStr = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.from("installments")
    .select("*")
    .or(`status.in.(PENDING,MISSED),and(status.eq.PAID,paid_date.gte.${todayStr})`)
    .order("due_date", { ascending: true });

  if (error) console.error("Error fetching dashboard installments:", error);

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

export async function getActiveLoans(): Promise<Loan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("loans")
    .select("*")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });
  if (error) console.error("Error fetching active loans:", error);

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

export async function getInstallmentsByLoanId(loanId: string): Promise<Installment[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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

export async function getSystemVillages(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "villages")
    .maybeSingle();

  let settingsVillages: string[] = [];
  if (data?.value) {
    try {
      settingsVillages = JSON.parse(data.value);
    } catch (e) {
      console.error("Error parsing system_settings villages:", e);
    }
  }

  const { data: customerData, error: custError } = await supabase.from("customers").select("address, village");
  const customerVillages: string[] = [];
  if (!custError && customerData) {
    customerData.forEach(row => {
      if (row.village) {
        customerVillages.push(row.village);
      } else if (row.address && row.address.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(row.address);
          if (parsed.state) {
            customerVillages.push(parsed.state);
          }
        } catch { }
      }
    });
  }

  const allVillages = Array.from(new Set([...settingsVillages, ...customerVillages]))
    .map(v => v.trim())
    .filter(Boolean)
    .sort();

  return allVillages;
}

export async function addSystemVillage(villageName: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const trimmedName = villageName.trim();
  if (!trimmedName) return { success: false, error: "Area name cannot be empty." };

  const currentVillages = await getSystemVillages();
  const lowercased = currentVillages.map(v => v.toLowerCase());

  if (lowercased.includes(trimmedName.toLowerCase())) {
    return { success: false, error: "Village already exists." };
  }

  const updatedVillages = [...currentVillages, trimmedName].sort();
  const { error } = await supabase
    .from("system_settings")
    .upsert({
      key: "villages",
      value: JSON.stringify(updatedVillages),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Error adding system village:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function removeSystemVillage(villageName: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const trimmedName = villageName.trim();
  if (!trimmedName) return { success: false, error: "Area name cannot be empty." };

  // Check if any customer is using this village
  const { data: customerData, error: custError } = await supabase.from("customers").select("address, village");
  if (!custError && customerData) {
    const isUsed = customerData.some(row => {
      if (row.village && row.village.trim().toLowerCase() === trimmedName.toLowerCase()) {
        return true;
      }
      if (row.address && row.address.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(row.address);
          if (parsed.state && parsed.state.trim().toLowerCase() === trimmedName.toLowerCase()) {
            return true;
          }
        } catch { }
      }
      return false;
    });
    if (isUsed) {
      return { success: false, error: "Cannot delete village because it is assigned to one or more clients." };
    }
  }

  // Get current villages from system_settings
  const { data, error: selectError } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "villages")
    .maybeSingle();

  if (selectError) {
    return { success: false, error: selectError.message };
  }

  let settingsVillages: string[] = [];
  if (data?.value) {
    try {
      settingsVillages = JSON.parse(data.value);
    } catch { }
  }

  const updatedVillages = settingsVillages.filter(v => v.trim().toLowerCase() !== trimmedName.toLowerCase());

  const { error: upsertError } = await supabase
    .from("system_settings")
    .upsert({
      key: "villages",
      value: JSON.stringify(updatedVillages),
      updated_at: new Date().toISOString()
    });

  if (upsertError) {
    return { success: false, error: upsertError.message };
  }

  return { success: true };
}

export async function getCompanySettings(): Promise<{ name: string; logo: string }> {
  const supabase = await createClient();
  const { data: nameData } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "company_name")
    .maybeSingle();

  const { data: logoData } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "company_logo")
    .maybeSingle();

  return {
    name: nameData?.value || "",
    logo: logoData?.value || ""
  };
}

export async function updateCompanySettings(name: string, logo: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error: nameError } = await supabase
    .from("system_settings")
    .upsert({
      key: "company_name",
      value: name.trim(),
      updated_at: new Date().toISOString()
    });

  if (nameError) {
    return { success: false, error: nameError.message };
  }

  const { error: logoError } = await supabase
    .from("system_settings")
    .upsert({
      key: "company_logo",
      value: logo,
      updated_at: new Date().toISOString()
    });

  if (logoError) {
    return { success: false, error: logoError.message };
  }

  return { success: true };
}

import { VillageSchedule, defaultVillageSchedule } from "@/lib/schedule";

export async function getVillageSchedule(): Promise<VillageSchedule> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "village_schedule")
    .maybeSingle();

  if (data?.value) {
    try {
      const schedule = JSON.parse(data.value);
      return { ...defaultVillageSchedule, ...schedule };
    } catch (e) {
      console.error("Error parsing village_schedule:", e);
    }
  }
  return defaultVillageSchedule;
}

export async function updateVillageSchedule(schedule: VillageSchedule): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("system_settings")
    .upsert({
      key: "village_schedule",
      value: JSON.stringify(schedule),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Error saving village schedule:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
