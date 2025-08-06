"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, ArrowLeft } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { SummaryCards } from "@/components/SummaryCard";
import TransactionForm from "@/components/TransactionForm";
import TransactionCalendar from "@/components/TransactionCalendar";
import type { DayData } from "@/components/TransactionCalendar";
import { MonthProvider } from "@/contexts/MonthContext";

export default function CalendarPage() {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCalendarPanel, setShowCalendarPanel] = useState(false);
  const [selectedDateForPanel, setSelectedDateForPanel] = useState<
    string | null
  >(null);
  const [selectedDayDataForPanel, setSelectedDayDataForPanel] =
    useState<DayData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    setShowCalendarPanel(false);
  };

  const handleTransactionSaved = () => {
    setEditingTransaction(null);
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
    setShowCalendarPanel(false);
    setSelectedDateForPanel(null);
    setSelectedDayDataForPanel(null);
  };

  const handleCancelForm = () => {
    setEditingTransaction(null);
    setShowForm(false);
  };

  const handleFloatingButtonClick = () => {
    setEditingTransaction(null);
    setShowForm(true);
    setShowCalendarPanel(false);
  };

  const openDayDetailsPanel = (dateStr: string, dayData: any) => {
    setSelectedDateForPanel(dateStr);
    setSelectedDayDataForPanel(dayData);
    setShowCalendarPanel(true);
  };

  const handleCloseCalendarPanel = () => {
    setShowCalendarPanel(false);
    setSelectedDateForPanel(null);
    setSelectedDayDataForPanel(null);
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    document.body.style.overflow =
      (showForm || showCalendarPanel) && isMobile ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showForm, showCalendarPanel]);

  return (
    <MonthProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <hr className="border-muted" />
        <h1 className="font-bold text-2xl">Summary</h1>
        <SummaryCards key={`summary-${refreshKey}`} />

        {/* Desktop Layout */}
        <div className="hidden md:flex gap-4 mt-6 h-[calc(100vh-200px)]">
          <div
            className={`transition-all duration-300 ${
              showCalendarPanel ? "w-2/3" : "w-full"
            }`}
          >
            <TransactionCalendar
              key={`calendar-${refreshKey}`}
              onDaySelected={openDayDetailsPanel}
              onAddTransaction={handleFloatingButtonClick}
              onEditTransaction={handleEditTransaction}
            />
          </div>

          {showCalendarPanel && (
            <div className="w-1/3 transition-all duration-300">
              <div className="h-full flex flex-col border rounded-lg bg-card text-card-foreground shadow-sm">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-semibold text-lg">
                    {selectedDateForPanel &&
                      new Date(
                        selectedDateForPanel + "T12:00:00"
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseCalendarPanel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedDayDataForPanel ? (
                    <>
                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-2 text-sm text-center">
                        <div>
                          <div className=" font-medium">Income</div>
                          <div className="text-green-600">
                            ₦{selectedDayDataForPanel.income.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Expense</div>
                          <div className="text-red-600">
                            ₦{selectedDayDataForPanel.expense.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Balance</div>
                          <div
                            className={
                              selectedDayDataForPanel.balance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            ₦
                            {Math.abs(selectedDayDataForPanel.balance).toFixed(
                              2
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Transactions */}
                      <div className="space-y-2">
                        {selectedDayDataForPanel.transactions.map(
                          (transaction: Transaction) => (
                            <div
                              key={transaction.id}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {transaction.description}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {transaction.category}
                                  </div>
                                </div>
                                <div
                                  className={`font-medium ${
                                    transaction.type === "income"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {transaction.type === "income" ? "+" : "-"}₦
                                  {transaction.amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No transactions for this day
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden mt-6">
          {!showCalendarPanel && (
            <TransactionCalendar
              key={`calendar-mobile-${refreshKey}`}
              onDaySelected={openDayDetailsPanel}
              onAddTransaction={handleFloatingButtonClick}
              onEditTransaction={handleEditTransaction}
            />
          )}
          {showCalendarPanel && (
            <div className="fixed inset-0 bg-background z-50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseCalendarPanel}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="font-semibold">
                    {selectedDateForPanel &&
                      new Date(
                        selectedDateForPanel + "T12:00:00"
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseCalendarPanel}
                >
                  Close
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedDayDataForPanel ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-sm text-center">
                      <div>
                        <div className=" font-medium">Income</div>
                        <div className="text-green-600">
                          ₦{selectedDayDataForPanel.income.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Expense</div>
                        <div className="text-red-600">
                          ₦{selectedDayDataForPanel.expense.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Balance</div>
                        <div
                          className={
                            selectedDayDataForPanel.balance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          ₦
                          {Math.abs(selectedDayDataForPanel.balance).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedDayDataForPanel.transactions.map(
                        (transaction: Transaction) => (
                          <div
                            key={transaction.id}
                            className="p-4 border rounded-lg"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="text-sm">
                                  {transaction.description}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {transaction.category}
                                </div>
                              </div>
                              <div
                                className={`font-medium ${
                                  transaction.type === "income"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}₦
                                {transaction.amount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No transactions for this day
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Button */}
        {!showForm && (
          <Button
            onClick={handleFloatingButtonClick}
            className="fixed bottom-14 right-5 h-12 w-12 rounded-full shadow-lg z-1 cursor-pointer"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="p-4">
              <TransactionForm
                editingTransaction={editingTransaction}
                onTransactionSaved={handleTransactionSaved}
                onCancelEdit={handleCancelForm}
              />
            </div>
          </div>
        )}
      </div>
    </MonthProvider>
  );
}
