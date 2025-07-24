"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Transaction } from "@/types/transaction";
import { getTransactions, deleteTransaction } from "@/lib/actions";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isIncome = transaction.type === "income";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(transaction.id);
    setShowDeleteModal(false);
  };

  const handleItemClick = () => {
    onEdit(transaction);
  };

  return (
    <>
      <div
        className="flex items-center py-3 group cursor-pointer -mx-2 px-2 rounded transition-colors duration-200"
        onClick={handleItemClick}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
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
          <div className="md:flex min-w-0 flex-1">
            {transaction.description && (
              <div className="font-medium text-sm truncate">
                {transaction.description}
              </div>
            )}
            <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-0.5 md:ml-2">
              {transaction.category}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 md:-mr-3">
          <div
            className={`font-semibold text-sm transition-transform duration-200 ${
              isIncome ? "text-green-600" : "text-red-600"
            } group-hover:-translate-x-2`}
          >
            {isIncome ? "+" : "-"}₦{transaction.amount.toFixed(2)}
          </div>
          <div className="md:opacity-0 md:group-hover:opacity-100 md:mr-2 transition-opacity duration-200">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 relative z-10 cursor-pointer"
              onClick={handleDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
              <div className="mt-3 p-3 bg-muted rounded-md text-center">
                <div className="flex justify-center items-center gap-2 text-sm">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isIncome ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {isIncome ? (
                      <Plus className="w-2 h-2 text-green-600" />
                    ) : (
                      <Minus className="w-2 h-2 text-red-600" />
                    )}
                  </div>
                  <span className="font-medium">
                    ₦{transaction.amount.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    • {transaction.category}
                  </span>
                </div>
                {transaction.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {transaction.description}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
      <div className="flex items-center border-2 border-muted rounded-md px-4 py-2">
        <div className="text-sm font-medium text-muted-foreground flex-1">
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
        <div className="flex justify-end">
          <div className="text-xs font-semibold space-x-3">
            <span className="text-green-600">+₦{totalIncome.toFixed(2)}</span>
            <span className="text-red-600">-₦{totalExpense.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="[&:not(:last-child)]:border-b [&:not(:last-child)]:border-muted"
          >
            <TransactionItem
              transaction={transaction}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
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
        toast.error("Transaction deleted!", {
          duration: 3000,
          icon: <Trash2 className="text-red-600" size={18} />,
          description: "The transaction has been removed successfully.",
        });
        await fetchTransactions();
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
            No transactions yet. Add your first transaction!
          </p>
        </div>
      </div>
    );
  }

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
          this month
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
