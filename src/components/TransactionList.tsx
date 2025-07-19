"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types/transaction";
import { getTransactions, deleteTransaction } from "@/lib/actions";

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

interface TransactionGroupProps {
  date: string;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
}

function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      onDelete(transaction.id);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-muted group">
      <div
        className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded"
        onClick={() => onEdit(transaction)}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isIncome ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isIncome ? (
            <Plus className="w-3 h-3 text-green-600" />
          ) : (
            <Minus className="w-3 h-3 text-red-600" />
          )}
        </div>
        <div className="md:flex">
          {transaction.description && (
            <div className="font-medium text-sm">{transaction.description}</div>
          )}
          <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-0.5 md:ml-2">
            {transaction.category}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`font-semibold text-sm ${
            isIncome ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : "-"}₦{transaction.amount.toFixed(2)}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => onEdit(transaction)}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TransactionGroup({
  date,
  transactions,
  onEdit,
  onDelete,
}: TransactionGroupProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="mb-6">
      <div className="flex text-muted-foreground justify-between items-center border-2 border-muted rounded-md px-4 py-2">
        <div className="text-sm font-medium">
          {(() => {
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, "0");
            const month = (d.getMonth() + 1).toString().padStart(2, "0");
            const year = d.getFullYear();
            const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
            return (
              <>
                {`${day}/${month}/${year} `}
                <span
                  className={`font-semibold ${
                    weekday === "Sun"
                      ? "text-red-600"
                      : weekday === "Sat"
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }`}
                >
                  ({weekday})
                </span>
              </>
            );
          })()}
        </div>
        <div className="text-xs font-semibold space-x-3">
          <span className="text-green-600">+₦{totalIncome.toFixed(2)}</span>
          <span className="text-red-600">-₦{totalExpense.toFixed(2)}</span>
        </div>
      </div>
      <div className="space-y-1">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default function TransactionList({ onEdit }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        await fetchTransactions(); // Refresh the list
      } else {
        alert(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      alert("An error occurred while deleting the transaction");
    }
  };

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <p className="text-muted-foreground text-sm mb-6">
          No transactions yet. Add your first transaction!
        </p>
      </div>
    );
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce(
    (groups: { [key: string]: Transaction[] }, transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {}
  );

  // Sort each group from newest to oldest based on when they were added
  Object.keys(groupedTransactions).forEach((date) => {
    groupedTransactions[date].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const totalIncomes = transactions.filter((t) => t.type === "income").length;
  const totalExpenses = transactions.filter((t) => t.type === "expense").length;

  return (
    <div>
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
        this month
      </p>
      <div>
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
  );
}
