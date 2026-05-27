export type Customer = {
  id: string;
  memberId?: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  address?: string;
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
};

export type Installment = {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "PENDING" | "PAID" | "MISSED";
};

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    memberId: "M-1001",
    name: "Nataly Smith",
    phone: "555-0101",
    avatarUrl: "https://i.pravatar.cc/150?u=c1",
    address: "241 Skyline Drive, Staten Island, NY"
  },
  {
    id: "c2",
    memberId: "M-1002",
    name: "John Doe",
    phone: "555-0102",
    avatarUrl: "https://i.pravatar.cc/150?u=c2"
  },
  {
    id: "c3",
    memberId: "M-1003",
    name: "Starbucks Owner",
    phone: "555-0103",
    avatarUrl: "https://i.pravatar.cc/150?u=c3"
  }
];

export const MOCK_LOANS: Loan[] = [
  {
    id: "L1",
    customerId: "c1",
    principalAmount: 5000,
    totalAmountDue: 5500,
    remainingBalance: 4923.82,
    weeklyInstallment: 250,
    startDate: "2024-07-01",
    status: "ACTIVE"
  },
  {
    id: "L2",
    customerId: "c2",
    principalAmount: 1000,
    totalAmountDue: 1100,
    remainingBalance: 500,
    weeklyInstallment: 100,
    startDate: "2024-06-15",
    status: "ACTIVE"
  }
];

export const MOCK_INSTALLMENTS: Installment[] = [
  {
    id: "I1",
    loanId: "L1",
    amount: 250,
    dueDate: "2024-07-27",
    status: "PENDING"
  },
  {
    id: "I2",
    loanId: "L1",
    amount: 250,
    dueDate: "2024-07-20",
    paidDate: "2024-07-19",
    status: "PAID"
  },
  {
    id: "I3",
    loanId: "L2",
    amount: 100,
    dueDate: "2024-07-27",
    status: "PENDING"
  }
];
