export type DebtStatus = 'pending' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  userId: string;
  debtorName: string;
  creditorName: string;
  amount: number;
  currency: string;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  status: DebtStatus;
  category?: string;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateDebtPayload {
  debtorName: string;
  creditorName: string;
  amount: number;
  currency: string;
  dueDate: string;
  status?: DebtStatus; // Optional, defaults to 'pending'
  category?: string;
  description?: string;
}