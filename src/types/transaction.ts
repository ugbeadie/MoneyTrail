export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  imageUrl: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export type TransactionType = "income" | "expense";

export interface AddTransactionResult {
  success: boolean;
  error?: string;
}

// export function isValidTransactionType(type: string): type is TransactionType {
//   return type === "income" || type === "expense";
// }
