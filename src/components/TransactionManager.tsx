"use client";

import { useState } from "react";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import type { Transaction } from "@/types/transaction";

export default function TransactionManager() {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleTransactionSaved = () => {
    setEditingTransaction(null);
    setRefreshKey((prev) => prev + 1); // Force refresh of transaction list
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <TransactionList key={refreshKey} onEdit={handleEdit} />

      <TransactionForm
        editingTransaction={editingTransaction}
        onTransactionSaved={handleTransactionSaved}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
}
