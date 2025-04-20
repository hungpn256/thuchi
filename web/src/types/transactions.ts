export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId?: string;
  category?: Category;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDTO {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {}

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
}
