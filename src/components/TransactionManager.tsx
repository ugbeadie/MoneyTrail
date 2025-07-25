"use client";

import { useState } from "react";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import SummaryCards from "./SummaryCard";
import type { Transaction } from "@/types/transaction";

export default function TransactionManager() {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Single refresh function used by both components
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTransactionSaved = () => {
    setEditingTransaction(null); // Clear editing state (close form)
    handleRefresh(); // Use the same refresh function
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards - refreshes when refreshKey changes */}
      <SummaryCards key={`summary-${refreshKey}`} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Both components use the same handleRefresh function */}
        <TransactionList
          key={`list-${refreshKey}`}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
        />
        <TransactionForm
          editingTransaction={editingTransaction}
          onTransactionSaved={handleTransactionSaved}
          onCancelEdit={handleCancelEdit}
        />
      </div>
    </div>
  );
}
