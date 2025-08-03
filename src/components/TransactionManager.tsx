"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import SummaryCards from "./SummaryCard";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

type TransactionManagerProps = {};

export default function TransactionManager({}: TransactionManagerProps) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle editing a transaction
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowMobileForm(true); // Show form on mobile when editing
  };

  // Handle transaction saved (add or edit)
  const handleTransactionSaved = () => {
    setEditingTransaction(null);
    setShowMobileForm(false); // Hide form on mobile after saving
    handleRefresh();
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setShowMobileForm(false); // Hide form on mobile when canceling
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Handle floating button click
  const handleFloatingButtonClick = () => {
    setEditingTransaction(null); // Clear any editing transaction
    setShowMobileForm(true);
  };

  // Handle mobile form close
  // const handleMobileFormClose = () => {
  //   setShowMobileForm(false);
  //   setEditingTransaction(null);
  // };

  useEffect(() => {
    document.body.classList.toggle("mobile-form-open", showMobileForm);
  }, [showMobileForm]);

  return (
    <div className="relative">
      <SummaryCards key={`summary-${refreshKey}`} />
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:mt-6">
        {/* Transaction List */}
        <div>
          <TransactionList
            key={refreshKey}
            onEdit={handleEdit}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Transaction Form */}
        <div>
          <TransactionForm
            editingTransaction={editingTransaction}
            onTransactionSaved={handleTransactionSaved}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden mt-8 mb-5">
        {/* Transaction List - Always visible on mobile */}
        <TransactionList
          key={refreshKey}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
        />

        {/* Floating Plus Button */}
        {!showMobileForm && (
          <Button
            onClick={handleFloatingButtonClick}
            className="fixed bottom-14 right-6 h-12 w-12 rounded-full shadow-lg z-40 cursor-pointer"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* Mobile Form Overlay */}
        {showMobileForm && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            {/* Form Content */}
            <div className="p-4">
              <TransactionForm
                editingTransaction={editingTransaction}
                onTransactionSaved={handleTransactionSaved}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
