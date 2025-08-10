"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { getTransactionsByMonth, deleteTransaction } from "@/lib/actions";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { useMonth } from "@/contexts/MonthContext";
import { TransactionGroup } from "./TransactionGroup"; // Import the extracted component

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
  onRefresh: () => void;
}

export function TransactionList({ onEdit, onRefresh }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedMonthIndex, selectedMonth } = useMonth();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const data = await getTransactionsByMonth(
        selectedMonthIndex,
        currentYear
      );
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonthIndex]); // Re-fetch when month changes

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        toast.error("Transaction deleted!", {
          duration: 3000,
          icon: <Trash2 className="text-red-600" size={18} />,
          description: "The transaction has been removed successfully.",
        });
        onRefresh(); // Refresh parent component (CalendarPage)
      } else {
        toast.error(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the transaction");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 h-[600px]">
        <Spinner />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="h-[600px] flex flex-col">
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm text-center">
            No transactions for {selectedMonth}. Add your first transaction!
          </p>
        </div>
      </div>
    );
  }

  // Group and sort transactions
  const groupedTransactions = transactions.reduce(
    (groups: Record<string, Transaction[]>, transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {}
  );

  Object.keys(groupedTransactions).forEach((date) => {
    groupedTransactions[date].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const totalIncomes = transactions.filter((t) => t.type === "income").length;
  const totalExpenses = transactions.filter((t) => t.type === "expense").length;

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <p className="text-muted-foreground text-sm mb-6">
          You have{" "}
          <span className="font-semibold">
            {totalIncomes} {totalIncomes > 1 ? "incomes" : "income"}
          </span>{" "}
          and{" "}
          <span className="font-semibold">
            {totalExpenses} {totalExpenses > 1 ? "expenses" : "expense"}
          </span>{" "}
          in {selectedMonth}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-0">
          {sortedDates.map((date) => (
            <TransactionGroup
              key={date}
              date={date}
              transactions={groupedTransactions[date]}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
